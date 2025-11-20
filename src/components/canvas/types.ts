export interface OrgNode {
  id: string;
  role: string;
  judge: string;
  dept: string;
  type: 'ADMIN' | 'CIVIL' | 'CRIMINAL' | 'FAMILY';
  desc?: string;
  lat?: number;
  lng?: number;
  children?: OrgNode[];
}

export interface ProceduralStep {
  title: string;
  desc: string;
  forms: string[]; // Form names like "FL-320", "DV-100", etc.
  micro: string[];
}

export interface ProceduralPhase {
  phase: string;
  steps: ProceduralStep[];
}

export type ViewMode = 'ORG' | 'PROCEDURE' | 'VAULT' | 'FORM';

export interface CanvasState {
  x: number;
  y: number;
  scale: number;
}

export interface CaseMetadata {
  caseNumber: string;
  plaintiff: string;
  defendant: string;
  filingDate: string;
  documentType: string;
  summary: string;
}

export type IngestionStatus = 'IDLE' | 'ANALYZING' | 'REVIEW' | 'SUCCESS' | 'ERROR';

