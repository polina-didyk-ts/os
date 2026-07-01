import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/src/lib/server";
import { articlesService } from "@/src/modules/articles/articles.service";
import { createArticleSchema } from "@/src/modules/articles/articles.dto";

export const GET = apiHandler(async () => {
  await requireSession();
  return articlesService.list(false);
});

export const POST = apiHandler(async (req) => {
  const session = await requireSession();
  const data = createArticleSchema.parse(await req.json());
  const article = await articlesService.create(session.user.id, data);
  return NextResponse.json(article, { status: 201 });
});
