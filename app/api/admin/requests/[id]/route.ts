import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, requireRole, sendRequestUpdateEmail } from "@/src/lib/server";
import { requestsService } from "@/src/modules/requests";
import { commentsService } from "@/src/modules/comments/comments.service";

const updateSchema = z.object({
  status:  z.enum(["new", "in_progress", "completed", "rejected"]),
  comment: z.string().min(1).max(2000).optional(),
});

export const PATCH = apiHandler(async (req, context) => {
  const { user } = await requireRole(["admin", "owner"]);
  const { id }   = await context.params;
  const body     = updateSchema.parse(await req.json());

  const updated = await requestsService.updateStatus(id, body.status);

  if (body.comment) {
    await commentsService.create(id, user.id, body.comment);
  }

  await sendRequestUpdateEmail({
    to:           updated.user.email,
    userName:     updated.user.name ?? updated.user.email,
    ticketNumber: updated.ticketNumber,
    newStatus:    body.status,
    comment:      body.comment,
  });

  return NextResponse.json(updated);
});
