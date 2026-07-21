import { prisma, logger, Errors } from "@/src/lib/server";
import type { CreateArticleDto, UpdateArticleDto } from "./articles.dto";

const log = logger.child({ module: "articles.service" });

function countWordsInContent(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const n = node as { text?: string; content?: unknown[] };
  if (typeof n.text === "string") return n.text.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(n.content)) {
    let total = 0;
    for (const c of n.content) total += countWordsInContent(c);
    return total;
  }
  return 0;
}

function calcReadTime(content: object): number {
  return Math.max(1, Math.ceil(countWordsInContent(content) / 200));
}

const ARTICLE_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  category: true,
  tags: true,
  readTime: true,
  featured: true,
  published: true,
  publishedAt: true,
  createdAt: true,
  author: { select: { id: true, name: true, image: true, bio: true } },
} as const;

export const articlesService = {
  async list(onlyPublished = true, category?: string | null) {
    return prisma.article.findMany({
      where: {
        ...(onlyPublished
          ? {
              published: true,
              OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
            }
          : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      select: ARTICLE_SELECT,
    });
  },

  async getBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true, image: true, bio: true } } },
    });
    if (!article) throw Errors.notFound("Article");
    return article;
  },

  async getById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, image: true, bio: true } } },
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
        tags: data.tags ?? [],
        featured: data.featured ?? false,
        readTime: calcReadTime(data.content as object),
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
        tags: data.tags ?? undefined,
        featured: data.featured ?? undefined,
        readTime: data.content ? calcReadTime(data.content as object) : undefined,
        publishedAt:
          data.published === false
            ? null
            : data.published === true
              ? data.publishedAt !== undefined
                ? data.publishedAt
                  ? new Date(data.publishedAt)
                  : new Date()
                : (article.publishedAt ?? new Date())
              : undefined,
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
