import { ReactNode } from 'react';
import { useAdaptiveLayout } from '@/hooks/use-adaptive-layout';

interface AdaptiveLayoutProps {
  /** Desktop layout (≥1280px) */
  desktop: ReactNode;
  /** Tablet layout (768-1279px) */
  tablet?: ReactNode;
  /** Mobile layout (<768px) */
  mobile?: ReactNode;
  /** Fallback if tablet/mobile not provided */
  fallback?: 'desktop' | 'mobile';
}

/**
 * Adaptive layout wrapper that renders different layouts based on viewport size
 *
 * Automatically switches between desktop, tablet, and mobile layouts.
 * If tablet or mobile layouts aren't provided, falls back to desktop or uses specified fallback.
 *
 * @example
 * <AdaptiveLayout
 *   desktop={<DesktopThreePanelLayout />}
 *   tablet={<TabletTwoPanelLayout />}
 *   mobile={<MobileSingleColumnLayout />}
 * />
 *
 * @example
 * // Simpler: only desktop and mobile
 * <AdaptiveLayout
 *   desktop={<DesktopLayout />}
 *   mobile={<MobileLayout />}
 *   fallback="desktop" // Tablet uses desktop layout
 * />
 */
export const AdaptiveLayout = ({
  desktop,
  tablet,
  mobile,
  fallback = 'desktop',
}: AdaptiveLayoutProps) => {
  const { isMobile, isTablet } = useAdaptiveLayout();

  // Mobile viewport
  if (isMobile) {
    return <>{mobile || (fallback === 'desktop' ? desktop : null)}</>;
  }

  // Tablet viewport
  if (isTablet) {
    return <>{tablet || (fallback === 'desktop' ? desktop : mobile)}</>;
  }

  // Desktop viewport (default)
  return <>{desktop}</>;
};

/**
 * Helper component to conditionally render based on viewport
 *
 * @example
 * <ShowOn viewport="mobile">
 *   <MobileOnlyComponent />
 * </ShowOn>
 *
 * <ShowOn viewport={['tablet', 'desktop']}>
 *   <HiddenOnMobile />
 * </ShowOn>
 */
interface ShowOnProps {
  viewport: 'mobile' | 'tablet' | 'desktop' | 'wide' | Array<'mobile' | 'tablet' | 'desktop' | 'wide'>;
  children: ReactNode;
}

export const ShowOn = ({ viewport, children }: ShowOnProps) => {
  const { viewport: currentViewport } = useAdaptiveLayout();

  const viewports = Array.isArray(viewport) ? viewport : [viewport];

  if (!viewports.includes(currentViewport)) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Helper component to hide content on specific viewports
 *
 * @example
 * <HideOn viewport="mobile">
 *   <DesktopOnlyFeature />
 * </HideOn>
 */
interface HideOnProps {
  viewport: 'mobile' | 'tablet' | 'desktop' | 'wide' | Array<'mobile' | 'tablet' | 'desktop' | 'wide'>;
  children: ReactNode;
}

export const HideOn = ({ viewport, children }: HideOnProps) => {
  const { viewport: currentViewport } = useAdaptiveLayout();

  const viewports = Array.isArray(viewport) ? viewport : [viewport];

  if (viewports.includes(currentViewport)) {
    return null;
  }

  return <>{children}</>;
};
