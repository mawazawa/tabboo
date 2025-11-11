// Route preloading utilities for lazy-loaded components
// Intelligent preloading on hover and visibility for instant page transitions

const preloadedRoutes = new Set<string>();
const preloadTimers = new Map<string, NodeJS.Timeout>();

export const preloadRoute = (routeImport: () => Promise<any>, routeName: string, delay: number = 0) => {
  // Avoid preloading the same route multiple times
  if (preloadedRoutes.has(routeName)) {
    return;
  }

  // Clear any existing timer for this route
  if (preloadTimers.has(routeName)) {
    clearTimeout(preloadTimers.get(routeName)!);
  }

  // Delay preloading slightly to avoid unnecessary loads on quick hovers
  const timer = setTimeout(() => {
    preloadedRoutes.add(routeName);
    routeImport().catch(err => {
      console.error(`Failed to preload route: ${routeName}`, err);
      // Remove from cache if preload fails so it can be retried
      preloadedRoutes.delete(routeName);
    });
    preloadTimers.delete(routeName);
  }, delay);

  preloadTimers.set(routeName, timer);
};

// Cancel preload if user moves away quickly
export const cancelPreload = (routeName: string) => {
  if (preloadTimers.has(routeName)) {
    clearTimeout(preloadTimers.get(routeName)!);
    preloadTimers.delete(routeName);
  }
};

// Specific route preloaders with hover delay
export const preloadDistributionCalculator = () => {
  preloadRoute(() => import("@/pages/DistributionCalculator"), "DistributionCalculator", 100);
};

export const cancelDistributionCalculator = () => {
  cancelPreload("DistributionCalculator");
};

export const preloadIndex = () => {
  preloadRoute(() => import("@/pages/Index"), "Index", 100);
};

export const cancelIndex = () => {
  cancelPreload("Index");
};

export const preloadAuth = () => {
  preloadRoute(() => import("@/pages/Auth"), "Auth", 100);
};

export const cancelAuth = () => {
  cancelPreload("Auth");
};

// Preload all critical routes when the app is idle
export const preloadCriticalRoutes = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadDistributionCalculator();
      preloadAuth();
    }, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      preloadDistributionCalculator();
      preloadAuth();
    }, 2000);
  }
};
