# SwiftFill Component Index
**Generated**: November 22, 2025
**Total Components**: 98 (35 feature + 63 UI)

---

## Quick Navigation

- [Top-Level Components (35)](#top-level-components-35)
- [UI Components (63)](#ui-components-63)
- [Subdirectory Components](#subdirectory-components)
- [Component Dependencies](#component-dependencies)

---

## Top-Level Components (35)

### Core Form Components
```
src/components/
├── FormViewer.tsx              [374 lines] PDF + field overlay rendering
├── TROWorkflowWizard.tsx        [554 lines] Multi-form workflow orchestration
├── FormTypeSelector.tsx         Form type selection UI
├── FieldNavigationPanel.tsx     Sequential field navigation
└── FieldInspector.tsx           Field property editor
```

### PDF & Document Components
```
src/components/
├── PDFViewer.tsx               PDF display container
├── PDFThumbnailSidebar.tsx     Page thumbnails sidebar
├── ExportPDFButton.tsx         PDF export functionality
└── DocumentUploadPanel.tsx     Document upload interface
```

### AI & Chat
```
src/components/
├── DraggableAIAssistant.tsx    Floating AI chat (draggable)
└── AIAssistant.tsx             AI assistant component
```

### Data Management
```
src/components/
├── PersonalDataVault.tsx       User data vault UI
├── PersonalDataVaultPanel.tsx  Vault sidebar panel
└── DocumentUploadPanel.tsx     Document upload interface
```

### Field Management
```
src/components/
├── FieldGroupManager.tsx       Group related fields
├── FieldInspector.tsx          Field property editor
├── FieldPresetsToolbar.tsx     Quick preset buttons
├── FieldSearchBar.tsx          Field search interface
└── FieldMinimapIndicator.tsx   Field minimap indicator
```

### Utility & Control Panels
```
src/components/
├── CommandPalette.tsx          Cmd+K command palette
├── TemplateManager.tsx         Template save/load
├── PacketProgressPanel.tsx     Workflow progress display
├── PacketPreviewPanel.tsx      Packet preview
├── PacketValidator.tsx         Validation display
├── FilingChecklist.tsx         Filing requirements checklist
└── ValidationRuleEditor.tsx    Validation rule editor
```

### Information & Navigation
```
src/components/
├── OfflineIndicator.tsx        Offline mode indicator
├── AutoSaveIndicator.tsx       Auto-save status
├── OverlayLayer.tsx            Overlay container
├── WelcomeTour.tsx             Interactive onboarding
├── TutorialTooltips.tsx        Contextual help tooltips
└── SEOHead.tsx                 SEO metadata
```

### Utilities & Exploration
```
src/components/
├── JSONPreview.tsx             JSON data viewer
├── KnowledgeGraphExplorer.tsx  Neo4j graph explorer (beta)
├── ErrorBoundary.tsx           Error boundary wrapper
├── AddressAutocomplete.tsx      Google Maps address lookup
└── EFilingExportButton.tsx     E-filing export button
```

---

## UI Components (63)

### Buttons & Actions
```
src/components/ui/
├── button.tsx                  Primary button component
├── button.stories.tsx           Button Storybook stories
├── chamfered-button.tsx        Chamfered edge button (NEW)
└── toggle.tsx, toggle-group.tsx Toggle components
```

### Input & Forms
```
src/components/ui/
├── input.tsx                   Text input component
├── input.stories.tsx           Input stories
├── input-otp.tsx               OTP input for 2FA
├── textarea.tsx                Text area component
├── form.tsx                    Form wrapper component
└── label.tsx                   Form label component
```

### Layout & Structure
```
src/components/ui/
├── card.tsx                    Card container
├── card.stories.tsx            Card stories
├── accordion.tsx               Accordion component
├── accordion.stories.tsx       Accordion stories
├── tabs.tsx                    Tab component
├── breadcrumb.tsx              Breadcrumb navigation
├── pagination.tsx              Pagination control
├── separator.tsx               Visual separator
└── aspect-ratio.tsx            Aspect ratio container
```

### Dialogs & Overlays
```
src/components/ui/
├── dialog.tsx                  Modal dialog
├── alert-dialog.tsx            Confirmation dialog
├── drawer.tsx                  Slide-out drawer
├── popover.tsx                 Tooltip popover
├── dropdown-menu.tsx           Dropdown menu
├── hover-card.tsx              Hover card
└── sheet.tsx                   Sheet component
```

### Selection & Indicators
```
src/components/ui/
├── checkbox.tsx                Checkbox input
├── radio-group.tsx             Radio button group
├── select.tsx                  Dropdown select
├── switch.tsx                  Toggle switch
├── slider.tsx                  Range slider
├── progress.tsx                Progress bar
└── toggle-group.tsx            Button toggle group
```

### Speciality Components
```
src/components/ui/
├── liquid-glass-accordion.tsx   [PREMIUM] Glass morphic accordion
├── liquid-glass-accordion.stories.tsx
├── stateful-button.tsx          Button with process steps
├── stateful-button.stories.tsx
├── command.tsx                  Command/search component
├── calendar.tsx                 Date picker calendar
└── chart.tsx                    Recharts wrapper
```

### Navigation & Organization
```
src/components/ui/
├── navigation-menu.tsx          Navigation menu
├── menubar.tsx                  Menu bar
├── sidebar.tsx                  Sidebar component
└── scroll-area.tsx              Scrollable area with scrollbar
```

### Data Display
```
src/components/ui/
├── table.tsx                    Table component
├── badge.tsx                    Status badge
├── avatar.tsx                   Avatar image
├── skeleton.tsx                 Loading skeleton
└── live-region.tsx              ARIA live region (accessibility)
```

### Utilities & Helpers
```
src/components/ui/
├── alert.tsx                    Alert box
├── toast.tsx                    Toast notification
├── toaster.tsx                  Toast container
├── sonner.tsx                   Sonner toast integration
├── focus-trap.tsx               Focus trap (accessibility)
├── resizable.tsx                Resizable panels
├── resizable-handle-multi.tsx   Multi-handle resizable
├── progressive-image.tsx        Lazy load image
├── progressive-pdf.tsx          Lazy load PDF
├── tooltip.tsx                  Tooltip component
├── context-menu.tsx             Right-click menu
└── use-toast.ts                 Toast hook
```

### Storybook & Documentation
```
src/components/ui/
├── button.stories.tsx
├── card.stories.tsx
├── input.stories.tsx
├── accordion.stories.tsx
├── liquid-glass-accordion.stories.tsx
└── stateful-button.stories.tsx
```

---

## Subdirectory Components

### PDF Components (src/components/pdf/)
```
pdf/
├── PDFPageRenderer.tsx          Individual page rendering
├── FieldOverlay.tsx             Single field overlay
├── FieldOverlayLayer.tsx        All field overlays container
├── DragInteractionLayer.tsx     Drag-and-drop handler
├── AlignmentGuides.tsx          Alignment grid visualization
├── EditModeBanner.tsx           Edit mode indicator
├── PDFLoadingState.tsx          PDF loading UI
├── PDFErrorState.tsx            PDF error UI
├── MappingHUD.tsx               Field mapping interface (NEW)
└── NewFieldDialog.tsx           Add field dialog (NEW)
```

### Navigation Components (src/components/navigation/)
```
navigation/
├── FieldNavigationPanel.tsx     Main panel container
├── FieldList.tsx                Field list view
├── FieldNavigationItem.tsx      Individual field row
├── FieldSearchInput.tsx         Search box
├── FieldSearchSection.tsx       Search results
├── FieldPresetsSection.tsx      Preset buttons
├── FieldNavigationHeader.tsx    Panel header
├── CurrentFieldEditor.tsx       Current field editor
├── FieldNavigationControls.tsx  Navigation buttons
├── FieldPositionControls.tsx    Position controls
└── useFieldNavigationPanel.ts   Hook (logic extraction)
```

### Canvas Components (src/components/canvas/)
```
canvas/
├── Canvas.tsx                   Main canvas view
├── CanvasFormViewer.tsx         Form in canvas
├── ExpandingFormViewer.tsx      Expandable form layout
├── LiquidAssistant.tsx          Liquid glass AI assistant
├── IngestionReview.tsx          Document ingestion review
├── OrgChart.tsx                 Organizational chart
├── ProceduralTimeline.tsx       Timeline visualization
└── NanoBanana.tsx               Custom visualization (NEW)
```

### Form Templates (src/components/forms/)
```
forms/
├── FL320FormTemplate.tsx        FL-320 Response form
├── FL320FormTemplate.css        FL-320 styles
├── DV100FormTemplate.tsx        DV-100 Request form
├── DV100FormTemplate.css        DV-100 styles
├── DV100PixelPerfect.tsx        DV-100 pixel-perfect variant
├── DV101FormTemplate.tsx        DV-101 Abuse Description
├── DV101FormTemplate.css        DV-101 styles
├── DV109FormTemplate.tsx        DV-109 Notice of Hearing
├── DV109FormTemplate.css        DV-109 styles
├── DV110FormTemplate.tsx        DV-110 TRO
├── DV110FormTemplate.css        DV-110 styles
├── DV140FormTemplate.tsx        DV-140 form
├── DV140FormTemplate.css        DV-140 styles
├── DV200FormTemplate.tsx        DV-200 form
├── DV200FormTemplate.css        DV-200 styles
├── CLETS001FormTemplate.tsx     CLETS-001 Confidential
├── CLETS001FormTemplate.css     CLETS-001 styles
└── court-forms.css              Shared court form styles
```

### Confidence Center (src/components/confidence-center/) [NEW]
```
confidence-center/
├── ConfidenceCenter.tsx         Main confidence display (NEW)
├── ConfidenceCenterController.tsx State management (NEW)
├── ConfidenceCenterIcon.tsx     Icon/indicator (NEW)
└── ClarificationCard.tsx        Clarification card (NEW)
```

### Validation Components (src/components/validation/)
```
validation/
├── ValidationErrorList.tsx      Error list display
├── ValidationErrorItem.tsx      Individual error
└── ValidationStatusHeader.tsx   Status header
```

### Upload Components (src/components/upload/)
```
upload/
├── DocumentDropZone.tsx         Drag-drop zone
├── DocumentUploadItem.tsx       Upload item in list
└── EmptyDocumentState.tsx       Empty state UI
```

### Workflow Components (src/components/workflow/)
```
workflow/
├── FormStepIndicator.tsx        Step indicator
├── PacketTypeSelector.tsx       Packet type selection
├── WorkflowNavigationButtons.tsx Navigation buttons
└── WorkflowProgressBar.tsx      Progress bar visualization
```

### Layout Components (src/components/layout/)
```
layout/
├── AdaptiveLayout.tsx           Responsive layout
└── MobileBottomSheet.tsx        Mobile bottom sheet
```

### Speciality (src/components/)
```
components/
├── liquid-slider/               Custom slider component
│   ├── LiquidSlider.tsx         Main slider
│   ├── LiquidSlider.tsx         Stories
│   ├── LiquidSlider.css         Styles
│   └── dist/                    Build output
└── examples/
    └── HapticButtonExamples.tsx Haptic feedback examples
```

---

## Component Dependencies

### FormViewer.tsx Dependencies
```typescript
Imports:
- React, useState, useEffect
- PDF.js, react-pdf
- FieldOverlay components
- DragInteractionLayer
- AlignmentGuides
- PDFPageRenderer
- useFormAutoSave hook
- useKeyboardShortcuts hook
- Validation utilities
- Error tracking
```

### TROWorkflowWizard.tsx Dependencies
```typescript
Imports:
- useTROWorkflow hook (1068 lines)
- PacketProgressPanel
- WorkflowNavigationButtons
- Form components (DV100, DV105, FL320, etc.)
- PacketValidator
- Toast notifications
- Supabase client
- Validation schemas
```

### DraggableAIAssistant.tsx Dependencies
```typescript
Imports:
- useGroqStream hook
- useFormAutoSave hook
- useToast hook
- Card, Button, Input components
- Message history state
- Form context
```

### PersonalDataVaultPanel.tsx Dependencies
```typescript
Imports:
- useVaultData hook
- useVaultAutofill hook
- VaultAutofillButton
- Button, Card, Input components
- Vault integration library
```

---

## Component Size Distribution

| Size Range | Count | Examples |
|------------|-------|----------|
| < 100 lines | 15 | Buttons, badges, separators |
| 100-200 lines | 25 | Input, dialog, cards |
| 200-300 lines | 20 | Navigation, vault panel |
| 300-400 lines | 15 | FormViewer, canvas components |
| 400-500 lines | 15 | TROWizard, main workflows |
| 500+ lines | 8 | TROWizard (554), complex forms |

---

## Component Status

### Production Ready (✅)
- All top-level feature components
- All UI components
- All subdirectory components (except beta)
- ~95 out of 98 components

### Beta / In Progress (🆕)
- KnowledgeGraphExplorer (beta)
- Confidence Center components (new, testing)
- MappingHUD, NewFieldDialog (new)
- NanoBanana visualization (new)

### Testing Status
- Unit tests: 10 component test files
- E2E tests: Critical flows covered
- Storybook: 15+ stories
- Visual regression: Planned

---

## Import Pattern

All components use the `@/` alias:

```typescript
// ✅ Correct
import { FormViewer } from "@/components/FormViewer";
import { Button } from "@/components/ui/button";
import { FieldNavigationPanel } from "@/components/FieldNavigationPanel";

// ❌ Incorrect
import { FormViewer } from "../FormViewer";
import { Button } from "../../ui/button";
```

---

## Component Composition Examples

### Simple Component (Button)
```typescript
// src/components/ui/button.tsx
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
```

### Complex Component (FormViewer)
```typescript
// src/components/FormViewer.tsx
export function FormViewer({ 
  formType, 
  initialData,
  onSave 
}: FormViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const { formData, updateField } = useFormFields();
  const { data: positions } = useQuery({...});
  
  // Render PDF + field overlays
  return (
    <div className="pdf-viewer">
      <PDFPageRenderer pdf={pdfDoc} />
      <FieldOverlayLayer fields={fieldPositions} />
      <DragInteractionLayer onMove={updateField} />
    </div>
  );
}
```

---

## Finding Components by Use Case

### I need to... | Use this component
---|---
Render a PDF | FormViewer, PDFViewer
Add AI chat | DraggableAIAssistant, AIAssistant
Manage form workflow | TROWorkflowWizard
Store/retrieve user data | PersonalDataVaultPanel
Display status/validation | PacketValidator, ValidationErrorList
Allow file upload | DocumentUploadPanel, DocumentDropZone
Navigate form fields | FieldNavigationPanel
Select from list | Select, Dropdown, Radio
Confirm action | AlertDialog, Dialog
Show progress | PacketProgressPanel, WorkflowProgressBar
Display form template | FL320FormTemplate, DV100FormTemplate
Create quick command | CommandPalette
Show help/tooltip | TutorialTooltips, Tooltip
Visualize data | KnowledgeGraphExplorer, OrgChart

---

## Performance Considerations

### Large Components (500+ lines)
- TROWorkflowWizard: Consider splitting into sub-components
- FormViewer: Well-optimized for PDF rendering

### Rendering Performance
- Use React.memo for child components
- Implement proper event delegation
- Lazy load PDF.js worker
- Code split with React.lazy()

### Bundle Impact
- UI components: ~50 KB (gzipped)
- Form components: ~100 KB (gzipped)
- Canvas components: ~80 KB (gzipped)
- Total: ~400 KB gzipped (optimized chunking)

