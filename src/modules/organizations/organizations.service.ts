import { prisma, logger, Errors } from "@/src/lib/server";

const log = logger.child({ module: "organizations.service" });

export const organizationsService = {
  /**
   * Get user's organization (enforces 1-user-1-org constraint)
   * Every user MUST have exactly one organization
   */
  async getUserOrganization(userId: string) {
    log.debug({ userId }, "Getting user organization");

    const member = await prisma.member.findFirst({
      where: { userId },
      include: {
        organization: true,
      },
    });

    if (!member) {
      throw Errors.notFound("User organization not found. Please contact support.");
    }

    log.info({ userId, organizationId: member.organizationId }, "User organization retrieved");
    return {
      organization: member.organization,
      role: member.role,
      membership: member,
    };
  },

  /**
   * Verify user has access to organization and return their role
   */
  async verifyOrganizationAccess(userId: string, organizationId: string) {
    log.debug({ userId, organizationId }, "Verifying organization access");

    const member = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!member) {
      throw Errors.forbidden("No access to this organization");
    }

    return member;
  },

  /**
   * Check if user has specific role
   */
  hasRole(memberRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(memberRole);
  },

  /**
   * Auto-create personal organization for new users
   * Called during signup flow
   */
  async createPersonalOrganization(userId: string, userEmail: string, userName?: string) {
    log.debug({ userId }, "Creating personal organization for new user");

    const orgName = userName
      ? `${userName}'s Organization`
      : `${userEmail.split("@")[0]}'s Organization`;

    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug: `user-${userId}`,
        metadata: {
          isPersonal: true,
          createdAt: new Date().toISOString(),
        },
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
      include: {
        members: true,
      },
    });

    log.info({ userId, organizationId: organization.id }, "Personal organization created");
    return organization;
  },
};
