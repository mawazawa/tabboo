import { useState, useRef, useEffect, useCallback } from 'react';
import { useLiveRegion } from "@/hooks/use-live-region";
import { useToast } from "@/hooks/use-toast";
import { usePersonalVault } from "@/hooks/use-personal-vault";
import { useFieldScroll } from "@/hooks/use-field-scroll";
import { useFieldPosition } from "@/hooks/use-field-position";
import { useVaultCopy } from "@/hooks/use-vault-copy";
import { useFieldNavigationKeyboard } from "@/hooks/use-field-navigation-keyboard";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";
import type { FormData, FieldPosition } from "@/types/FormData";

interface UseFieldNavigationPanelProps {
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  updateField: (field: string, value: string | boolean) => void;
  fieldPositions: Record<string, FieldPosition>;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  onSettingsSheetChange: (open: boolean) => void;
}

export const useFieldNavigationPanel = ({
  currentFieldIndex,
  setCurrentFieldIndex,
  updateField,
  fieldPositions,
  updateFieldPosition,
  onSettingsSheetChange
}: UseFieldNavigationPanelProps) => {
  const { announce, LiveRegionComponent } = useLiveRegion({ clearAfter: 1500 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showPositionControl, setShowPositionControl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);

  // Custom hooks
  const { data: personalInfo } = usePersonalVault();
  const { scrollViewportRef, activeFieldRef } = useFieldScroll(currentFieldIndex);
  
  // Guard against invalid currentFieldIndex to prevent undefined currentFieldName
  const isValidIndex = currentFieldIndex >= 0 && currentFieldIndex < FL_320_FIELD_CONFIG.length;
  const currentFieldName = isValidIndex ? FL_320_FIELD_CONFIG[currentFieldIndex]?.field : undefined;
  const safeFieldName = currentFieldName || '';
  const { currentPosition, adjustPosition } = useFieldPosition(safeFieldName, fieldPositions, updateFieldPosition);
  const { copyFromVault } = useVaultCopy(personalInfo, updateField);

  // Filter fields based on search query
  const filteredFields = FL_320_FIELD_CONFIG.filter(config =>
    config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Announce current field to screen readers
  useEffect(() => {
    const currentField = FL_320_FIELD_CONFIG[currentFieldIndex];
    if (currentField) {
      announce(`Field ${currentFieldIndex + 1} of ${FL_320_FIELD_CONFIG.length}: ${currentField.label}`);
    }
  }, [currentFieldIndex, announce]);

  const goToNextField = useCallback(() => {
    setCurrentFieldIndex(Math.min(FL_320_FIELD_CONFIG.length - 1, currentFieldIndex + 1));
  }, [currentFieldIndex, setCurrentFieldIndex]);

  const goToPrevField = useCallback(() => {
    setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1));
  }, [currentFieldIndex, setCurrentFieldIndex]);

  const { pressedKey } = useFieldNavigationKeyboard({
    currentFieldIndex,
    setCurrentFieldIndex,
    adjustPosition,
    showSearch,
    setShowSearch,
    showPositionControl,
    setShowPositionControl,
    searchInputRef
  });

  const handleClearFields = useCallback(() => {
    if (confirm('Are you sure you want to clear all form fields? This action cannot be undone.')) {
      FL_320_FIELD_CONFIG.forEach(config => updateField(config.field, config.type === 'checkbox' ? false : ''));
      toast({ title: "Form cleared", description: "All form fields have been reset", variant: "default" });
    }
  }, [updateField, toast]);

  const handleAIQuery = useCallback((query: string) => {
    toast({ title: "AI Query Sent", description: query });
    setShowAISearch(false);
  }, [toast]);

  const handleSettingsOpen = useCallback(() => {
    onSettingsSheetChange(true);
  }, [onSettingsSheetChange]);

  const handleSearchToggle = useCallback(() => {
    setShowAISearch(prev => !prev);
  }, []);

  return {
    // State
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    showAISearch,
    setShowAISearch,
    showPositionControl,
    setShowPositionControl,
    filteredFields,
    pressedKey,
    currentPosition,
    personalInfo,
    
    // Refs
    searchInputRef,
    scrollViewportRef,
    activeFieldRef,
    
    // Methods
    announce,
    LiveRegionComponent,
    adjustPosition,
    copyFromVault,
    goToNextField,
    goToPrevField,
    handleClearFields,
    handleAIQuery,
    handleSettingsOpen,
    handleSearchToggle,
    safeFieldName
  };
};

