import { test, expect } from "@playwright/test";
import { signUp } from "../../fixtures/auth";
import { NotesPage } from "../../pages/app/notes.page";
import { createTestUser, createTestNote } from "../../fixtures/test-data";

test.describe("Notes Authorization", () => {
  test("should isolate notes by organization", async ({ page }) => {
    // Create two separate users (each gets their own organization)
    const user1 = createTestUser(Date.now());
    const user2 = createTestUser(Date.now() + 1);

    const note1 = createTestNote(1);
    const note2 = createTestNote(2);

    // User 1: Create note
    await signUp(page, user1);
    const notesPage1 = new NotesPage(page);
    await notesPage1.goto();
    await notesPage1.createNote(note1.title, note1.content);

    // Verify user 1 sees their note
    await expect(await notesPage1.getNoteCard(note1.title)).toBeVisible();

    // Sign out user 1
    await page.getByTestId("header-signout-button").click();

    // User 2: Create note in their own organization
    await signUp(page, user2);
    const notesPage2 = new NotesPage(page);
    await notesPage2.goto();
    await notesPage2.createNote(note2.title, note2.content);

    // User 2 should see only their note
    await expect(await notesPage2.getNoteCard(note2.title)).toBeVisible();
    await expect(page.getByTestId(`note-card-${note1.title}`)).not.toBeVisible();

    // Verify count
    const noteCount = await notesPage2.getNoteCount();
    expect(noteCount).toBe(1);
  });

  test("should return 401 for unauthenticated API requests", async ({ page }) => {
    // Try to fetch notes without authentication
    const response = await page.request.get("/api/notes");

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });
});
