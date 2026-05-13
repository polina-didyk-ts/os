import { prisma, logger, Errors } from "@/src/lib/server";

const log = logger.child({ module: "requests.service" });

/**
 * Generate ticket number in format YYYY-NNN
 */
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the count of requests created this year
  const startOfYear = new Date(year, 0, 1);
  const count = await prisma.request.count({
    where: {
      createdAt: {
        gte: startOfYear,
      },
    },
  });

  // Format: YYYY-NNN (e.g., 2024-047)
  const number = String(count + 1).padStart(3, "0");
  return `${year}-${number}`;
}

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
    const ticketNumber = await generateTicketNumber();

    const request = await prisma.request.create({
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
