import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, requireRole } from "@/src/lib/server";
import { requestsService } from "@/src/modules/requests";

const updateStatusSchema = z.object({
  status: z.enum(["new", "in_progress", "completed", "rejected"]),
});

export const PATCH = apiHandler(async (req, context) => {
  await requireRole(["admin", "owner"]);

  const { id } = await context.params;
  const body = updateStatusSchema.parse(await req.json());

  const updated = await requestsService.updateStatus(id, body.status);
  return NextResponse.json(updated);
});
