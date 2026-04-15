import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "../../fixtures/auth";
import { DashboardPage } from "../../pages/app/dashboard.page";
import { createTestUser } from "../../fixtures/test-data";

test.describe("Dashboard", () => {
  test("should load dashboard and display user information", async ({ page }) => {
    // Create authenticated user
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // Navigate to dashboard (should already be there)
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Verify user information is displayed
    await expect(dashboardPage.userInfo).toBeVisible();
    await expect(dashboardPage.userName).toContainText(user.name);
    await expect(dashboardPage.userEmail).toContainText(user.email);
    await expect(dashboardPage.successMessage).toBeVisible();
    await expect(dashboardPage.successMessage).toContainText("Authentication verified");
  });
});
