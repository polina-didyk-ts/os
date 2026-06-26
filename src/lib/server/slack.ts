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
}): Promise<{ ok: boolean; error?: string }> {
  const { to, subject, message } = opts;

  if (!process.env.SLACK_BOT_TOKEN) {
    log.warn("SLACK_BOT_TOKEN not configured — skipping Slack DM");
    return { ok: false, error: "not_configured" };
  }

  const client = getClient();

  try {
    const userRes = await client.users.lookupByEmail({ email: to });
    const userId = userRes.user?.id;
    if (!userId) {
      log.warn({ email: to }, "Slack user not found by email");
      return { ok: false, error: "user_not_found" };
    }

    const dmRes = await client.conversations.open({ users: userId });
    const channelId = dmRes.channel?.id;
    if (!channelId) {
      log.warn({ email: to }, "Failed to open Slack DM channel");
      return { ok: false, error: "dm_open_failed" };
    }

    await client.chat.postMessage({
      channel: channelId,
      text: `*${subject}*\n\n${message}`,
    });

    log.info({ email: to }, "Slack DM sent");
    return { ok: true };
  } catch (err) {
    const code = (err as { data?: { error?: string } })?.data?.error ?? "unknown";
    log.warn({ email: to, code }, "Slack DM failed");
    return { ok: false, error: code };
  }
}
