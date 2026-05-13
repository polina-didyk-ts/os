import { prisma, logger, Errors } from "@/src/lib/server";

const log = logger.child({ module: "requests.service" });

export const requestsService = {
  async create(
    userId: string,
    data: {
      type: string;
      priority: string;
      what?: string;
      quantity?: number;
      description?: string;
      question?: string;
      idea?: string;
      comment?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear();

      // Serialize concurrent ticket generation for the same year at the DB level.
      // Advisory lock is scoped to this transaction and released automatically on commit/rollback.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${year})`;

      const count = await tx.request.count({
        where: { createdAt: { gte: new Date(year, 0, 1) } },
      });

      const ticketNumber = `${year}-${String(count + 1).padStart(3, "0")}`;

      const request = await tx.request.create({
        data: {
          ticketNumber,
          type: data.type,
          priority: data.priority,
          status: "new",
          userId,
          metadata: {
            what: data.what,
            quantity: data.quantity,
            description: data.description,
            question: data.question,
            idea: data.idea,
            comment: data.comment,
          },
        },
      });

      log.info({ requestId: request.id, userId, ticketNumber, type: data.type }, "Request created");
      return request;
    });
  },

  async getByIdForUser(userId: string, id: string) {
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request || request.userId !== userId) throw Errors.notFound("Request");
    return request;
  },

  async getByIdForAdmin(id: string) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!request) throw Errors.notFound("Request");
    return request;
  },

  async listByUser(userId: string, limit = 20, offset = 0) {
    return prisma.request.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        _count: { select: { comments: true } },
      },
    });
  },

  // No org-scoping by design — single-tenant product, all admins see all requests company-wide.
  async listAll(filters: { status?: string; type?: string } = {}, limit = 50, offset = 0) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [items, total] = await Promise.all([
      prisma.request.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.request.count({ where }),
    ]);

    log.info({ filters, total }, "Admin listed all requests");
    return { items, total };
  },

  async updateStatus(id: string, status: string) {
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) throw Errors.notFound("Request");

    const updated = await prisma.request.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    log.info({ requestId: id, status }, "Admin updated request status");
    return updated;
  },
};
