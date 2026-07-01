import { apiHandler } from "@/src/lib/server";
import { articlesService } from "@/src/modules/articles/articles.service";

export const GET = apiHandler(async () => {
  return articlesService.list(true);
});
