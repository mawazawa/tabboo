import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// import "@liquid-justice/design-system/styles"; // TODO: Build liquid-justice package
import "./index.css";

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
