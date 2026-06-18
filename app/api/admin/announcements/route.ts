import { NextResponse } from "next/server";
import { apiHandler, requireRole, sendAnnouncementEmail } from "@/src/lib/server";
import { announcementsService } from "@/src/modules/announcements/announcements.service";
import { sendAnnouncementSchema } from "@/src/modules/announcements/announcements.dto";

export const POST = apiHandler(async (req) => {
  await requireRole(["admin", "owner"]);

  const { subject, message, recipientEmails } = sendAnnouncementSchema.parse(await req.json());

  await Promise.all([
    Promise.all(recipientEmails.map((to) => sendAnnouncementEmail({ to, subject, message }))),
    announcementsService.save(subject, message, recipientEmails),
  ]);

  return NextResponse.json({ sent: recipientEmails.length });
});
