import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/src/lib/server";
import { announcementsService } from "@/src/modules/announcements/announcements.service";

export const POST = apiHandler(async () => {
  const session = await requireSession();
  await announcementsService.markAllRead(session.user.id);
  return NextResponse.json({ ok: true });
});
