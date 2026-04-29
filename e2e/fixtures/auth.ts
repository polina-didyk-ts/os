import { Page } from "@playwright/test";
import { TestUser } from "./test-data";

/**
 * Creates a user via the Better Auth API and establishes a session.
 * Uses email/password auth (enabled in auth.ts) instead of UI signup,
 * since the app has no separate signup page and requires @tech-stack.io emails.
 */
export async function createAuthenticatedUser(page: Page, user: TestUser): Promise<void> {
  // Register via API — Better Auth sets the session cookie in the response
  const signUpRes = await page.request.post("/api/auth/sign-up/email", {
    data: { email: user.email, password: user.password, name: user.name },
  });

  if (!signUpRes.ok()) {
    throw new Error(`Sign-up failed (${signUpRes.status()}): ${await signUpRes.text()}`);
  }

  // Navigate to confirm the session cookie works
  await page.goto("/employee");
}
