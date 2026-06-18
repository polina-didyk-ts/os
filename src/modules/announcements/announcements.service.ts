import { prisma, logger } from "@/src/lib/server";

const log = logger.child({ module: "announcements.service" });

export const announcementsService = {
  async save(subject: string, message: string, recipientEmails: string[]) {
    const users = await prisma.user.findMany({
      where: { email: { in: recipientEmails } },
      select: { id: true },
    });

    const announcement = await prisma.announcement.create({
      data: {
        subject,
        message,
        recipients: {
          create: users.map((u) => ({ userId: u.id })),
        },
      },
    });

    log.info({ announcementId: announcement.id, recipientCount: users.length }, "Announcement saved");
    return announcement;
  },

  async listForUser(userId: string) {
    const rows = await prisma.announcementRecipient.findMany({
      where: { userId },
      orderBy: { announcement: { createdAt: "desc" } },
      include: {
        announcement: { select: { id: true, subject: true, message: true, createdAt: true } },
      },
    });

    return rows.map((r) => ({
      id: r.announcement.id,
      subject: r.announcement.subject,
      message: r.announcement.message,
      createdAt: r.announcement.createdAt,
      readAt: r.readAt,
    }));
  },

  async unreadCount(userId: string) {
    return prisma.announcementRecipient.count({
      where: { userId, readAt: null },
    });
  },

  async markRead(userId: string, announcementId: string) {
    await prisma.announcementRecipient.updateMany({
      where: { userId, announcementId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  async markAllRead(userId: string) {
    await prisma.announcementRecipient.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },
};
