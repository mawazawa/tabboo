import { useState } from 'react';

interface UsePanelStateReturn {
  showAIPanel: boolean;
  showFieldsPanel: boolean;
  showVaultPanel: boolean;
  showThumbnails: boolean;
  settingsSheetOpen: boolean;
  vaultSheetOpen: boolean;
  mobileTab: string;
  setShowAIPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFieldsPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowVaultPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowThumbnails: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setVaultSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileTab: React.Dispatch<React.SetStateAction<string>>;
  toggleAIPanel: () => void;
  toggleFieldsPanel: () => void;
  toggleVaultPanel: () => void;
  toggleThumbnails: () => void;
}

/**
 * Manages visibility state for all panels and sheets in the application
 */
export function usePanelState(): UsePanelStateReturn {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showFieldsPanel, setShowFieldsPanel] = useState(true);
  const [showVaultPanel, setShowVaultPanel] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [vaultSheetOpen, setVaultSheetOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<string>("fields");

  const toggleAIPanel = () => setShowAIPanel(prev => !prev);
  const toggleFieldsPanel = () => setShowFieldsPanel(prev => !prev);
  const toggleVaultPanel = () => setShowVaultPanel(prev => !prev);
  const toggleThumbnails = () => setShowThumbnails(prev => !prev);

  return {
    showAIPanel,
    showFieldsPanel,
    showVaultPanel,
    showThumbnails,
    settingsSheetOpen,
    vaultSheetOpen,
    mobileTab,
    setShowAIPanel,
    setShowFieldsPanel,
    setShowVaultPanel,
    setShowThumbnails,
    setSettingsSheetOpen,
    setVaultSheetOpen,
    setMobileTab,
    toggleAIPanel,
    toggleFieldsPanel,
    toggleVaultPanel,
    toggleThumbnails,
  };
}
