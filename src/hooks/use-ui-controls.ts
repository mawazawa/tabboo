import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import type { PersonalVaultData } from '@/utils/vaultFieldMatcher';
import type { User } from '@supabase/supabase-js';

interface UseUIControlsProps {
  pdfPanelRef: RefObject<HTMLDivElement>;
  vaultData: PersonalVaultData | null;
  user: User | null;
  toast: (options: { title: string; description: string; duration?: number }) => void;
}

interface UseUIControlsReturn {
  pdfZoom: number;
  fieldFontSize: number;
  isEditMode: boolean;
  thumbnailPanelWidth: number;
  hasVaultData: boolean;
  handleZoomOut: () => void;
  handleZoomIn: () => void;
  handleFitToPage: () => void;
  handleDecreaseFontSize: () => void;
  handleIncreaseFontSize: () => void;
  handleResetFontSize: () => void;
  handleEditToggle: () => void;
  handleThumbnailResize: (size: number) => void;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useUIControls({
  pdfPanelRef,
  vaultData,
  user,
  toast,
}: UseUIControlsProps): UseUIControlsReturn {
  const [pdfZoom, setPdfZoom] = useState(1);
  const [fieldFontSize, setFieldFontSize] = useState(12); // Default 12pt (PDF form standard)
  const [isEditMode, setIsEditMode] = useState(false);
  const [thumbnailPanelWidth, setThumbnailPanelWidth] = useState(200);

  // Keyboard shortcut: 'E' key to toggle edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Toggle edit mode with 'E' key
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsEditMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // toast is a stable function, doesn't need to be in dependencies

  // Keep latest toast reference stable
  const latestToastRef = useRef(toast);
  useEffect(() => {
    latestToastRef.current = toast;
  }, [toast]);

  // Toast notification when edit mode changes (skip until user is ready, avoid initial fire)
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!user) return;

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (!isEditMode) {
        return;
      }
    }

    latestToastRef.current({
      title: isEditMode ? 'Edit Mode Enabled' : 'Edit Mode Disabled',
      description: isEditMode
        ? 'You can now reposition fields by dragging them or using arrow keys'
        : 'You can now fill form fields',
      duration: 2000,
    });
  }, [isEditMode, user]);

  const handleZoomOut = useCallback(() => {
    setPdfZoom((prev) => Math.max(0.5, prev - 0.1));
  }, []);

  const handleZoomIn = useCallback(() => {
    setPdfZoom((prev) => Math.min(2, prev + 0.1));
  }, []);

  const handleFitToPage = useCallback(() => {
    const updateZoom = (width: number) => {
      const targetWidth = 850;
      const calculatedZoom = Math.min(2, Math.max(0.5, width / targetWidth));
      setPdfZoom(calculatedZoom);
    };

    if (pdfPanelRef.current) {
      updateZoom(pdfPanelRef.current.clientWidth - 48);
      return;
    }

    const pdfPanel = document.getElementById("pdf-panel");
    if (pdfPanel) {
      updateZoom(pdfPanel.clientWidth - 48);
      return;
    }

    setPdfZoom(1);
  }, [pdfPanelRef]);

  const handleDecreaseFontSize = useCallback(() => {
    setFieldFontSize((size) => Math.max(8, size - 1));
  }, []);

  const handleIncreaseFontSize = useCallback(() => {
    setFieldFontSize((size) => Math.min(16, size + 1));
  }, []);

  const handleResetFontSize = useCallback(() => {
    setFieldFontSize(12);
  }, []);

  const handleEditToggle = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const handleThumbnailResize = useCallback((size: number) => {
    const containerWidth = window.innerWidth * 0.75;
    setThumbnailPanelWidth((size / 100) * containerWidth);
  }, []);

  const hasVaultData = Boolean(vaultData);

  return {
    pdfZoom,
    fieldFontSize,
    isEditMode,
    thumbnailPanelWidth,
    hasVaultData,
    handleZoomOut,
    handleZoomIn,
    handleFitToPage,
    handleDecreaseFontSize,
    handleIncreaseFontSize,
    handleResetFontSize,
    handleEditToggle,
    handleThumbnailResize,
    setIsEditMode,
  };
}
