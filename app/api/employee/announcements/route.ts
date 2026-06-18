import { apiHandler, requireSession } from "@/src/lib/server";
import { announcementsService } from "@/src/modules/announcements/announcements.service";

export const GET = apiHandler(async () => {
  const session = await requireSession();
  return announcementsService.listForUser(session.user.id);
});
