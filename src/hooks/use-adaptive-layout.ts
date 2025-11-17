import { useState, useEffect } from 'react';

/**
 * Breakpoints for responsive layout (matches Tailwind defaults)
 */
export const BREAKPOINTS = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1279px
  desktop: 1280,  // 1280px+
  wide: 1920      // 1920px+ (future use)
} as const;

export type Viewport = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Hook to determine current viewport size and provide layout helpers
 *
 * @returns Current viewport type and helper boolean flags
 *
 * @example
 * const { viewport, isMobile, isTablet, isDesktop } = useAdaptiveLayout();
 *
 * if (isMobile) {
 *   return <MobileBottomSheet />;
 * }
 */
export const useAdaptiveLayout = () => {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;

      if (width < BREAKPOINTS.tablet) {
        setViewport('mobile');
      } else if (width < BREAKPOINTS.desktop) {
        setViewport('tablet');
      } else if (width < BREAKPOINTS.wide) {
        setViewport('desktop');
      } else {
        setViewport('wide');
      }
    };

    // Set initial viewport
    updateViewport();

    // Update on window resize (debounced by browser's requestAnimationFrame)
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 100); // Debounce 100ms
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    viewport,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop' || viewport === 'wide',
    isWide: viewport === 'wide',
    // Helper for touch devices (mobile + tablet)
    isTouchDevice: viewport === 'mobile' || viewport === 'tablet',
  };
};

/**
 * Hook to get current window dimensions
 * Useful for calculating panel sizes, PDF zoom, etc.
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * Hook to detect if user prefers reduced motion
 * Used for accessibility-friendly animations
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};
