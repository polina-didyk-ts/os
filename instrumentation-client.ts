// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { baseSentryConfig } from "./sentry.config";

Sentry.init({
  ...baseSentryConfig,

  // Client-specific integrations
  integrations: [Sentry.replayIntegration()],

  // Replay sample rates
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
