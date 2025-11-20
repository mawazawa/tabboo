import { OrgNode, ProceduralPhase } from './types';

export const ORG_DATA: OrgNode = {
  id: 'root',
  role: "Presiding Judge",
  judge: "Rochelle C. East",
  dept: "206",
  court: "Civic Center",
  type: "ADMIN",
  children: [
    {
      id: 'civil_div',
      role: "Civil Master Calendar",
      judge: "Rochelle C. East",
      dept: "206",
      type: "CIVIL",
      children: [
        {
          id: 'dept_501',
          dept: "501",
          judge: "Charles F. Haines",
          role: "Housing",
          desc: "Evictions",
          type: "CIVIL",
          lat: 37.7808,
          lng: -122.4178
        },
        {
          id: 'dept_302',
          dept: "302",
          judge: "Richard B. Ulmer",
          role: "General Civil",
          type: "CIVIL",
        }
      ]
    },
    {
      id: 'family_div',
      role: "Family Law",
      judge: "Monica F. Wiley",
      dept: "403",
      type: "FAMILY",
      children: [
        {
          id: 'dept_404',
          dept: "404",
          judge: "Victor M. Hwang",
          role: "Dissolution",
          type: "FAMILY"
        }
      ]
    }
  ]
} as any;

export const PROCEDURAL_FLOWS: { [key: string]: ProceduralPhase[] } = {
  EVICTION: [
    { 
      phase: "Incident", 
      steps: [
        { title: "Lease Violation", desc: "Event Trigger", forms: [], micro: ["Document Incident"] }
      ] 
    },
    { 
      phase: "Notice", 
      steps: [
        { title: "Serve Notice", desc: "3/30/60 Day Notice", forms: [], micro: ["Draft Notice", "Serve Tenant"] }
      ] 
    },
    { 
      phase: "Filing", 
      steps: [
        { title: "File Complaint", desc: "Start the Lawsuit", forms: ["FL-320", "DV-100"], micro: ["File at Court", "Pay Fee"] },
        { title: "Prejudgment", desc: "Claim of Right", forms: ["DV-105"], micro: [] }
      ] 
    },
    { 
      phase: "Service", 
      steps: [
        { title: "Serve Summons", desc: "Notify Tenant", forms: ["FL-320"], micro: ["Personal Service"] }
      ] 
    },
    {
      phase: "Discovery",
      steps: [
        { title: "Interrogatories", desc: "Fact Finding", forms: ["DV-100"], micro: [] }
      ]
    }
  ],
  TRO: [
    {
      phase: "Initiation",
      steps: [
        { title: "File Request", desc: "Request for Restraining Order", forms: ["DV-100"], micro: ["Complete DV-100", "File with Court"] },
        { title: "Child Custody", desc: "If children involved", forms: ["DV-105"], micro: ["Complete DV-105", "Attach to DV-100"] }
      ]
    },
    {
      phase: "Response",
      steps: [
        { title: "Respond to Request", desc: "File response", forms: ["FL-320"], micro: ["Complete FL-320", "File response"] }
      ]
    }
  ]
};

// Map form names to FormType
export const FORM_NAME_TO_TYPE: Record<string, string> = {
  'FL-320': 'FL-320',
  'DV-100': 'DV-100',
  'DV-105': 'DV-105',
  'UD-100': 'FL-320', // Map to closest match
  'SUM-100': 'FL-320',
  'CP10.5': 'FL-320',
  'POS-010': 'FL-320',
  'DISC-001': 'FL-320',
};
