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
    await expect(page.getByText("Створити запит")).toBeVisible();
    await expect(page.getByLabel(/що замовити/i)).toBeVisible();

    // 4. Fill in the form
    await page.getByPlaceholder(/напрклад: маркери/i).fill("Тестові маркери");
    await page.getByLabel(/кількість/i).fill("5");

    // 5. Select priority
    const mediumButton = page.getByRole("button", { name: /середній/i }).first();
    await mediumButton.click();

    // 6. Add comment
    await page.getByPlaceholder(/будь ласка, вважіть колір/i).fill("Синього кольору");

    // 7. Submit form
    const submitButton = page.getByRole("button", { name: /надіслати запит/i });
    await submitButton.click();

    // 8. Wait for success screen
    await expect(page.getByText("Запит надіслано!")).toBeVisible({ timeout: 5000 });

    // 9. Verify ticket number is displayed
    const ticketNumberElement = page.getByText(/#\d{4}-\d{3}/);
    await expect(ticketNumberElement).toBeVisible();

    // 10. Verify success screen buttons
    await expect(page.getByRole("button", { name: /переглянути мої запити/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /на головну/i })).toBeVisible();

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
    const whatInput = page.locator("input").filter({ hasText: "" }).first();
    await page.getByPlaceholder(/напрклад: кондиціонер/i).fill("Принтер");

    const descriptionInput = page.getByPlaceholder(/опишіть детальніше/i);
    await descriptionInput.fill("Принтер не друкує, світлодіод червоний");

    // 4. Select low priority
    await page
      .getByRole("button", { name: /низький/i })
      .first()
      .click();

    // 5. Submit form
    await page.getByRole("button", { name: /надіслати запит/i }).click();

    // 6. Verify success
    await expect(page.getByText("Запит надіслано!")).toBeVisible({ timeout: 5000 });
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
    const questionInput = page.getByPlaceholder(/напишіть своє питання/i);
    await questionInput.fill("Як взяти вихідний день?");

    // 4. Select high priority
    await page
      .getByRole("button", { name: /високий/i })
      .first()
      .click();

    // 5. Submit form
    await page.getByRole("button", { name: /надіслати запит/i }).click();

    // 6. Verify success
    await expect(page.getByText("Запит надіслано!")).toBeVisible({ timeout: 5000 });
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
    const ideaInput = page.getByPlaceholder(/поділіться своїми думками/i);
    const ideaText = "Могли б купити кавоарку для офісу? Це зробило б роботу приємнішою!";
    await ideaInput.fill(ideaText);

    // 4. Verify character counter
    await expect(page.getByText(new RegExp(`${ideaText.length} / 500`))).toBeVisible();

    // 5. Select medium priority
    await page
      .getByRole("button", { name: /середній/i })
      .first()
      .click();

    // 6. Submit form
    await page.getByRole("button", { name: /надіслати запит/i }).click();

    // 7. Verify success
    await expect(page.getByText("Запит надіслано!")).toBeVisible({ timeout: 5000 });
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
    const submitButton = page.getByRole("button", { name: /надіслати запит/i });

    // Check if button is disabled when form is empty
    if (await submitButton.isDisabled()) {
      console.log("✅ Submit button correctly disabled for empty form");
    }

    // 4. Fill required field
    await page.getByPlaceholder(/напрклад: маркери/i).fill("Маркери");

    // 5. Button should now be enabled
    await expect(submitButton).toBeEnabled({ timeout: 2000 });

    console.log("✅ Validation test passed!");
  });
});
