import { apiHandler, requireSession } from "@/src/lib/server";
import { articlesService } from "@/src/modules/articles/articles.service";
import { updateArticleSchema } from "@/src/modules/articles/articles.dto";

export const GET = apiHandler(async (_req, { params }) => {
  await requireSession();
  const { id } = await params;
  return articlesService.getById(id);
});

export const PATCH = apiHandler(async (req, { params }) => {
  await requireSession();
  const { id } = await params;
  const data = updateArticleSchema.parse(await req.json());
  return articlesService.update(id, data);
});

export const DELETE = apiHandler(async (_req, { params }) => {
  await requireSession();
  const { id } = await params;
  await articlesService.delete(id);
  return { success: true };
});
