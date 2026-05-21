import nodemailer from "nodemailer";
import { logger } from "./logger";

const log = logger.child({ module: "email" });

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In Progress",
  completed:   "Done",
  rejected:    "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: "#FFC600",
  completed:   "#10b981",
  rejected:    "#ef4444",
};

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export interface RequestUpdateEmailOptions {
  to: string;
  userName: string;
  ticketNumber: string;
  newStatus: string;
  comment?: string;
}

export async function sendRequestUpdateEmail(opts: RequestUpdateEmailOptions) {
  const { to, userName, ticketNumber, newStatus, comment } = opts;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    log.warn("Email not configured — skipping notification");
    return;
  }

  const statusLabel = STATUS_LABELS[newStatus] ?? newStatus;
  const statusColor = STATUS_COLORS[newStatus] ?? "#141414";
  const firstName   = userName.split(" ")[0] || userName;

  const commentBlock = comment
    ? `
      <div style="margin-top:24px;padding:16px;background:#f9fafb;border-left:4px solid #FFC600;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Message from manager</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${comment}</p>
      </div>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <div style="background:#141414;padding:24px 32px;">
          <div style="display:inline-block;background:#FFC600;border-radius:8px;padding:6px 10px;margin-bottom:12px;">
            <span style="font-size:13px;font-weight:700;color:#141414;">Digital Office</span>
          </div>
          <p style="margin:0;font-size:13px;color:#9ca3af;">Request update</p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <p style="margin:0 0 8px;font-size:16px;color:#111827;">Hi, <strong>${firstName}</strong></p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Your request <strong>#${ticketNumber}</strong> has been updated.</p>

          <!-- Status badge -->
          <div style="display:inline-block;padding:8px 16px;background:${statusColor}20;border-radius:24px;border:1px solid ${statusColor}40;">
            <span style="font-size:13px;font-weight:700;color:${statusColor};">${statusLabel.toUpperCase()}</span>
          </div>

          ${commentBlock}

          <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb;" />
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            This is an automated notification from Techstack Digital Office.<br/>
            Please do not reply to this email.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  const subject = comment
    ? `Request #${ticketNumber} — ${statusLabel} + message from manager`
    : `Request #${ticketNumber} — status updated to ${statusLabel}`;

  try {
    await createTransporter().sendMail({
      from: `"Digital Office" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    log.info({ to, ticketNumber, newStatus, hasComment: !!comment }, "Request update email sent");
  } catch (err) {
    log.error({ err, to, ticketNumber }, "Failed to send request update email");
  }
}
