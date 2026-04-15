import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "../../fixtures/auth";
import { NotesPage } from "../../pages/app/notes.page";
import { createTestUser, createTestNote } from "../../fixtures/test-data";

test.describe("Notes CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    // Create authenticated user before each test
    const user = createTestUser(Date.now());
    await createAuthenticatedUser(page, user);
  });

  test("should display empty state when no notes exist", async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();

    // Verify empty state is shown
    await expect(notesPage.emptyState).toBeVisible();
    await expect(page.getByText("No notes yet")).toBeVisible();
  });

  test("should create a new note", async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();

    const note = createTestNote(Date.now());

    // Create note
    await notesPage.createNote(note.title, note.content);

    // Verify note appears in list
    await expect(notesPage.notesList).toBeVisible();
    const noteCard = await notesPage.getNoteCard(note.title);
    await expect(noteCard).toBeVisible();
  });

  test("should edit an existing note", async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();

    const note = createTestNote(1);
    const updatedNote = createTestNote(2);

    // Create initial note
    await notesPage.createNote(note.title, note.content);

    // Edit the note
    await notesPage.editNote(note.title, updatedNote.title, updatedNote.content);

    // Verify updated note appears
    const noteCard = await notesPage.getNoteCard(updatedNote.title);
    await expect(noteCard).toBeVisible();

    // Verify old note is gone
    await expect(page.getByTestId(`note-card-${note.title}`)).not.toBeVisible();
  });

  test("should delete a note", async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();

    const note = createTestNote(Date.now());

    // Create note
    await notesPage.createNote(note.title, note.content);

    // Verify note exists
    const noteCard = await notesPage.getNoteCard(note.title);
    await expect(noteCard).toBeVisible();

    // Delete note
    await notesPage.deleteNote(note.title);

    // Verify note is removed
    await expect(page.getByTestId(`note-card-${note.title}`)).not.toBeVisible();

    // Should show empty state again
    await expect(notesPage.emptyState).toBeVisible();
  });

  test("should expand and collapse note content", async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();

    const note = createTestNote(Date.now());

    // Create note
    await notesPage.createNote(note.title, note.content);

    // Expand note by clicking card
    await notesPage.expandNote(note.title);

    // Verify content is visible
    await expect(page.getByTestId("note-content")).toBeVisible();
    await expect(page.getByTestId("note-content")).toContainText(note.content);
  });
});
