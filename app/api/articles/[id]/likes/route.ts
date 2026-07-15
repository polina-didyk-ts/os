import { apiHandler, requireSession } from "@/src/lib/server";
import { articleInteractionsService } from "@/src/modules/article-interactions/article-interactions.service";

export const GET = apiHandler(async (_req, { params }) => {
  const session = await requireSession();
  const { id } = await params;
  return articleInteractionsService.getLikes(id, session.user.id);
});

export const POST = apiHandler(async (_req, { params }) => {
  const session = await requireSession();
  const { id } = await params;
  return articleInteractionsService.toggleLike(id, session.user.id);
});
