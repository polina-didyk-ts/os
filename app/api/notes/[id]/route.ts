import { NextResponse } from "next/server";
import { apiHandler, getOrganizationContext } from "@/src/lib/server";
import { notesService } from "@/src/modules/notes/notes.service";
import { updateNoteSchema } from "@/src/modules/notes/notes.dto";

export const GET = apiHandler(async (_req, context) => {
  // Auth check: getOrganizationContext() verifies user is authenticated
  // and returns their organization (throws 401 if not authenticated)
  const { organization } = await getOrganizationContext();

  const { id } = await context.params;

  // Verify note belongs to user's organization (throws 403 if not)
  return notesService.getNote(organization.id, id);
});

export const PATCH = apiHandler(async (req, context) => {
  // Auth check: getOrganizationContext() verifies user is authenticated
  // and returns their organization (throws 401 if not authenticated)
  const { organization } = await getOrganizationContext();

  const { id } = await context.params;
  const data = updateNoteSchema.parse(await req.json());

  // Verify note belongs to user's organization (throws 403 if not)
  return notesService.updateNote(organization.id, id, data);
});

export const DELETE = apiHandler(async (_req, context) => {
  // Auth check: getOrganizationContext() verifies user is authenticated
  // and returns their organization (throws 401 if not authenticated)
  const { organization } = await getOrganizationContext();

  const { id } = await context.params;

  // Verify note belongs to user's organization (throws 403 if not)
  await notesService.deleteNote(organization.id, id);
  return new NextResponse(null, { status: 204 });
});
