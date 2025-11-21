# Stateful Design Implementation Guide

**Date**: November 21, 2025
**Purpose**: Concrete implementation steps for SwiftFill stateful design enhancements

---

## Quick Start: Immediate Wins (This Week)

### 1. Add XState v5 to TRO Workflow

**Install Dependencies**:
```bash
npm install xstate @xstate/react
```

**Refactor useTROWorkflow to XState v5**:

```typescript
// src/machines/troWorkflowMachine.ts
import { createMachine, assign, fromPromise, setup } from 'xstate';

export const troWorkflowMachine = setup({
  types: {
    context: {} as {
      userId: string;
      packetType: PacketType | null;
      forms: Map<FormType, FormActor>;
      currentForm: FormType | null;
      validationErrors: ValidationError[];
    },
    events: {} as
      | { type: 'SELECT_PACKET_TYPE'; packetType: PacketType }
      | { type: 'UPDATE_FIELD'; formType: FormType; field: string; value: any }
      | { type: 'VALIDATE_FORM' }
      | { type: 'NEXT_FORM' }
      | { type: 'PREVIOUS_FORM' }
      | { type: 'SUBMIT_PACKET' },
  },
  actors: {
    loadWorkflow: fromPromise(async ({ input }) => {
      // Load from Supabase
      const { data } = await supabase
        .from('tro_workflows')
        .select('*')
        .eq('user_id', input.userId)
        .single();
      return data;
    }),
    saveWorkflow: fromPromise(async ({ input }) => {
      await supabase
        .from('tro_workflows')
        .upsert(input.workflow);
    }),
    validateForm: fromPromise(async ({ input }) => {
      return validateFormData(input.formType, input.formData);
    }),
  },
  guards: {
    isFormValid: ({ context }) => context.validationErrors.length === 0,
    hasNextForm: ({ context }) => {
      // Check if there's a next form in the packet
      return getNextFormInPacket(context.packetType, context.currentForm) !== null;
    },
  },
}).createMachine({
  id: 'troWorkflow',
  initial: 'loading',
  context: ({ input }) => ({
    userId: input.userId,
    packetType: null,
    forms: new Map(),
    currentForm: null,
    validationErrors: [],
  }),
  states: {
    loading: {
      invoke: {
        src: 'loadWorkflow',
        input: ({ context }) => ({ userId: context.userId }),
        onDone: {
          target: 'packetSelection',
          actions: assign({
            packetType: ({ event }) => event.output?.packet_type,
            currentForm: ({ event }) => event.output?.current_form,
          }),
        },
        onError: 'packetSelection',
      },
    },
    packetSelection: {
      on: {
        SELECT_PACKET_TYPE: {
          target: 'editing',
          actions: assign({
            packetType: ({ event }) => event.packetType,
            currentForm: ({ event }) => getFirstFormInPacket(event.packetType),
          }),
        },
      },
    },
    editing: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            UPDATE_FIELD: {
              actions: [
                'updateFormField',
                'propagateToRelatedForms', // Actor communication!
              ],
            },
            VALIDATE_FORM: 'validating',
            NEXT_FORM: [
              { target: 'validating', guard: 'hasNextForm' },
            ],
          },
        },
        validating: {
          invoke: {
            src: 'validateForm',
            input: ({ context }) => ({
              formType: context.currentForm,
              formData: context.forms.get(context.currentForm),
            }),
            onDone: [
              {
                target: 'idle',
                guard: 'isFormValid',
                actions: 'moveToNextForm',
              },
              {
                target: 'idle',
                actions: assign({
                  validationErrors: ({ event }) => event.output.errors,
                }),
              },
            ],
          },
        },
      },
      on: {
        PREVIOUS_FORM: {
          actions: 'moveToPreviousForm',
        },
      },
    },
    reviewing: {
      on: {
        SUBMIT_PACKET: 'submitting',
        EDIT_FORM: {
          target: 'editing',
          actions: assign({
            currentForm: ({ event }) => event.formType,
          }),
        },
      },
    },
    submitting: {
      invoke: {
        src: 'saveWorkflow',
        onDone: 'complete',
        onError: 'error',
      },
    },
    complete: {
      type: 'final',
    },
    error: {
      on: {
        RETRY: 'submitting',
      },
    },
  },
});
```

**Use in React**:
```typescript
// src/hooks/useTROWorkflowMachine.ts
import { useMachine } from '@xstate/react';
import { troWorkflowMachine } from '../machines/troWorkflowMachine';

export function useTROWorkflowMachine(userId: string) {
  const [state, send, actorRef] = useMachine(troWorkflowMachine, {
    input: { userId },
  });

  return {
    // Current state
    isLoading: state.matches('loading'),
    isEditing: state.matches('editing'),
    isValidating: state.matches('editing.validating'),
    currentForm: state.context.currentForm,
    validationErrors: state.context.validationErrors,

    // Actions
    selectPacketType: (packetType: PacketType) =>
      send({ type: 'SELECT_PACKET_TYPE', packetType }),
    updateField: (formType: FormType, field: string, value: any) =>
      send({ type: 'UPDATE_FIELD', formType, field, value }),
    nextForm: () => send({ type: 'NEXT_FORM' }),
    previousForm: () => send({ type: 'PREVIOUS_FORM' }),
    validate: () => send({ type: 'VALIDATE_FORM' }),

    // Inspector integration
    actorRef, // Pass to Stately Inspector
  };
}
```

---

### 2. Event Sourcing Layer (Supabase)

**Create Event Store Table**:
```sql
-- supabase/migrations/20251121_event_store.sql

CREATE TABLE form_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  workflow_id UUID REFERENCES tro_workflows(id),
  form_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- For event ordering
  sequence_number BIGSERIAL,

  -- For legal-grade audit
  checksum TEXT, -- SHA-256 of event_data
  previous_checksum TEXT, -- Chain integrity

  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      'FIELD_UPDATED',
      'FORM_STARTED',
      'FORM_COMPLETED',
      'FORM_VALIDATED',
      'AI_SUGGESTION_SHOWN',
      'AI_SUGGESTION_ACCEPTED',
      'AI_SUGGESTION_REJECTED',
      'PACKET_SUBMITTED'
    )
  )
);

-- Index for fast replay
CREATE INDEX idx_form_events_workflow ON form_events(workflow_id, sequence_number);
CREATE INDEX idx_form_events_user ON form_events(user_id, created_at);

-- RLS
ALTER TABLE form_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
  ON form_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON form_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Events are immutable - no update/delete policies
```

**Event Publisher Service**:
```typescript
// src/lib/eventStore.ts
import { supabase } from '@/integrations/supabase/client';
import { createHash } from 'crypto-js/sha256';

interface FormEvent {
  formType: string;
  eventType: string;
  eventData: Record<string, any>;
  metadata?: Record<string, any>;
}

class EventStore {
  private lastChecksum: string | null = null;

  async publish(workflowId: string, event: FormEvent): Promise<void> {
    const eventDataStr = JSON.stringify(event.eventData);
    const checksum = createHash(eventDataStr).toString();

    const { error } = await supabase.from('form_events').insert({
      workflow_id: workflowId,
      form_type: event.formType,
      event_type: event.eventType,
      event_data: event.eventData,
      metadata: {
        ...event.metadata,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      checksum,
      previous_checksum: this.lastChecksum,
    });

    if (error) throw error;
    this.lastChecksum = checksum;
  }

  async replay(workflowId: string): Promise<FormEvent[]> {
    const { data, error } = await supabase
      .from('form_events')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('sequence_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getStateAt(workflowId: string, timestamp: Date): Promise<any> {
    const events = await this.replay(workflowId);
    const filteredEvents = events.filter(
      e => new Date(e.created_at) <= timestamp
    );
    return this.aggregateState(filteredEvents);
  }

  private aggregateState(events: FormEvent[]): any {
    // Replay events to reconstruct state
    return events.reduce((state, event) => {
      switch (event.event_type) {
        case 'FIELD_UPDATED':
          return {
            ...state,
            [event.form_type]: {
              ...state[event.form_type],
              [event.event_data.field]: event.event_data.newValue,
            },
          };
        // Handle other event types...
        default:
          return state;
      }
    }, {});
  }
}

export const eventStore = new EventStore();
```

**Integration with Form Updates**:
```typescript
// In your form component
const handleFieldChange = async (field: string, value: any) => {
  const oldValue = formData[field];

  // Update UI immediately
  setFormData(prev => ({ ...prev, [field]: value }));

  // Publish event
  await eventStore.publish(workflowId, {
    formType: 'DV-100',
    eventType: 'FIELD_UPDATED',
    eventData: {
      field,
      oldValue,
      newValue: value,
    },
    metadata: {
      source: 'user_input', // or 'ai_suggestion', 'auto_fill'
    },
  });
};
```

---

### 3. Time-Travel Undo/Redo

**Install Travels**:
```bash
npm install travels mutative
```

**Create Form History Hook**:
```typescript
// src/hooks/useFormHistory.ts
import { create, History } from 'travels';
import { useCallback, useRef, useState } from 'react';

export function useFormHistory<T extends object>(initialData: T) {
  const historyRef = useRef<History<T>>(create(initialData));
  const [state, setState] = useState(initialData);

  const apply = useCallback((recipe: (draft: T) => void) => {
    historyRef.current.apply(recipe);
    setState(historyRef.current.current);
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.canUndo) {
      historyRef.current.undo();
      setState(historyRef.current.current);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyRef.current.canRedo) {
      historyRef.current.redo();
      setState(historyRef.current.current);
    }
  }, []);

  const branch = useCallback(() => {
    return historyRef.current.branch();
  }, []);

  const checkout = useCallback((branchId: string) => {
    historyRef.current.checkout(branchId);
    setState(historyRef.current.current);
  }, []);

  return {
    state,
    apply,
    undo,
    redo,
    branch,
    checkout,
    canUndo: historyRef.current.canUndo,
    canRedo: historyRef.current.canRedo,
    // For UI
    historyLength: historyRef.current.length,
    currentIndex: historyRef.current.index,
  };
}
```

**Add Undo/Redo Controls**:
```typescript
// src/components/FormHistoryControls.tsx
import { Undo, Redo, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormHistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBranch?: () => void;
  historyLength: number;
  currentIndex: number;
}

export function FormHistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBranch,
  historyLength,
  currentIndex,
}: FormHistoryControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <span className="text-xs text-muted-foreground">
        {currentIndex + 1} / {historyLength}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="h-4 w-4" />
      </Button>

      {onBranch && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBranch}
          title="Create branch (try alternative)"
        >
          <GitBranch className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

---

### 4. AI Co-Pilot with Confidence Scores

**Enhanced AI Response Format**:
```typescript
// src/types/AITypes.ts
export interface AISuggestion {
  field: string;
  suggestedValue: string;
  confidence: number; // 0-100
  reasoning: string;
  sources?: string[]; // Legal references
  alternatives?: Array<{
    value: string;
    confidence: number;
    note: string;
  }>;
}

export interface AIResponse {
  suggestions: AISuggestion[];
  warnings?: string[];
  escalationNeeded?: boolean;
  escalationReason?: string;
}
```

**Update Groq Edge Function**:
```typescript
// supabase/functions/groq-chat/index.ts
const systemPrompt = `You are a legal form assistant for California Judicial Council forms.

CRITICAL: For every field suggestion, you MUST provide:
1. The suggested value
2. A confidence score (0-100)
3. Brief reasoning for your suggestion

Format your response as JSON:
{
  "suggestions": [
    {
      "field": "protectedPersonName",
      "suggestedValue": "Jane Doe",
      "confidence": 95,
      "reasoning": "User explicitly stated their name is Jane Doe"
    }
  ],
  "warnings": ["Remember to include all incidents, even verbal threats"],
  "escalationNeeded": false
}

If confidence is below 70%, suggest the user verify the information.
If the question involves complex legal strategy, set escalationNeeded to true.`;
```

**Confidence Score UI Component**:
```typescript
// src/components/AIConfidenceIndicator.tsx
import { cn } from '@/lib/utils';

interface AIConfidenceIndicatorProps {
  confidence: number;
  reasoning?: string;
}

export function AIConfidenceIndicator({
  confidence,
  reasoning,
}: AIConfidenceIndicatorProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 85) return 'text-green-500';
    if (conf >= 70) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 85) return 'High confidence';
    if (conf >= 70) return 'Medium confidence';
    return 'Low confidence - please verify';
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={cn('font-medium', getConfidenceColor(confidence))}>
        {confidence}%
      </div>
      <span className="text-muted-foreground">
        {getConfidenceLabel(confidence)}
      </span>
      {reasoning && (
        <span className="text-muted-foreground italic">
          - {reasoning}
        </span>
      )}
    </div>
  );
}
```

---

## Visual State Debugging (Development)

**Add Stately Inspector**:
```bash
npm install @stately/inspect
```

**Initialize in Development**:
```typescript
// src/main.tsx
import { createBrowserInspector } from '@stately/inspect';

if (import.meta.env.DEV) {
  const inspector = createBrowserInspector();
  // Inspector will automatically connect to XState actors
}
```

**Benefits**:
- Visual state machine diagram in browser
- Time-travel debugging
- Event history
- Sequence diagrams for actor communication

---

## Performance Considerations

### Event Store Scaling
- Use Supabase Edge Functions for event aggregation
- Implement snapshotting for long event histories (every 100 events)
- Consider TimescaleDB for time-series optimization

### XState Actor Memory
- Clean up completed form actors
- Use `@xstate/store` for simpler state without full machines
- Lazy-load form machines

### CRDT Memory (Future)
- Yjs garbage collection for large documents
- Selective sync (only sync active forms)
- Compress historical operations

---

## Testing Strategy

**XState Machine Tests**:
```typescript
// src/machines/__tests__/troWorkflowMachine.test.ts
import { createActor } from 'xstate';
import { troWorkflowMachine } from '../troWorkflowMachine';

describe('TRO Workflow Machine', () => {
  it('should transition from loading to packetSelection', async () => {
    const actor = createActor(troWorkflowMachine, {
      input: { userId: 'test-user' },
    });

    actor.start();

    // Wait for loading to complete
    await waitFor(actor, state => state.matches('packetSelection'));

    expect(actor.getSnapshot().matches('packetSelection')).toBe(true);
  });

  it('should propagate field updates to related forms', () => {
    const actor = createActor(troWorkflowMachine, {
      input: { userId: 'test-user' },
    });

    actor.start();
    actor.send({ type: 'SELECT_PACKET_TYPE', packetType: 'initiating_with_children' });

    // Update petitioner name in DV-100
    actor.send({
      type: 'UPDATE_FIELD',
      formType: 'DV-100',
      field: 'protectedPersonName',
      value: 'Jane Doe',
    });

    // Check it propagated to CLETS-001
    const context = actor.getSnapshot().context;
    expect(context.forms.get('CLETS-001')?.protectedPersonName).toBe('Jane Doe');
  });
});
```

---

## Migration Path

### Week 1
- [ ] Install XState v5, @xstate/react
- [ ] Create troWorkflowMachine.ts
- [ ] Create useTROWorkflowMachine hook
- [ ] Add Stately Inspector for dev

### Week 2
- [ ] Create form_events table
- [ ] Implement EventStore service
- [ ] Integrate event publishing with form updates
- [ ] Add audit trail UI component

### Week 3
- [ ] Install travels
- [ ] Create useFormHistory hook
- [ ] Add undo/redo controls
- [ ] Implement keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)

### Week 4
- [ ] Update Groq edge function for confidence scores
- [ ] Create AIConfidenceIndicator component
- [ ] Add AI suggestion approval workflow
- [ ] Log AI interactions to event store

---

## Success Metrics

1. **Workflow Completion Rate**: % of users completing TRO packets
2. **Time to Complete**: Average time per form
3. **AI Acceptance Rate**: % of AI suggestions accepted
4. **Undo Usage**: Frequency of undo/redo (indicates user confidence)
5. **Error Recovery**: % of errors recovered without support

---

**Author**: Claude Code Agent
**Date**: November 21, 2025
**Status**: Implementation Guide Complete

