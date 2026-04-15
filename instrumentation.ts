// This file configures Sentry initialization for server and edge runtimes.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { baseSentryConfig } from "./sentry.config";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      ...baseSentryConfig,
      integrations: [Sentry.pinoIntegration()],
    });
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      ...baseSentryConfig,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
