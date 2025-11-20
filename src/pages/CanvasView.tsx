import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@/components/canvas/Canvas';
import { CanvasFormViewer } from '@/components/canvas/CanvasFormViewer';
import { ExpandingFormViewer } from '@/components/canvas/ExpandingFormViewer';
import { ProceduralTimeline } from '@/components/canvas/ProceduralTimeline';
import { LiquidAssistant } from '@/components/canvas/LiquidAssistant';
import { IngestionReview } from '@/components/canvas/IngestionReview';
import { OrgChart } from '@/components/canvas/OrgChart';
import { PROCEDURAL_FLOWS, FORM_NAME_TO_TYPE, ORG_DATA } from '@/components/canvas/constants';
import { Search, Database, Users, Layers, CloudUpload, CheckCircle, FileText, ChevronRight, MapPin } from '@/icons';
import { useNavigate } from 'react-router-dom';
import { useDocumentPersistence } from '@/hooks/use-document-persistence';
import { useVaultData } from '@/hooks/use-vault-data';
import type { FormType } from '@/components/FormViewer';
import type { FormData, FieldPositions, ValidationRules } from '@/types/FormData';
import type { CaseMetadata, IngestionStatus, OrgNode } from '@/components/canvas/types';

export default function CanvasView() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'ORG' | 'PROCEDURE' | 'VAULT' | 'FORM'>('FORM');
  const [activeForms, setActiveForms] = useState<Array<{ id: string; formType: FormType; position: { x: number; y: number }; scale: number }>>([]);
  const [expandingForm, setExpandingForm] = useState<{ formId: string; formType: FormType; originPosition: { x: number; y: number; width: number; height: number } } | null>(null);
  const [formDataMap, setFormDataMap] = useState<Record<string, FormData>>({});
  const [fieldPositionsMap, setFieldPositionsMap] = useState<Record<string, FieldPositions>>({});
  const [currentFieldIndexMap, setCurrentFieldIndexMap] = useState<Record<string, number>>({});
  const [validationRulesMap, setValidationRulesMap] = useState<Record<string, ValidationRules>>({});
  const [showFormSubmenu, setShowFormSubmenu] = useState(false);
  const hasUnsavedChanges = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formIdCounter = useRef(0);

  // Ingestion State
  const [isDragging, setIsDragging] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus>('IDLE');
  const [extractedData, setExtractedData] = useState<CaseMetadata | null>(null);

  // Assistant State
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantContext, setAssistantContext] = useState('Canvas View - Form Editor');

  // Org Chart State
  const [activeNode, setActiveNode] = useState<OrgNode | null>(null);
  
  const availableForms: FormType[] = ['FL-320', 'DV-100', 'DV-105'];

  // Document persistence for each form
  const {
    user,
    loading,
    documentId,
    handleLogout,
    saveStatus,
    lastSaved,
    saveError,
  } = useDocumentPersistence({
    formData: formDataMap[activeForms[0]?.id] || {},
    fieldPositions: fieldPositionsMap[activeForms[0]?.id] || {},
    validationRules: validationRulesMap[activeForms[0]?.id] || {},
    hasUnsavedChanges,
    setFormData: (data) => {
      if (activeForms[0]?.id) {
        setFormDataMap(prev => ({ ...prev, [activeForms[0].id]: data }));
      }
    },
    setFieldPositions: (positions) => {
      if (activeForms[0]?.id) {
        setFieldPositionsMap(prev => ({ ...prev, [activeForms[0].id]: positions }));
      }
    },
    setValidationRules: (rules) => {
      if (activeForms[0]?.id) {
        setValidationRulesMap(prev => ({ ...prev, [activeForms[0].id]: rules }));
      }
    },
    setVaultSheetOpen: () => {},
  });

  const { vaultData, isVaultLoading, autofillableCount, hasVaultData } = useVaultData(user);

  // Auto-save Restoration for Ingestion
  useEffect(() => {
    const savedDraft = localStorage.getItem('liquid_ingestion_draft');
    if (savedDraft && ingestionStatus === 'IDLE') {
      try {
        const data = JSON.parse(savedDraft);
        setExtractedData(data);
        setIngestionStatus('REVIEW');
        setAssistantContext('Restored Ingestion Session');
      } catch (e) {
        localStorage.removeItem('liquid_ingestion_draft');
      }
    }
  }, []);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.relatedTarget === null) {
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      alert('Please upload a PDF or Image file.');
      return;
    }

    setIngestionStatus('ANALYZING');
    setAssistantContext(`Analyzing document: ${file.name}`);

    // Simulate AI extraction (replace with actual Mistral OCR call)
    setTimeout(() => {
      const mockData: CaseMetadata = {
        caseNumber: 'FL-2025-001234',
        plaintiff: 'Jane Smith',
        defendant: 'John Doe',
        filingDate: new Date().toLocaleDateString(),
        documentType: 'Domestic Violence Restraining Order',
        summary: 'Request for temporary restraining order based on alleged incidents of domestic abuse.'
      };
      setExtractedData(mockData);
      setIngestionStatus('REVIEW');
    }, 2000);
  };

  const handleIngestionConfirm = (data: CaseMetadata) => {
    console.log('Graph Updated with:', data);
    setIngestionStatus('SUCCESS');
    setAssistantContext(`Ingested Case: ${data.caseNumber}`);
    setTimeout(() => {
      setIngestionStatus('IDLE');
      setExtractedData(null);
    }, 3000);
  };

  const handleNodeClick = (node: OrgNode) => {
    setActiveNode(node);
    setAssistantContext(`Selected Court: ${node.role}, Judge ${node.judge}, Dept ${node.dept}`);
  };

  const openForm = useCallback((formType: FormType, originPosition?: { x: number; y: number; width: number; height: number }) => {
    if (originPosition) {
      // Open with expansion animation
      const formId = `form-${formIdCounter.current++}`;
      setExpandingForm({ formId, formType, originPosition });
      setFormDataMap(prev => ({ ...prev, [formId]: {} }));
      setFieldPositionsMap(prev => ({ ...prev, [formId]: {} }));
      setCurrentFieldIndexMap(prev => ({ ...prev, [formId]: 0 }));
      setValidationRulesMap(prev => ({ ...prev, [formId]: {} }));
    } else {
      // Open normally
      const formId = `form-${formIdCounter.current++}`;
      const newForm = {
        id: formId,
        formType,
        position: { x: 100 + activeForms.length * 50, y: 100 + activeForms.length * 50 },
        scale: 0.8
      };
      setActiveForms(prev => [...prev, newForm]);
      setFormDataMap(prev => ({ ...prev, [formId]: {} }));
      setFieldPositionsMap(prev => ({ ...prev, [formId]: {} }));
      setCurrentFieldIndexMap(prev => ({ ...prev, [formId]: 0 }));
      setValidationRulesMap(prev => ({ ...prev, [formId]: {} }));
      setViewMode('FORM');
    }
  }, [activeForms.length]);

  const handleFormExpansionComplete = useCallback(() => {
    // The ExpandingFormViewer will now render the full CanvasFormViewer
    // We just need to mark it as no longer expanding so it stays rendered
    // The form data is already being managed in the expanding form state
  }, []);

  const closeForm = useCallback((formId: string) => {
    setActiveForms(prev => prev.filter(f => f.id !== formId));
    setFormDataMap(prev => {
      const next = { ...prev };
      delete next[formId];
      return next;
    });
    setFieldPositionsMap(prev => {
      const next = { ...prev };
      delete next[formId];
      return next;
    });
  }, []);

  const updateFormField = useCallback((formId: string, field: string, value: string | boolean) => {
    setFormDataMap(prev => ({
      ...prev,
      [formId]: { ...prev[formId], [field]: value }
    }));
  }, []);

  const updateFormFieldPosition = useCallback((formId: string, field: string, position: { top: number; left: number }) => {
    setFieldPositionsMap(prev => ({
      ...prev,
      [formId]: { ...prev[formId], [field]: position }
    }));
  }, []);

  const setFormCurrentFieldIndex = useCallback((formId: string, index: number) => {
    setCurrentFieldIndexMap(prev => ({ ...prev, [formId]: index }));
  }, []);

  const NavItem = ({ icon, label, active, onClick, hasSubmenu, submenuOpen, onSubmenuToggle }: { 
    icon: React.ReactNode, 
    label: string, 
    active: boolean, 
    onClick: () => void,
    hasSubmenu?: boolean,
    submenuOpen?: boolean,
    onSubmenuToggle?: () => void
  }) => (
    <div className="relative">
      <div 
        onClick={onClick}
        className={`
          flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all whitespace-nowrap relative overflow-hidden group/item
          ${active 
            ? 'bg-white/40 border border-white/50 text-blue-700 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]' 
            : 'text-slate-500 hover:bg-white/20 hover:text-slate-800 hover:border hover:border-white/20 border border-transparent'}
        `}
      >
        {active && <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>}
        <div className="min-w-[20px] flex justify-center relative z-10">{icon}</div>
        <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 relative z-10">
          {label}
        </span>
        {hasSubmenu && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSubmenuToggle?.();
            }}
            className={`ml-auto relative z-10 transition-transform ${submenuOpen ? 'rotate-90' : ''}`}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      {hasSubmenu && submenuOpen && (
        <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-2 spring-bounce">
          {availableForms.map(formType => (
            <div
              key={formType}
              onClick={(e) => {
                e.stopPropagation();
                openForm(formType);
                setShowFormSubmenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 liquid-glass rounded-xl cursor-pointer hover:scale-105 text-slate-700 hover:text-slate-900 transition-all spring-snappy text-sm font-medium shadow-[var(--shadow-diffused)] hover:shadow-[var(--shadow-diffused-hover)]"
            >
              <FileText size={14} className="text-blue-600" />
              <span>{formType}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="w-screen h-screen relative bg-slate-50 text-slate-900 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept="application/pdf,image/*"
      />

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl transition-all spring-smooth">
        <div className="
          relative w-full liquid-glass
          rounded-full p-1.5
          flex items-center gap-2
          group shadow-[var(--shadow-diffused)]
          hover:shadow-[var(--shadow-diffused-hover)]
        ">
          
          <div className="pl-4 text-slate-500 group-focus-within:text-blue-600 transition-colors z-10">
            <Search size={18} />
          </div>
          
          <input 
            className="
              flex-1 bg-transparent border-none outline-none 
              text-sm text-slate-800 placeholder-slate-500/70 
              h-10 z-10 font-medium
            "
            placeholder="Search forms, cases, or navigate..."
          />

          <div className="flex items-center gap-2 pr-1.5 z-10">
            <div className="
              w-9 h-9 rounded-full 
              bg-gradient-to-br from-slate-700 to-slate-900 
              text-white flex items-center justify-center 
              font-bold text-xs border-2 border-white/50 shadow-lg
            ">
              JD
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Rail */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[60] group">
        <div className="
          liquid-glass
          rounded-[2rem] p-2 flex flex-col gap-2
          transition-all spring-bounce
          w-14 hover:w-64 overflow-hidden
          shadow-[var(--shadow-elevated)]
          hover:shadow-[var(--shadow-ultra)]
        ">
          <div className="w-10 h-10 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-blue-600 mb-4 mx-auto shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="drop-shadow-sm">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>

          <NavItem 
            icon={<FileText size={20} />} 
            label="Forms" 
            active={viewMode === 'FORM'} 
            onClick={() => {
              setViewMode('FORM');
              setShowFormSubmenu(!showFormSubmenu);
            }}
            hasSubmenu
            submenuOpen={showFormSubmenu}
            onSubmenuToggle={() => setShowFormSubmenu(!showFormSubmenu)}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Court Topology" 
            active={viewMode === 'ORG'} 
            onClick={() => setViewMode('ORG')} 
          />
          <NavItem 
            icon={<Layers size={20} />} 
            label="Procedural Tube" 
            active={viewMode === 'PROCEDURE'} 
            onClick={() => setViewMode('PROCEDURE')} 
          />
          <NavItem 
            icon={<Database size={20} />} 
            label="Data Vault" 
            active={viewMode === 'VAULT'} 
            onClick={() => setViewMode('VAULT')} 
          />
          
          <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent w-full my-1"></div>

          <div
            onClick={triggerFileUpload}
            className="
              flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all whitespace-nowrap group/ingest spring-smooth
              hover:bg-white/20 hover:border hover:border-white/20 text-slate-600
            "
          >
            <div className="min-w-[20px] flex justify-center text-slate-500 group-hover/ingest:text-emerald-600 transition-colors"><CloudUpload size={20} /></div>
            <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity spring-smooth group-hover/ingest:text-emerald-700">Ingest File</span>
          </div>

          <div
            onClick={() => openForm('FL-320')}
            className="
              flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all whitespace-nowrap group/form spring-smooth
              liquid-glass hover:scale-105 text-slate-700 hover:text-emerald-700
              shadow-[var(--shadow-diffused)] hover:shadow-[var(--shadow-diffused-hover)]
            "
          >
            <div className="min-w-[20px] flex justify-center text-slate-500 group-hover/form:text-emerald-600 transition-colors spring-snappy"><FileText size={20} /></div>
            <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity spring-smooth group-hover/form:text-emerald-700">New Form</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <main className="w-full h-full relative">
        <Canvas>
          {viewMode === 'FORM' && (
            <div className="p-8">
              {activeForms.length === 0 && (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="text-center text-slate-400 bg-white/50 p-12 rounded-3xl backdrop-blur-sm border border-white/50">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-slate-600 mb-2">No Forms Open</h2>
                    <p className="text-sm mb-4">Click "New Form" in the navigation to start filling out a form</p>
                    <button
                      onClick={() => openForm('FL-320')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Open FL-320 Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {viewMode === 'ORG' && (
            <OrgChart data={ORG_DATA} onNodeClick={handleNodeClick} />
          )}
          {viewMode === 'PROCEDURE' && (
            <ProceduralTimeline
              phases={PROCEDURAL_FLOWS.EVICTION}
              onFormClick={(formName, cardPosition) => {
                const formType = (FORM_NAME_TO_TYPE[formName] || 'FL-320') as FormType;
                openForm(formType, cardPosition);
              }}
            />
          )}
          {viewMode === 'VAULT' && (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center text-slate-400 bg-white/50 p-12 rounded-3xl backdrop-blur-sm border border-white/50">
                <Database size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-slate-600">Canonical Data Vault</h2>
                <p className="text-sm">Encrypted graph storage for client identity</p>
              </div>
            </div>
          )}
        </Canvas>

        {/* Render Expanding Form (if any) */}
        {expandingForm && (
          <ExpandingFormViewer
            formType={expandingForm.formType}
            formData={formDataMap[expandingForm.formId] || {}}
            updateField={(field, value) => {
              setFormDataMap(prev => ({
                ...prev,
                [expandingForm.formId]: { ...prev[expandingForm.formId], [field]: value }
              }));
            }}
            fieldPositions={fieldPositionsMap[expandingForm.formId] || {}}
            updateFieldPosition={(field, position) => {
              setFieldPositionsMap(prev => ({
                ...prev,
                [expandingForm.formId]: { ...prev[expandingForm.formId], [field]: position }
              }));
            }}
            currentFieldIndex={currentFieldIndexMap[expandingForm.formId] || 0}
            setCurrentFieldIndex={(index) => {
              setCurrentFieldIndexMap(prev => ({ ...prev, [expandingForm.formId]: index }));
            }}
            originPosition={expandingForm.originPosition}
            onClose={() => {
              const formId = expandingForm.formId;
              setExpandingForm(null);
              setFormDataMap(prev => {
                const next = { ...prev };
                delete next[formId];
                return next;
              });
              setFieldPositionsMap(prev => {
                const next = { ...prev };
                delete next[formId];
                return next;
              });
              setCurrentFieldIndexMap(prev => {
                const next = { ...prev };
                delete next[formId];
                return next;
              });
              setValidationRulesMap(prev => {
                const next = { ...prev };
                delete next[formId];
                return next;
              });
            }}
            onAnimationComplete={handleFormExpansionComplete}
          />
        )}

        {/* Render Active Forms */}
        {activeForms.map(form => (
          <CanvasFormViewer
            key={form.id}
            formType={form.formType}
            formData={formDataMap[form.id] || {}}
            updateField={(field, value) => updateFormField(form.id, field, value)}
            fieldPositions={fieldPositionsMap[form.id] || {}}
            updateFieldPosition={(field, position) => updateFormFieldPosition(form.id, field, position)}
            currentFieldIndex={currentFieldIndexMap[form.id] || 0}
            setCurrentFieldIndex={(index) => setFormCurrentFieldIndex(form.id, index)}
            onClose={() => closeForm(form.id)}
            initialPosition={form.position}
            initialScale={form.scale}
          />
        ))}

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-6 z-50 border-4 border-dashed border-blue-400/50 rounded-[3rem] bg-blue-50/30 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-xl px-10 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-bounce border border-white/60">
              <CloudUpload size={56} className="text-blue-500 drop-shadow-lg" />
              <div className="text-xl font-bold text-slate-800">Drop to Ingest</div>
            </div>
          </div>
        )}
      </main>

      {/* Map Pin Overlay for OrgChart */}
      {activeNode && activeNode.lat && viewMode === 'ORG' && (
        <div className="absolute top-24 right-6 z-40 w-80 bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl border border-white/60 p-4 animate-in slide-in-from-right">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800">{activeNode.role}</h3>
              <p className="text-xs text-slate-500">Dept {activeNode.dept}</p>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-xl text-blue-600">
              <MapPin size={18} />
            </div>
          </div>
          <div className="h-32 bg-slate-100 rounded-xl mb-3 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-slate-100"></div>
            <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
              Open Geospatial View
            </span>
          </div>
          <button onClick={() => setActiveNode(null)} className="mt-1 w-full text-xs py-2 text-slate-400 hover:text-slate-600 font-medium">Dismiss</button>
        </div>
      )}

      {/* Ingestion Review Modal */}
      {(ingestionStatus === 'ANALYZING' || ingestionStatus === 'REVIEW') && (
        <IngestionReview
          data={extractedData}
          isLoading={ingestionStatus === 'ANALYZING'}
          onConfirm={handleIngestionConfirm}
          onCancel={() => {
            setIngestionStatus('IDLE');
            setExtractedData(null);
            localStorage.removeItem('liquid_ingestion_draft');
          }}
        />
      )}

      {/* Success Notification */}
      {ingestionStatus === 'SUCCESS' && (
        <div className="fixed top-24 right-6 z-[200] bg-emerald-50/90 backdrop-blur border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-right">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle size={16} /></div>
          <div>
            <div className="font-bold text-sm">Ingestion Complete</div>
            <div className="text-xs opacity-80">Sealed to Personal Data Vault.</div>
          </div>
        </div>
      )}

      {/* Liquid Assistant */}
      <LiquidAssistant
        context={assistantContext}
        isOpen={assistantOpen}
        onToggle={() => setAssistantOpen(!assistantOpen)}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}

