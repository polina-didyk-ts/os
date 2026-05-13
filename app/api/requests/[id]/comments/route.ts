import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, requireSession, requireRole, getOrganizationContext, prisma } from "@/src/lib/server";
import { commentsService } from "@/src/modules/comments/comments.service";

const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
});

// POST /api/requests/[id]/comments — admin only
export const POST = apiHandler(async (req, context) => {
  const { user } = await requireRole(["admin", "owner"]);
  const { id: requestId } = await context.params;

  const body = createCommentSchema.parse(await req.json());
  const comment = await commentsService.create(requestId, user.id, body.text);

  return NextResponse.json(comment, { status: 201 });
});

// GET /api/requests/[id]/comments — admin or request owner
export const GET = apiHandler(async (_req, context) => {
  const session = await requireSession();
  const { id: requestId } = await context.params;

  const { role } = await getOrganizationContext();
  const isAdmin = ["admin", "owner"].includes(role);

  if (!isAdmin) {
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request || request.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return commentsService.listByRequest(requestId, session.user.id);
});
