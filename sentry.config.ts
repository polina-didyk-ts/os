// Shared Sentry configuration
// Environment is determined by NEXT_PUBLIC_SENTRY_ENVIRONMENT or NODE_ENV

export const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryEnvironment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development";

// Base configuration shared across all Sentry init calls
export const baseSentryConfig = {
  dsn: sentryDsn,
  environment: sentryEnvironment,

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Enable logs
  enableLogs: true,

  // Disable PII to ensure GDPR/CCPA compliance
  // User identification is handled via Sentry.setUser() with consent
  sendDefaultPii: false,

  // Disable Sentry if no DSN configured (local development)
  enabled: Boolean(sentryDsn),
};
