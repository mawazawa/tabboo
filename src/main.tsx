import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
// import "@liquid-justice/design-system/styles"; // TODO: Build liquid-justice package
import "./index.css";

// Initialize Sentry for error tracking (production only)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Session replay for debugging
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text for privacy (legal data)
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Filter out noisy errors
    beforeSend(event) {
      // Don't send errors from localhost
      if (window.location.hostname === 'localhost') {
        return null;
      }
      return event;
    },
  });
  console.log('[Sentry] Initialized');
}

// Register service worker for offline support (production only)
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // Production: Register service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (import.meta.env.DEV) {
            console.log('[SW]', 'Service Worker registered:', registration.scope);
          }
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    // Development: Unregister any existing service workers
    window.addEventListener('load', async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          if (import.meta.env.DEV) {
            console.log('[SW]', 'Service Worker unregistered for development');
          }
        }
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
