import { NextResponse } from "next/server";
import { apiHandler, requireRole, sendAnnouncementEmail, sendAnnouncementSlack } from "@/src/lib/server";
import { announcementsService } from "@/src/modules/announcements/announcements.service";
import { sendAnnouncementSchema } from "@/src/modules/announcements/announcements.dto";

export const POST = apiHandler(async (req) => {
  await requireRole(["admin", "owner"]);

  const { subject, message, recipientEmails, channel } = sendAnnouncementSchema.parse(await req.json());

  const sendEmail = channel === "email" || channel === "both";
  const sendSlack = channel === "slack" || channel === "both";

  const [emailResults, slackResults] = await Promise.all([
    sendEmail
      ? Promise.all(recipientEmails.map((to) => sendAnnouncementEmail({ to, subject, message }).then(() => ({ to, ok: true })).catch(() => ({ to, ok: false }))))
      : Promise.resolve([]),
    sendSlack
      ? Promise.all(recipientEmails.map((to) => sendAnnouncementSlack({ to, subject, message })))
      : Promise.resolve([]),
    announcementsService.save(subject, message, recipientEmails),
  ]);

  type SlackResult = { ok: boolean; email: string; error?: string };

  const sentEmail = (emailResults as { ok: boolean }[]).filter((r) => r.ok).length;
  const sentSlack = (slackResults as SlackResult[]).filter((r) => r.ok).length;
  const skippedEmails = (slackResults as SlackResult[])
    .filter((r) => !r.ok)
    .map((r) => r.email);
  const slackErrors = (slackResults as SlackResult[])
    .filter((r) => !r.ok)
    .map((r) => r.error)
    .filter(Boolean);

  return NextResponse.json({ sentEmail, sentSlack, slackErrors, skippedEmails });
});
