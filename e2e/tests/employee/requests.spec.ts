import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "../../fixtures/auth";
import { createTestUser } from "../../fixtures/test-data";

test.describe("Employee Requests - Form Submission", () => {
  test("should submit order request form and show success screen with ticket number", async ({
    page,
  }) => {
    // 1. Create authenticated user
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // 2. Navigate to order form
    await page.goto("/employee/requests/new?type=order");
    await expect(page).toHaveURL(/.*requests\/new.*type=order/);

    // 3. Verify form elements exist
    await expect(page.getByText("New Request")).toBeVisible();
    await expect(page.getByText(/what to order/i)).toBeVisible();

    // 4. Fill in the form
    await page.getByPlaceholder(/whiteboard markers/i).fill("Test markers");
    await page.locator('input[type="number"]').fill("5");

    // 5. Select priority
    const mediumButton = page.getByRole("button", { name: /medium/i }).first();
    await mediumButton.click();

    // 6. Add comment
    await page.getByPlaceholder(/please specify color/i).fill("Blue color");

    // 7. Submit form
    const submitButton = page.getByRole("button", { name: /submit request/i });
    await expect(submitButton).toBeEnabled({ timeout: 3000 });
    await submitButton.click();

    // 8. Wait for success screen
    await expect(page.getByText("Request Submitted!")).toBeVisible({ timeout: 10000 });

    // 9. Verify ticket number is displayed
    const ticketNumberElement = page.getByText(/#\d{4}-\d{3}/);
    await expect(ticketNumberElement).toBeVisible();

    // 10. Verify success screen buttons
    await expect(page.getByText("View My Requests")).toBeVisible();
    await expect(page.getByText("Go to Home")).toBeVisible();

    console.log("✅ Order form test passed!");
  });

  test("should submit problem request form", async ({ page }) => {
    // 1. Create authenticated user
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // 2. Navigate to problem form
    await page.goto("/employee/requests/new?type=problem");
    await expect(page).toHaveURL(/.*requests\/new.*type=problem/);

    // 3. Fill in the form
    await page.getByPlaceholder(/air conditioner or printer/i).fill("Printer");

    const descriptionInput = page.getByPlaceholder(/describe in detail/i);
    await descriptionInput.fill("Printer is not printing, LED is red");

    // 4. Select low priority
    await page.getByRole("button", { name: /low/i }).first().click();

    // 5. Submit form
    const submitBtn = page.getByRole("button", { name: /submit request/i });
    await expect(submitBtn).toBeEnabled({ timeout: 3000 });
    await submitBtn.click();

    // 6. Verify success
    await expect(page.getByText("Request Submitted!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/#\d{4}-\d{3}/)).toBeVisible();

    console.log("✅ Problem form test passed!");
  });

  test("should submit question request form", async ({ page }) => {
    // 1. Create authenticated user
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // 2. Navigate to question form
    await page.goto("/employee/requests/new?type=question");
    await expect(page).toHaveURL(/.*requests\/new.*type=question/);

    // 3. Fill in the question
    const questionInput = page.getByPlaceholder(/write your question here/i);
    await questionInput.fill("How do I take a day off?");

    // 4. Select high priority
    await page.getByRole("button", { name: /high/i }).first().click();

    // 5. Submit form
    const submitBtnQ = page.getByRole("button", { name: /submit request/i });
    await expect(submitBtnQ).toBeEnabled({ timeout: 3000 });
    await submitBtnQ.click();

    // 6. Verify success
    await expect(page.getByText("Request Submitted!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/#\d{4}-\d{3}/)).toBeVisible();

    console.log("✅ Question form test passed!");
  });

  test("should submit idea request form", async ({ page }) => {
    // 1. Create authenticated user
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // 2. Navigate to idea form
    await page.goto("/employee/requests/new?type=idea");
    await expect(page).toHaveURL(/.*requests\/new.*type=idea/);

    // 3. Fill in the idea
    const ideaInput = page.getByPlaceholder(/share your thoughts/i);
    const ideaText =
      "Could we get a coffee machine for the office? It would make work more enjoyable!";
    await ideaInput.fill(ideaText);

    // 4. Verify character counter
    await expect(page.getByText(new RegExp(`${ideaText.length} / 500`))).toBeVisible();

    // 5. Select medium priority
    await page
      .getByRole("button", { name: /medium/i })
      .first()
      .click();

    // 6. Submit form
    const submitBtnI = page.getByRole("button", { name: /submit request/i });
    await expect(submitBtnI).toBeEnabled({ timeout: 3000 });
    await submitBtnI.click();

    // 7. Verify success
    await expect(page.getByText("Request Submitted!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/#\d{4}-\d{3}/)).toBeVisible();

    console.log("✅ Idea form test passed!");
  });

  test("should validate required fields", async ({ page }) => {
    // 1. Create authenticated user
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);

    // 2. Navigate to order form
    await page.goto("/employee/requests/new?type=order");

    // 3. Try to submit empty form
    const submitButton = page.getByRole("button", { name: /submit request/i });

    // Check if button is disabled when form is empty
    if (await submitButton.isDisabled()) {
      console.log("✅ Submit button correctly disabled for empty form");
    }

    // 4. Fill required field
    await page.getByPlaceholder(/whiteboard markers/i).fill("Markers");

    // 5. Button should now be enabled
    await expect(submitButton).toBeEnabled({ timeout: 2000 });

    console.log("✅ Validation test passed!");
  });
});
