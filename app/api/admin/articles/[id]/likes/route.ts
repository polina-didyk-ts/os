import { apiHandler, requireSession, Errors } from "@/src/lib/server";
import { articleInteractionsService } from "@/src/modules/article-interactions/article-interactions.service";

export const GET = apiHandler(async (_req, { params }) => {
  const session = await requireSession();
  if (session.user.role !== "admin") throw Errors.forbidden("Admins only");
  const { id } = await params;
  return articleInteractionsService.getLikers(id);
});
