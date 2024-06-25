import * as Sentry from "@sentry/capacitor";
import * as SentryReact from "@sentry/react";

Sentry.init(
  {
    dsn: "https://a5efb0d219a4a18ef3294c855dda3b6c@o4507493410340864.ingest.de.sentry.io/4507493412044880",
    integrations: [
      SentryReact.browserTracingIntegration(),
      SentryReact.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  },
  // Forward the init method from @sentry/react
  SentryReact.init,
);
