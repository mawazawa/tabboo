import { useEffect, useRef } from "react";

export const useFieldScroll = (currentFieldIndex: number) => {
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const activeFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeFieldRef.current && scrollViewportRef.current) {
      const fieldElement = activeFieldRef.current;
      const viewportElement = scrollViewportRef.current;
      const scrollableViewport = viewportElement.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement || viewportElement;

      const fieldRect = fieldElement.getBoundingClientRect();
      const viewportRect = scrollableViewport.getBoundingClientRect();
      const fieldCenter = fieldRect.top + fieldRect.height / 2;
      const viewportCenter = viewportRect.top + viewportRect.height / 2;
      const scrollOffset = fieldCenter - viewportCenter;

      scrollableViewport.scrollBy({ top: scrollOffset, behavior: 'smooth' });
    }
  }, [currentFieldIndex]);

  return { scrollViewportRef, activeFieldRef };
};

