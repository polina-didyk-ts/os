import { prisma, logger, Errors } from "@/src/lib/server";
import type { CreateNoteDto, UpdateNoteDto } from "./notes.dto";

const log = logger.child({ module: "notes.service" });

export const notesService = {
  /**
   * List all notes in an organization
   * Changed from user-scoped to org-scoped
   */
  async listNotes(organizationId: string) {
    log.debug({ organizationId }, "Listing notes");

    const notes = await prisma.note.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    log.info({ organizationId, count: notes.length }, "Notes listed");
    return notes;
  },

  /**
   * Get a single note
   * Verify it belongs to the organization
   */
  async getNote(organizationId: string, noteId: string) {
    log.debug({ organizationId, noteId }, "Getting note");

    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw Errors.notFound("Note");
    }

    // CHANGED: Check org ownership instead of user ownership
    if (note.organizationId !== organizationId) {
      throw Errors.forbidden("No access to this note");
    }

    log.info({ organizationId, noteId }, "Note retrieved");
    return note;
  },

  /**
   * Create a note in the organization
   * Still track which user created it
   */
  async createNote(userId: string, organizationId: string, data: CreateNoteDto) {
    log.debug({ userId, organizationId }, "Creating note");

    const note = await prisma.note.create({
      data: {
        ...data,
        userId, // Track creator
        organizationId, // NEW: Scope to organization
      },
    });

    log.info({ userId, organizationId, noteId: note.id }, "Note created");
    return note;
  },

  /**
   * Update a note
   * Verify org ownership
   */
  async updateNote(organizationId: string, noteId: string, data: UpdateNoteDto) {
    log.debug({ organizationId, noteId }, "Updating note");

    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      throw Errors.notFound("Note");
    }

    // CHANGED: Check org ownership
    if (existingNote.organizationId !== organizationId) {
      throw Errors.forbidden("No access to this note");
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data,
    });

    log.info({ organizationId, noteId }, "Note updated");
    return note;
  },

  /**
   * Delete a note
   * Verify org ownership
   */
  async deleteNote(organizationId: string, noteId: string) {
    log.debug({ organizationId, noteId }, "Deleting note");

    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      throw Errors.notFound("Note");
    }

    // CHANGED: Check org ownership
    if (existingNote.organizationId !== organizationId) {
      throw Errors.forbidden("No access to this note");
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    log.info({ organizationId, noteId }, "Note deleted");
  },
};
