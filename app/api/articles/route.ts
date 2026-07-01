import { apiHandler } from "@/src/lib/server";
import { articlesService } from "@/src/modules/articles/articles.service";

export const GET = apiHandler(async (req) => {
  const category = new URL(req.url).searchParams.get("category");
  return articlesService.list(true, category || null);
});
