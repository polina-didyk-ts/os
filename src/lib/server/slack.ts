import { WebClient } from "@slack/web-api";
import { logger } from "./logger";

const log = logger.child({ module: "slack" });

function getClient() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN is not set");
  return new WebClient(token);
}

export async function sendAnnouncementSlack(opts: {
  to: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; email: string; error?: string }> {
  const { to, subject, message } = opts;
  const plainText = message
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!process.env.SLACK_BOT_TOKEN) {
    log.warn("SLACK_BOT_TOKEN not configured — skipping Slack DM");
    return { ok: false, email: to, error: "not_configured" };
  }

  const client = getClient();

  try {
    const userRes = await client.users.lookupByEmail({ email: to });
    const userId = userRes.user?.id;
    if (!userId) {
      log.warn({ email: to }, "Slack user not found by email — skipping DM");
      return { ok: false, email: to, error: "user_not_found" };
    }

    const dmRes = await client.conversations.open({ users: userId });
    const channelId = dmRes.channel?.id;
    if (!channelId) {
      log.warn({ email: to }, "Failed to open Slack DM channel");
      return { ok: false, email: to, error: "dm_open_failed" };
    }

    await client.chat.postMessage({
      channel: channelId,
      text: `${subject}: ${plainText}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: subject, emoji: true },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: plainText },
        },
        { type: "divider" },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: ":mega: *Digital Office* · Announcement" }],
        },
      ],
    });

    log.info({ email: to }, "Slack DM sent");
    return { ok: true, email: to };
  } catch (err) {
    const code = (err as { data?: { error?: string } })?.data?.error ?? "unknown";
    log.warn({ email: to, code }, "Slack DM failed");
    return { ok: false, email: to, error: code };
  }
}
