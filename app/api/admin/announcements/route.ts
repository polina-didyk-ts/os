import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, requireRole, sendAnnouncementEmail } from "@/src/lib/server";

const schema = z.object({
  subject:         z.string().min(1).max(100),
  message:         z.string().min(1).max(2000),
  recipientEmails: z.array(z.string().email()).min(1),
});

export const POST = apiHandler(async (req) => {
  await requireRole(["admin", "owner"]);

  const { subject, message, recipientEmails } = schema.parse(await req.json());

  await Promise.all(
    recipientEmails.map((to) => sendAnnouncementEmail({ to, subject, message }))
  );

  return NextResponse.json({ sent: recipientEmails.length });
});
