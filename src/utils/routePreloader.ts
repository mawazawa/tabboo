// Route preloading utilities for lazy-loaded components
// Preload components on hover to improve perceived performance

const preloadedRoutes = new Set<string>();

export const preloadRoute = (routeImport: () => Promise<any>, routeName: string) => {
  // Avoid preloading the same route multiple times
  if (preloadedRoutes.has(routeName)) {
    return;
  }

  preloadedRoutes.add(routeName);
  routeImport().catch(err => {
    console.error(`Failed to preload route: ${routeName}`, err);
    // Remove from cache if preload fails so it can be retried
    preloadedRoutes.delete(routeName);
  });
};

// Specific route preloaders
export const preloadDistributionCalculator = () => {
  preloadRoute(() => import("@/pages/DistributionCalculator"), "DistributionCalculator");
};

export const preloadIndex = () => {
  preloadRoute(() => import("@/pages/Index"), "Index");
};

export const preloadAuth = () => {
  preloadRoute(() => import("@/pages/Auth"), "Auth");
};
