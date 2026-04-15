import { test, expect } from "@playwright/test";
import { SignUpPage } from "../../pages/auth/signup.page";
import { SignInPage } from "../../pages/auth/signin.page";
import { DashboardPage } from "../../pages/app/dashboard.page";
import { createTestUser } from "../../fixtures/test-data";

test.describe("Sign In", () => {
  test("should sign in existing user", async ({ page }) => {
    // Create and register a test user first
    const user = createTestUser(Date.now());

    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();
    await signUpPage.signUp(user.name, user.email, user.password);

    // Wait for redirect to dashboard
    await expect(page).toHaveURL("/app");

    // Sign out - intentional sign out redirects to home page
    await page.getByTestId("header-signout-button").click();
    await expect(page).toHaveURL("/");

    // Now test sign in
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn(user.email, user.password);

    // Should redirect to dashboard
    await expect(page).toHaveURL("/app");

    // Verify user is logged in
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.userName).toBeVisible();
    await expect(dashboardPage.userName).toContainText(user.name);
  });
});
