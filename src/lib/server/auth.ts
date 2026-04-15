import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { headers } from "next/headers";
import { prisma } from "./db";
import { logger } from "./logger";
import { Errors } from "./errors";
import { organizationsService } from "@/src/modules/organizations";

const log = logger.child({ module: "auth" });

const EMPLOYEE_ALLOWED_DOMAIN = "tech-stack.io";

/**
 * Validate email domain for employee access
 */
function validateEmployeeDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain === EMPLOYEE_ALLOWED_DOMAIN;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    expo(),
    admin({
      defaultRole: "employee",
    }),
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      async sendInvitationEmail(data) {
        // TODO: Implement email sending service (Resend, SendGrid, etc.)
        log.warn(
          { organizationId: data.organization.id, email: data.email, role: data.role },
          "Email service not configured - invitation email not sent"
        );
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Validate email domain for Google OAuth users
          if (!validateEmployeeDomain(user.email)) {
            log.warn({ email: user.email }, `Sign-in attempted with non-allowed domain`);
            throw new Error(`Only ${EMPLOYEE_ALLOWED_DOMAIN} email addresses are allowed`);
          }
        },
        after: async (user) => {
          log.info(
            { userId: user.id, email: user.email },
            "New user created, setting up organization"
          );

          try {
            // Create personal organization for new user
            const orgName = user.name
              ? `${user.name}'s Organization`
              : `${user.email.split("@")[0]}'s Organization`;

            const organization = await prisma.organization.create({
              data: {
                name: orgName,
                slug: `user-${user.id}`,
                metadata: {
                  isPersonal: true,
                  createdAt: new Date().toISOString(),
                },
                members: {
                  create: {
                    userId: user.id,
                    role: "owner",
                  },
                },
              },
            });

            log.info(
              { userId: user.id, organizationId: organization.id },
              "Personal organization created for new user"
            );
          } catch (error) {
            log.error({ userId: user.id, error }, "Failed to create organization for new user");
            // Don't throw - allow signup to succeed even if org creation fails
            // User can be manually assigned to an org later
          }
        },
      },
    },
  },
  trustedOrigins: (
    process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? ["http://localhost:3000"]
  ).concat(["exp://"]),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
});

/**
 * Get authenticated session or null (doesn't throw)
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Get authenticated session or throw 401
 */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw Errors.unauthorized("Authentication required");
  }

  return session;
}

/**
 * Get user's organization context
 * Since each user has exactly 1 org, this is straightforward
 */
export async function getOrganizationContext() {
  const session = await requireSession();

  // Get user's organization (enforces 1-user-1-org)
  const { organization, role } = await organizationsService.getUserOrganization(session.user.id);

  return {
    session,
    user: session.user,
    organization,
    role,
  };
}

/**
 * Verify user has one of the required roles
 */
export async function requireRole(requiredRoles: string[]) {
  const context = await getOrganizationContext();

  if (!organizationsService.hasRole(context.role, requiredRoles)) {
    throw Errors.forbidden(`Required role: ${requiredRoles.join(" or ")}`);
  }

  return context;
}
