import { z } from "zod";

export const ARTICLE_CATEGORIES = ["News", "Guides", "Office Life", "Events"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const createArticleSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  excerpt: z.string().max(500).optional(),
  content: z.record(z.string(), z.unknown()),
  coverImage: z.string().url().optional().or(z.literal("")),
  category: z.enum(ARTICLE_CATEGORIES).optional().nullable(),
  published: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleDto = z.infer<typeof createArticleSchema>;
export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;
