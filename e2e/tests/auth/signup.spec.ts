import { test, expect } from "@playwright/test";
import { SignUpPage } from "../../pages/auth/signup.page";
import { DashboardPage } from "../../pages/app/dashboard.page";
import { createTestUser } from "../../fixtures/test-data";

test.describe("Sign Up", () => {
  test("should sign up new user and create organization", async ({ page }) => {
    // Create unique test user for this test
    const user = createTestUser(Date.now());

    // Navigate to sign up page
    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();

    // Fill and submit form
    await signUpPage.signUp(user.name, user.email, user.password);

    // Should redirect to dashboard
    await expect(page).toHaveURL("/app");

    // Verify user is logged in and sees their info
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.userName).toBeVisible();
    await expect(dashboardPage.userName).toContainText(user.name);
    await expect(dashboardPage.userEmail).toContainText(user.email);
    await expect(dashboardPage.successMessage).toBeVisible();
  });
});
