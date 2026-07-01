import { apiHandler } from "@/src/lib/server";
import { articlesService } from "@/src/modules/articles/articles.service";

export const GET = apiHandler(async (_req, { params }) => {
  const { id } = await params;
  return articlesService.getBySlug(id);
});
