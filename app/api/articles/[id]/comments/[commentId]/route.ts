import { apiHandler, requireSession } from "@/src/lib/server";
import { articleInteractionsService } from "@/src/modules/article-interactions/article-interactions.service";
import { updateCommentSchema } from "@/src/modules/article-interactions/article-interactions.dto";

export const PATCH = apiHandler(async (req, { params }) => {
  const session = await requireSession();
  const { commentId } = await params;
  const data = updateCommentSchema.parse(await req.json());
  return articleInteractionsService.updateComment(commentId, session.user.id, data);
});

export const DELETE = apiHandler(async (_req, { params }) => {
  const session = await requireSession();
  const { commentId } = await params;
  const isAdmin = session.user.role === "admin";
  await articleInteractionsService.deleteComment(commentId, session.user.id, isAdmin);
  return null;
});
