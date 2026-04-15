import { prisma, logger, Errors } from "@/src/lib/server";

const log = logger.child({ module: "comments.service" });

export const commentsService = {
  async create(requestId: string, authorId: string, text: string) {
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) throw Errors.notFound("Request");

    const comment = await prisma.comment.create({
      data: { requestId, authorId, text },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    log.info({ commentId: comment.id, requestId, authorId }, "Comment created");
    return comment;
  },

  async listByRequest(requestId: string, requestingUserId: string) {
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) throw Errors.notFound("Request");

    // Allow access only to request owner or admin (checked at route level)
    const comments = await prisma.comment.findMany({
      where: { requestId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return comments;
  },
};
