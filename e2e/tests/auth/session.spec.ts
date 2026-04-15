import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "../../fixtures/auth";
import { createTestUser } from "../../fixtures/test-data";

test.describe("Session Management", () => {
  test("should protect routes and redirect to signin when not authenticated", async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto("/app");

    // Should redirect to signin
    await expect(page).toHaveURL("/signin");
  });

  test("should sign out and redirect to home page", async ({ page }) => {
    // Create authenticated user
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // Verify we're on dashboard
    await expect(page).toHaveURL("/app");
    await expect(page.getByTestId("header-user-info")).toBeVisible();

    // Sign out - intentional sign out redirects to home page
    await page.getByTestId("header-signout-button").click();

    // Should redirect to home after intentional sign out
    await expect(page).toHaveURL("/");

    // Try to access protected route - should redirect to signin (session expired/missing)
    await page.goto("/app");
    await expect(page).toHaveURL("/signin");
  });
});
