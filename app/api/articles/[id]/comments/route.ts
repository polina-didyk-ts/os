import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/src/lib/server";
import { articleInteractionsService } from "@/src/modules/article-interactions/article-interactions.service";
import { createCommentSchema } from "@/src/modules/article-interactions/article-interactions.dto";

export const GET = apiHandler(async (_req, { params }) => {
  await requireSession();
  const { id } = await params;
  return articleInteractionsService.getComments(id);
});

export const POST = apiHandler(async (req, { params }) => {
  const session = await requireSession();
  const { id } = await params;
  const data = createCommentSchema.parse(await req.json());
  const comment = await articleInteractionsService.createComment(id, session.user.id, data);
  return NextResponse.json(comment, { status: 201 });
});
