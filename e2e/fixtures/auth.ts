import { Page } from "@playwright/test";
import { TestUser } from "./test-data";

/**
 * Signs up a new user via the UI
 * @param page - Playwright page object
 * @param user - Test user data
 */
export async function signUp(page: Page, user: TestUser): Promise<void> {
  await page.goto("/signup");
  await page.getByTestId("signup-name-input").fill(user.name);
  await page.getByTestId("signup-email-input").fill(user.email);
  await page.getByTestId("signup-password-input").fill(user.password);
  await page.getByTestId("signup-submit-button").click();

  // Wait for redirect to dashboard
  await page.waitForURL("/app", { timeout: 20000 });
}

/**
 * Signs in an existing user via the UI
 * @param page - Playwright page object
 * @param user - Test user credentials
 */
export async function signIn(page: Page, user: TestUser): Promise<void> {
  await page.goto("/signin");
  await page.getByTestId("signin-email-input").fill(user.email);
  await page.getByTestId("signin-password-input").fill(user.password);
  await page.getByTestId("signin-submit-button").click();

  // Wait for redirect to dashboard
  await page.waitForURL("/app", { timeout: 20000 });
}

/**
 * Signs out the current user via the UI
 * @param page - Playwright page object
 */
export async function signOut(page: Page): Promise<void> {
  await page.getByTestId("header-signout-button").click();

  // Wait for redirect to home
  await page.waitForURL("/", { timeout: 5000 });
}

/**
 * Creates a user and signs in, returning the page in an authenticated state
 * Useful for tests that need to start with an authenticated user
 * @param page - Playwright page object
 * @param user - Test user data
 */
export async function createAuthenticatedUser(page: Page, user: TestUser): Promise<void> {
  await signUp(page, user);
}

/**
 * Checks if the current page is authenticated by looking for user info
 * @param page - Playwright page object
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.getByTestId("header-user-info").waitFor({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
