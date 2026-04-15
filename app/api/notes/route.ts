import { NextResponse } from "next/server";
import { apiHandler, getOrganizationContext } from "@/src/lib/server";
import { notesService } from "@/src/modules/notes/notes.service";
import { createNoteSchema } from "@/src/modules/notes/notes.dto";

export const GET = apiHandler(async () => {
  // Auth check: getOrganizationContext() verifies user is authenticated
  // and returns their organization (throws 401 if not authenticated)
  const { organization } = await getOrganizationContext();

  // List all notes in user's organization
  return notesService.listNotes(organization.id);
});

export const POST = apiHandler(async (req) => {
  // Auth check: getOrganizationContext() verifies user is authenticated
  // and returns their organization (throws 401 if not authenticated)
  const { user, organization } = await getOrganizationContext();

  const data = createNoteSchema.parse(await req.json());

  // Create note in user's organization (tracks creator via userId)
  const note = await notesService.createNote(user.id, organization.id, data);
  return NextResponse.json(note, { status: 201 });
});
