import { Page, Locator } from "@playwright/test";

export class NotesPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly emptyState: Locator;
  readonly notesList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByTestId("notes-create-button");
    this.emptyState = page.getByTestId("notes-empty-state");
    this.notesList = page.getByTestId("notes-list");
  }

  async goto() {
    await this.page.goto("/app/notes");
  }

  async openCreateDialog() {
    await this.createButton.click();
    await this.page.getByTestId("note-dialog").waitFor();
  }

  async createNote(title: string, content: string = "") {
    await this.openCreateDialog();
    await this.page.getByTestId("note-dialog-title-input").fill(title);
    if (content) {
      await this.page.getByTestId("note-dialog-content-input").fill(content);
    }
    await this.page.getByTestId("note-dialog-save-button").click();

    // Wait for dialog to close
    await this.page.getByTestId("note-dialog").waitFor({ state: "hidden" });
  }

  async getNoteCard(title: string): Promise<Locator> {
    return this.page.getByTestId(`note-card-${title}`);
  }

  async openEditDialog(title: string) {
    const card = await this.getNoteCard(title);
    await card.getByTestId("note-edit-button").click();
    await this.page.getByTestId("note-dialog").waitFor();
  }

  async editNote(oldTitle: string, newTitle: string, newContent: string = "") {
    await this.openEditDialog(oldTitle);

    const titleInput = this.page.getByTestId("note-dialog-title-input");
    await titleInput.clear();
    await titleInput.fill(newTitle);

    if (newContent) {
      const contentInput = this.page.getByTestId("note-dialog-content-input");
      await contentInput.clear();
      await contentInput.fill(newContent);
    }

    await this.page.getByTestId("note-dialog-save-button").click();

    // Wait for dialog to close
    await this.page.getByTestId("note-dialog").waitFor({ state: "hidden" });
  }

  async deleteNote(title: string) {
    const card = await this.getNoteCard(title);

    // Handle native browser confirm dialog
    this.page.on("dialog", (dialog) => dialog.accept());

    await card.getByTestId("note-delete-button").click();

    // Wait for the note to be removed from DOM
    await card.waitFor({ state: "detached" });
  }

  async expandNote(title: string) {
    const card = await this.getNoteCard(title);
    // Click the card itself to expand (entire card is clickable)
    await card.click();
  }

  async getNoteContent(title: string): Promise<string> {
    const card = await this.getNoteCard(title);
    const content = card.getByTestId("note-content");
    return (await content.textContent()) || "";
  }

  async getNoteCount(): Promise<number> {
    const notes = await this.page.getByTestId(/^note-card-/).all();
    return notes.length;
  }

  async hasEmptyState(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }
}
