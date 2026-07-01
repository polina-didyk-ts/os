import { prisma, logger, Errors } from "@/src/lib/server";
import type { CreateArticleDto, UpdateArticleDto } from "./articles.dto";

const log = logger.child({ module: "articles.service" });

export const articlesService = {
  async list(onlyPublished = true, category?: string | null) {
    return prisma.article.findMany({
      where: {
        ...(onlyPublished ? { published: true } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    });
  },

  async getBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!article) throw Errors.notFound("Article");
    return article;
  },

  async getById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!article) throw Errors.notFound("Article");
    return article;
  },

  async create(authorId: string, data: CreateArticleDto) {
    const existing = await prisma.article.findUnique({ where: { slug: data.slug } });
    if (existing) throw Errors.forbidden("Slug already in use");

    const article = await prisma.article.create({
      data: {
        ...data,
        content: data.content as object,
        coverImage: data.coverImage || null,
        publishedAt: data.published
          ? data.publishedAt
            ? new Date(data.publishedAt)
            : new Date()
          : null,
        authorId,
      },
    });
    log.info({ articleId: article.id, authorId }, "Article created");
    return article;
  },

  async update(id: string, data: UpdateArticleDto) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw Errors.notFound("Article");

    if (data.slug && data.slug !== article.slug) {
      const existing = await prisma.article.findUnique({ where: { slug: data.slug } });
      if (existing) throw Errors.forbidden("Slug already in use");
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...data,
        content: data.content as object | undefined,
        coverImage: data.coverImage ?? undefined,
        publishedAt: data.published && !article.publishedAt ? new Date() : undefined,
      },
    });
    log.info({ articleId: id }, "Article updated");
    return updated;
  },

  async delete(id: string) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw Errors.notFound("Article");
    await prisma.article.delete({ where: { id } });
    log.info({ articleId: id }, "Article deleted");
  },
};
