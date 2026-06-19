import nodemailer from "nodemailer";
import { logger } from "./logger";

const log = logger.child({ module: "email" });

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In Progress",
  completed: "Done",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: "#FFC600",
  completed: "#10b981",
  rejected: "#ef4444",
};

const TYPE_LABELS: Record<string, string> = {
  order: "Order",
  problem: "Problem",
  question: "Question",
  idea: "Idea / Feedback",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
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

export interface NewRequestAdminEmailOptions {
  employeeName: string;
  requestId: string;
  requestType: string;
  title: string;
  priority: string;
  ticketNumber: string;
}

export async function sendNewRequestAdminEmail(opts: NewRequestAdminEmailOptions) {
  const { employeeName, requestType, title, priority, ticketNumber } = opts;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !adminEmail) {
    log.warn("Email not configured — skipping admin notification");
    return;
  }

  const typeLabel = TYPE_LABELS[requestType] ?? requestType;
  const priorityLabel = PRIORITY_LABELS[priority] ?? priority;
  const priorityColor = PRIORITY_COLORS[priority] ?? "#6b7280";
  const firstName = employeeName.split(" ")[0] || employeeName;
  const requestUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? ""}/employee/signin`;

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
          <p style="margin:0;font-size:13px;color:#9ca3af;">New request submitted</p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <p style="margin:0 0 8px;font-size:16px;color:#111827;">New request from <strong>${firstName}</strong></p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">A new request has been submitted and is waiting for your review.</p>

          <!-- Request details card -->
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Ticket</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;font-weight:700;color:#111827;">#${ticketNumber}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Employee</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;color:#374151;">${employeeName}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Type</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;color:#374151;">${typeLabel}</span>
                </td>
              </tr>
              ${
                title
                  ? `
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Subject</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;color:#374151;">${title}</span>
                </td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Priority</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:12px;font-weight:700;color:${priorityColor};">${priorityLabel.toUpperCase()}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- CTA button -->
          <div style="margin-top:4px;margin-bottom:28px;">
            <a href="${requestUrl}" style="display:inline-block;padding:12px 24px;background:#141414;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
              View in admin →
            </a>
          </div>

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

  const subject = `New ${typeLabel} #${ticketNumber} from ${employeeName}`;

  try {
    await createTransporter().sendMail({
      from: `"Digital Office" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject,
      html,
    });
    log.info({ ticketNumber, requestType, employeeName }, "Admin new request email sent");
  } catch (err) {
    log.error({ err, ticketNumber }, "Failed to send admin new request email");
  }
}

export interface AnnouncementEmailOptions {
  to: string;
  subject: string;
  message: string;
}

export async function sendAnnouncementEmail(opts: AnnouncementEmailOptions) {
  const { to, subject, message } = opts;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    log.warn("Email not configured — skipping announcement");
    return;
  }

  const messageHtml = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

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
          <p style="margin:0;font-size:13px;color:#9ca3af;">Announcement from Digital Office</p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <p style="margin:0 0 24px;font-size:16px;font-weight:700;color:#111827;">${subject}</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${messageHtml}</p>

          <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb;" />
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            This is an announcement from Techstack Digital Office.<br/>
            Please do not reply to this email.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    await createTransporter().sendMail({
      from: `"Digital Office" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    log.info({ to }, "Announcement email sent");
  } catch (err) {
    log.error({ err, to }, "Failed to send announcement email");
  }
}

export interface RequestUpdateEmailOptions {
  to: string;
  userName: string;
  ticketNumber: string;
  newStatus: string;
  comment?: string;
  requestId: string;
  requestType: string;
  title: string;
  priority: string;
  createdAt: Date;
}

export async function sendRequestUpdateEmail(opts: RequestUpdateEmailOptions) {
  const {
    to,
    userName,
    ticketNumber,
    newStatus,
    comment,
    requestId,
    requestType,
    title,
    priority,
    createdAt,
  } = opts;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    log.warn("Email not configured — skipping notification");
    return;
  }

  const statusLabel = STATUS_LABELS[newStatus] ?? newStatus;
  const statusColor = STATUS_COLORS[newStatus] ?? "#141414";
  const typeLabel = TYPE_LABELS[requestType] ?? requestType;
  const priorityLabel = PRIORITY_LABELS[priority] ?? priority;
  const priorityColor = PRIORITY_COLORS[priority] ?? "#6b7280";
  const firstName = userName.split(" ")[0] || userName;
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(createdAt);

  const titleDisplay = title.length > 80 ? title.slice(0, 80) + "…" : title;

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
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Your request has been updated. Here are the details:</p>

          <!-- Request details card -->
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Ticket</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;font-weight:700;color:#111827;">#${ticketNumber}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Type</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;color:#374151;">${typeLabel}</span>
                </td>
              </tr>
              ${
                titleDisplay
                  ? `
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Subject</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;color:#374151;">${titleDisplay}</span>
                </td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Priority</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:12px;font-weight:700;color:${priorityColor};">${priorityLabel.toUpperCase()}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Created</span>
                </td>
                <td style="padding:6px 0;text-align:right;">
                  <span style="font-size:13px;color:#374151;">${formattedDate}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Status badge -->
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">Current status</p>
          <div style="display:inline-block;padding:8px 16px;background:${statusColor}20;border-radius:24px;border:1px solid ${statusColor}40;">
            <span style="font-size:13px;font-weight:700;color:${statusColor};">${statusLabel.toUpperCase()}</span>
          </div>

          ${commentBlock}

          <!-- CTA button -->
          <div style="margin-top:28px;margin-bottom:4px;">
            <a href="${process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? ""}/employee/requests/${requestId}" style="display:inline-block;padding:12px 24px;background:#141414;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
              View request →
            </a>
          </div>

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
