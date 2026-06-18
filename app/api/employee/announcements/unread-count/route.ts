import { apiHandler, requireSession } from "@/src/lib/server";
import { announcementsService } from "@/src/modules/announcements/announcements.service";

export const GET = apiHandler(async () => {
  const session = await requireSession();
  const count = await announcementsService.unreadCount(session.user.id);
  return { count };
});
