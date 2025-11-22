/**
 * TRO Workflow Wizard Component
 *
 * Main orchestration component for guiding users through the complete TRO packet
 * workflow. Provides step-by-step navigation, progress tracking, validation feedback,
 * and form transitions.
 *
 * Now features a fully integrated workspace layout with PDF Thumbnails,
 * Field Navigation, and Edit Mode capabilities.
 *
 * @version 2.0
 * @date November 22, 2025
 * @author Gemini 3 Pro & Agent 2
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertCircle, Building, MapPin, Hash, 
  ChevronLeft, ChevronRight, Upload, Edit, Settings,
  FileText, Layout
} from '@/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from '@/hooks/use-toast';
import { useTROWorkflow } from '@/hooks/useTROWorkflow';
import { useFieldOperations } from '@/hooks/use-field-operations';
import { usePersonalVault } from '@/hooks/use-personal-vault';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getPdfPath } from '@/hooks/use-pdf-loading';
import { FormViewer } from '@/components/FormViewer';
import { PacketProgressPanel } from '@/components/PacketProgressPanel';
import { PDFThumbnailSidebar } from '@/components/PDFThumbnailSidebar';
import { FieldNavigationPanel } from '@/components/FieldNavigationPanel';
import { FormData, FieldPosition, ValidationRules, ValidationErrors } from '@/types/FormData';
import {
  PacketType,
  FormStatus,
  WorkflowState,
  FormType,
  type TROWorkflowWizardProps,
  FORM_ORDER
} from '@/types/WorkflowTypes';

// Extracted components
import { PacketTypeSelector } from '@/components/workflow';

/**
 * Main TRO Workflow Wizard Component
 */
export const TROWorkflowWizard: React.FC<TROWorkflowWizardProps> = ({
  userId,
  onComplete,
  onError,
  initialPacketType,
  existingWorkflowId
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // -- STATE --
  const [showPacketSelector, setShowPacketSelector] = useState(!initialPacketType && !existingWorkflowId);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Form Data State
  const [currentFormData, setCurrentFormData] = useState<FormData>({});
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number>(0);
  const [fieldPositions, setFieldPositions] = useState<Record<string, FieldPosition>>({});
  
  // Workspace State
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationRules, setValidationRules] = useState<ValidationRules>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [copiedFieldPositions, setCopiedFieldPositions] = useState<Record<string, FieldPosition> | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const hasUnsavedChanges = useRef(false);

  // Panels State
  const [activeLeftTab, setActiveLeftTab] = useState<string>("progress");

  // -- HOOKS --
  const {
    workflow,
    loading,
    error,
    startWorkflow,
    loadWorkflow,
    transitionToNextForm,
    transitionToPreviousForm,
    validateCurrentForm,
    canTransitionToNextForm,
    canTransitionToPreviousForm,
    getCurrentForm,
    getNextForm,
    getPreviousForm,
    getPacketCompletionPercentage,
    jumpToForm,
    getFormData,
    saveFormData
  } = useTROWorkflow(userId, existingWorkflowId);

  const { vaultData } = usePersonalVault(userId);

  // Field Operations Hook
  const {
    updateField,
    updateFieldPosition,
    handleSnapToGrid,
    handleAlignHorizontal,
    handleAlignVertical,
    handleDistribute,
    handleCopyPositions,
    handlePastePositions,
    handleTransformPositions,
    handleApplyGroup,
    handleApplyTemplate,
    handleSaveValidationRules,
  } = useFieldOperations({
    formData: currentFormData,
    setFormData: setCurrentFormData,
    fieldPositions,
    setFieldPositions,
    validationRules,
    setValidationRules,
    setValidationErrors,
    selectedFields,
    copiedFieldPositions,
    setCopiedFieldPositions,
    vaultData,
    hasUnsavedChanges,
  });

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'e',
      action: () => setIsEditMode(prev => !prev),
      description: 'Toggle Edit Mode'
    },
    {
      key: 'Escape',
      action: () => {
        if (isEditMode) setIsEditMode(false);
        setSelectedFields([]);
      },
      description: 'Exit Edit Mode / Deselect'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        if (currentForm) saveFormData(currentForm, currentFormData);
        toast({ title: 'Saved', description: 'Form progress saved' });
      },
      description: 'Save Progress'
    }
  ]);

  // -- EFFECTS --

  // Handle errors
  useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  // Load existing workflow
  useEffect(() => {
    if (existingWorkflowId && !workflow && !loading) {
      loadWorkflow(existingWorkflowId);
    }
  }, [existingWorkflowId, workflow, loading, loadWorkflow]);

  // Load form data when current form changes
  const currentForm = getCurrentForm();
  
  useEffect(() => {
    const loadData = async () => {
      if (!currentForm) return;
      
      setIsLoadingFormData(true);
      try {
        const data = await getFormData(currentForm);
        if (data) {
          setCurrentFormData(data as unknown as FormData);
        } else {
          setCurrentFormData({});
        }
      } catch (err) {
        console.error("Failed to load form data:", err);
        toast({
          title: "Error loading form data",
          description: "Could not retrieve your saved progress.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingFormData(false);
      }
    };

    loadData();
  }, [currentForm, getFormData, toast]);

  // Auto-save effect (replacing the old handleFieldUpdate wrapper)
  useEffect(() => {
    if (!currentForm || !hasUnsavedChanges.current) return;

    const timeoutId = setTimeout(() => {
      saveFormData(currentForm, currentFormData)
        .then(() => {
          hasUnsavedChanges.current = false;
        })
        .catch(console.error);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [currentFormData, currentForm, saveFormData]);

  // -- HANDLERS --

  const handlePacketTypeSelect = useCallback(
    async (packetType: PacketType) => {
      setIsInitializing(true);
      try {
        const config = {
          hasChildren: packetType === PacketType.INITIATING_WITH_CHILDREN,
          requestingChildSupport: false,
          requestingSpousalSupport: false,
          needMoreSpace: false,
          hasExistingCaseNumber: false
        };
        await startWorkflow(packetType, config);
        setShowPacketSelector(false);
        toast({ title: 'Workflow Started', description: 'Your TRO packet workflow has been created.' });
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
      } finally {
        setIsInitializing(false);
      }
    },
    [startWorkflow, toast]
  );

  const handleNext = useCallback(async () => {
    const validation = await validateCurrentForm();
    if (!validation.valid) {
      toast({ title: 'Validation Errors', description: validation.errors.map(e => e.message).join('\n'), variant: 'destructive' });
      return;
    }
    await transitionToNextForm();
    if (workflow?.currentState === WorkflowState.READY_TO_FILE && onComplete) onComplete();
  }, [validateCurrentForm, transitionToNextForm, workflow, onComplete, toast]);

  const handleFormSelect = (value: string) => {
    if (value === 'upload_custom') {
      navigate('/');
    } else {
      jumpToForm(value as FormType);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Redirect to main canvas for file handling
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      navigate('/');
    }
  };

  // -- RENDER --

  if (showPacketSelector) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PacketTypeSelector onSelect={handlePacketTypeSelect} onCancel={() => {}} />
      </div>
    );
  }

  if (loading || isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{isInitializing ? 'Initializing...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!workflow) return null;

  // Calculate derived values
  const formList = workflow.packetType && FORM_ORDER[workflow.packetType] ? FORM_ORDER[workflow.packetType] : [];
  const pdfUrl = currentForm ? getPdfPath(currentForm) : undefined;

  return (
    <div 
      className="flex flex-col h-screen bg-background"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
    >
      {/* -- HEADER -- */}
      <div className="h-14 border-b flex items-center px-4 gap-4 bg-card shadow-sm z-10 flex-none">
        <div className="flex items-center gap-2 mr-4">
          <Building className="w-5 h-5 text-primary" />
          <span className="font-semibold hidden md:inline">SwiftFill Wizard</span>
        </div>

        {/* Form Switcher */}
        <div className="flex-1 max-w-md">
          <Select value={currentForm || ''} onValueChange={handleFormSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Form" />
            </SelectTrigger>
            <SelectContent>
              {formList.map(f => (
                <SelectItem key={f} value={f}>{f} - {workflow.formStatuses[f] || 'Pending'}</SelectItem>
              ))}
              <div className="border-t my-1" />
              <SelectItem value="upload_custom" className="text-primary font-medium">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Your Own
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant={isEditMode ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setIsEditMode(!isEditMode)}
            title="Toggle Edit Mode (E)"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditMode ? 'Editing' : 'View'}
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          <Button variant="ghost" size="icon" disabled={!canTransitionToPreviousForm()} onClick={transitionToPreviousForm}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="default" size="sm" disabled={!canTransitionToNextForm()} onClick={handleNext}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* -- WORKSPACE LAYOUT -- */}
      <div className="flex-grow overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          
          {/* LEFT PANEL: Steps & Thumbnails */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible>
            <Tabs value={activeLeftTab} onValueChange={setActiveLeftTab} className="h-full flex flex-col">
              <div className="px-2 pt-2">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="pages">Pages</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-grow overflow-hidden relative mt-2">
                <TabsContent value="progress" className="h-full absolute inset-0 overflow-y-auto p-2 m-0 data-[state=inactive]:hidden">
                  <div className="space-y-4">
                    {/* Court Info */}
                    <Card className="border-dashed">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Filing At</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2 pb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary mt-0.5" />
                          <div className="font-medium">
                            {(currentFormData['county'] as string) || 'Los Angeles'} Superior Court
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-primary" />
                          <span className="font-mono bg-muted px-1.5 rounded">
                            {(currentFormData['caseNumber'] as string) || 'PENDING'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Packet Progress */}
                    <PacketProgressPanel 
                      workflow={workflow}
                      onFormSelect={(f) => jumpToForm(f)}
                      compact={true}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pages" className="h-full absolute inset-0 m-0 data-[state=inactive]:hidden">
                  <PDFThumbnailSidebar 
                    pdfUrl={pdfUrl}
                    panelWidth={250} // approx
                    currentPage={1} // TODO: Track current page in wizard state
                    onPageClick={() => {}} // TODO: Implement page jump
                  />
                </TabsContent>
              </div>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          {/* MIDDLE PANEL: Viewer */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full w-full relative bg-slate-100/50">
              {currentForm ? (
                isLoadingFormData ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <FormViewer 
                    formData={currentFormData}
                    updateField={updateField}
                    currentFieldIndex={currentFieldIndex}
                    setCurrentFieldIndex={setCurrentFieldIndex}
                    fieldPositions={fieldPositions}
                    updateFieldPosition={updateFieldPosition}
                    formType={currentForm}
                    isEditMode={isEditMode}
                    zoom={1}
                    fieldFontSize={12}
                    validationErrors={validationErrors}
                    vaultData={vaultData}
                    highlightedField={highlightedField}
                    handleFieldClick={() => {}}
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a form to begin
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* RIGHT PANEL: Field Navigation */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible>
            <div className="h-full overflow-hidden">
              <FieldNavigationPanel
                formData={currentFormData}
                updateField={updateField}
                currentFieldIndex={currentFieldIndex}
                setCurrentFieldIndex={setCurrentFieldIndex}
                fieldPositions={fieldPositions}
                updateFieldPosition={updateFieldPosition}
                selectedFields={selectedFields}
                setSelectedFields={setSelectedFields}
                // Pass Layout Handlers
                onSnapToGrid={handleSnapToGrid}
                onAlignHorizontal={handleAlignHorizontal}
                onAlignVertical={handleAlignVertical}
                onDistribute={handleDistribute}
                onCopyPositions={handleCopyPositions}
                onPastePositions={handlePastePositions}
                onTransformPositions={handleTransformPositions}
                hasCopiedPositions={!!copiedFieldPositions}
                onFieldHover={setHighlightedField}
                validationRules={validationRules}
                validationErrors={validationErrors}
                onSaveValidationRules={handleSaveValidationRules}
                settingsSheetOpen={settingsSheetOpen}
                onSettingsSheetChange={setSettingsSheetOpen}
                onApplyTemplate={handleApplyTemplate}
                onApplyGroup={handleApplyGroup}
              />
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default TROWorkflowWizard;
