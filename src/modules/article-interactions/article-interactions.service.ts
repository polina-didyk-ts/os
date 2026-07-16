import { prisma, Errors } from "@/src/lib/server";
import type { CreateCommentDto, UpdateCommentDto } from "./article-interactions.dto";

export const articleInteractionsService = {
  async toggleLike(articleId: string, userId: string) {
    const existing = await prisma.articleLike.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });

    if (existing) {
      await prisma.articleLike.delete({ where: { id: existing.id } });
      return { liked: false };
    }

    await prisma.articleLike.create({ data: { articleId, userId } });
    return { liked: true };
  },

  async getLikes(articleId: string, userId: string) {
    const [count, like] = await Promise.all([
      prisma.articleLike.count({ where: { articleId } }),
      prisma.articleLike.findUnique({
        where: { articleId_userId: { articleId, userId } },
      }),
    ]);
    return { count, liked: !!like };
  },

  async getLikers(articleId: string) {
    return prisma.articleLike.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  async getComments(articleId: string) {
    return prisma.articleComment.findMany({
      where: { articleId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  async createComment(articleId: string, authorId: string, data: CreateCommentDto) {
    return prisma.articleComment.create({
      data: { articleId, authorId, content: data.content },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  async updateComment(commentId: string, userId: string, data: UpdateCommentDto) {
    const comment = await prisma.articleComment.findUnique({ where: { id: commentId } });
    if (!comment) throw Errors.notFound("Comment");
    if (comment.authorId !== userId) throw Errors.forbidden("Not your comment");

    return prisma.articleComment.update({
      where: { id: commentId },
      data: { content: data.content },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const comment = await prisma.articleComment.findUnique({ where: { id: commentId } });
    if (!comment) throw Errors.notFound("Comment");
    if (!isAdmin && comment.authorId !== userId) throw Errors.forbidden("Not your comment");

    await prisma.articleComment.delete({ where: { id: commentId } });
  },
};
