# Implementation Plan (Gemini 3 Pro Architected)

**Goal**: Production-Grade TRO Workflow System with Knowledge Graph Integration.

## Phase 1: Critical Architecture Repair (Immediate)
- [x] **Branch Consolidation**: Merge `improve-canvas-zoom` and fix build. [Gemini]
- [x] **Protocol Definition**: Establish "Claude Code Web Delegation" protocol. [Gemini]
- [ ] **Refactor FormViewer (Agent C)**: Split into `PDFRenderer`, `FieldOverlay`, `DragLayer`. [Gemini]
- [ ] **Bridge Wizard-Viewer Gap**: Integrate `FormViewer` into `TROWorkflowWizard`. [Gemini]

## Phase 2: The "God Mode" & Graph Integration
- [ ] **Visual Knowledge Explorer**: Build `KnowledgeGraphExplorer.tsx` to visualize Neo4j nodes. [Gemini]
- [ ] **Vault Data Lineage**: Tooltips showing provenance of autofilled data. [Gemini]
- [ ] **Refactor FieldNavigation (Agent B)**: Component split. [Gemini]

## Phase 3: Automation & "Revenge"
- [ ] **Assign QA to Claude**: Create Linear tickets for E2E tests on new features. [Gemini]
- [ ] **Self-Healing CI Script**: `scripts/heal.ts` using Memory MCP. [Gemini]
- [ ] **CSS Replica Experiment**: Single-page proof of concept for `JUSTICE-313`. [Gemini]

## Phase 4: Optimization & Compliance
- [ ] **Mistral OCR Tuning**: Optimize edge functions. [Gemini]
- [ ] **Accessibility Guard**: Inject `axe-core` into Playwright. [Gemini]

---
*Last Updated: November 22, 2025*
