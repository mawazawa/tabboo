---
created: 2025-11-09T16:46:01.851Z
lastUpdated: 2025-11-09T16:46:01.851Z
author: mawazawa
category: reports
session: speedy-gonzalez-phase1-20251109
tags: [memory-mcp, temporal-fields, knowledge-graphs, schema-design, speedy-gonzalez]
---

# Enhanced Memory-MCP Schema with Temporal Fields and Rich Relation Tagging

**Status**: Research Complete, Implementation Ready
**Last Updated**: 2025-11-09T16:46:01.851Z
**Context**: Speedy Gonzalez Mode Phase 1 - Memory-MCP Schema Enhancement

---

## Summary

Research findings on enhancing memory-mcp schema with temporal fields, rich relation tagging, and time-stamped observations for v0-justice-os-ai Speedy Gonzalez Mode implementation.

**Key Findings**:
- ✅ External implementations (Graphiti, Zep, OpenAI Temporal Agents) encourage tagging relations (WORKS_AT, MENTORS) and time-stamping observations
- ✅ Temporal fields enable point-in-time queries, confidence decay, and relationship lifecycle tracking
- ✅ Rich relation labels with metadata improve downstream analytics and semantic search
- ✅ Statement decomposition (one event per observation) critical for temporal accuracy
- ✅ Memory Managers should implement aging, pruning, deduplication, and conflict resolution

**Objective**: Extend basic memory-mcp seed template to include temporal metadata and richer relation labels for improved long-term project context persistence and retrieval.

**Affected Areas**: Memory-MCP configuration, seeding protocol, Phase 1 verification checklist

---

## Context

### Why Now?

During Speedy Gonzalez Mode research (Part 7: MCP Configuration), user noted:
> "Schema richness: external implementations encourage tagging relations (e.g., WORKS_AT, Mentors) and time-stamping observations. Our seed template can be extended to include temporal fields and richer relation labels to improve downstream analytics."

### Prior Work

- **Speedy Gonzalez Mode Research**: [docs/reports/2025/11/20251108T195700Z_speedy-gonzalez-mode-multi-agent-graph-driven-development-research.md](./20251108T195700Z_speedy-gonzalez-mode-multi-agent-graph-driven-development-research.md)
- **MCP Integration Guide**: [docs/runbooks/mcp-speedy-gonzalez-integration.md](../../runbooks/mcp-speedy-gonzalez-integration.md)
- **GitGraph MCP Fix**: [docs/reports/2025/11/20251108T214321Z_gitgraph-mcp-fix-added-working-directory-configuration.md](./20251108T214321Z_gitgraph-mcp-fix-added-working-directory-configuration.md)

### Research Sources

1. **Graphiti (Zep)**: Temporal Knowledge Graph Architecture with episodic/semantic memory
2. **OpenAI Cookbook**: Temporal Agents with Knowledge Graphs
3. **MCP Server Best Practices (2025)**: Statement decomposition, memory management, scalability
4. **Medium Articles**: Agents That Remember, Temporal Knowledge Graphs as Long-Term Memory

---

## Details

### 1. Temporal Fields Architecture

#### Core Temporal Metadata

Every memory entity, relation, and observation should include temporal metadata:

```typescript
interface TemporalMetadata {
  createdAt: string;        // ISO 8601 timestamp (when fact was recorded)
  updatedAt: string;        // Last modification timestamp
  validFrom?: string;       // When fact became true (may differ from createdAt)
  validTo?: string;         // When fact became false (null = still valid)
  accessedAt?: string;      // Last access for analytics (optional)
  confidence?: number;      // 0.0-1.0 confidence score
  confidenceDecayHalfLife?: number; // Days for confidence to decay to 50% (default: 30)
}
```

**Example**:
```json
{
  "createdAt": "2025-11-09T16:46:00Z",
  "updatedAt": "2025-11-09T16:46:00Z",
  "validFrom": "2025-10-15T00:00:00Z",
  "validTo": null,
  "confidence": 1.0,
  "confidenceDecayHalfLife": 30
}
```

#### Point-in-Time Queries

Temporal fields enable querying knowledge state at any historical moment:

```
Query: "What was the auth system on October 1, 2025?"

Result: "Clerk" (because validFrom = 2024-01-01, validTo = 2025-10-15)

Query: "What is the auth system now?"

Result: "Supabase Auth" (because validFrom = 2025-10-15, validTo = null)
```

#### Confidence Decay Over Time

Observations automatically lose confidence as they age (default 30-day half-life):

```typescript
function calculateDecayedConfidence(
  initialConfidence: number,
  createdAt: Date,
  halfLifeDays: number = 30
): number {
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.pow(0.5, ageInDays / halfLifeDays);
  return initialConfidence * decayFactor;
}

// Example: Observation from 60 days ago
// Initial confidence: 0.8
// Current confidence: 0.8 * 0.5^(60/30) = 0.8 * 0.25 = 0.2
```

### 2. Rich Relation Tagging

#### Relation Structure with Metadata

Instead of simple triples (`mathieu MAINTAINS v0-justice-os-ai`), use rich relations:

```typescript
interface Relation {
  from: string;             // Source entity ID
  to: string;               // Target entity ID
  type: string;             // Active voice verb (MAINTAINS, IMPLEMENTS, REQUIRES, FORBIDS)
  strength: number;         // 0.0-1.0 confidence in relationship
  temporal: TemporalMetadata;
  tags: string[];           // Categorization tags
  metadata: {               // Structured data
    frequency?: "once" | "daily" | "weekly" | "monthly" | "continuous";
    criticality?: "low" | "medium" | "high" | "critical";
    source?: "inferred" | "explicit" | "learned" | "observed";
    context?: string;       // Why this relation exists
    evidence?: string[];    // Supporting evidence (commit hashes, issue IDs)
  };
}
```

#### Example Rich Relations for v0-justice-os-ai

```json
{
  "from": "mathieu",
  "to": "v0-justice-os-ai",
  "type": "MAINTAINS",
  "strength": 1.0,
  "temporal": {
    "createdAt": "2025-11-09T16:46:00Z",
    "validFrom": "2024-01-01T00:00:00Z",
    "validTo": null
  },
  "tags": ["ownership", "founder", "daily-work", "primary-maintainer"],
  "metadata": {
    "frequency": "daily",
    "criticality": "critical",
    "source": "explicit",
    "context": "Founder and sole maintainer of JusticeOS platform",
    "evidence": ["git log --author='mathieu'"]
  }
}
```

```json
{
  "from": "v0-justice-os-ai",
  "to": "Supabase-Auth",
  "type": "REQUIRES",
  "strength": 1.0,
  "temporal": {
    "createdAt": "2025-11-09T16:46:00Z",
    "validFrom": "2025-10-15T00:00:00Z",
    "validTo": null
  },
  "tags": ["architecture", "authentication", "non-negotiable", "migration"],
  "metadata": {
    "frequency": "continuous",
    "criticality": "critical",
    "source": "explicit",
    "context": "Migrated from Clerk to Supabase Auth on 2025-10-15",
    "evidence": ["commit:migration-hash", "docs/decisions/clerk-to-supabase-migration.md"]
  }
}
```

```json
{
  "from": "v0-justice-os-ai",
  "to": "Clerk",
  "type": "FORBIDS",
  "strength": 1.0,
  "temporal": {
    "createdAt": "2025-11-09T16:46:00Z",
    "validFrom": "2025-10-15T00:00:00Z",
    "validTo": null
  },
  "tags": ["architecture", "banned", "authentication", "migration"],
  "metadata": {
    "frequency": "continuous",
    "criticality": "critical",
    "source": "explicit",
    "context": "Permanently banned after migration to Supabase Auth",
    "evidence": ["grep -r 'PERMANENTLY BANNED' CLAUDE.md"]
  }
}
```

#### Relation Type Taxonomy

**Development Relations**:
- MAINTAINS, CONTRIBUTES-TO, REVIEWS, APPROVES
- CREATED, AUTHORED, MODIFIED, DELETED

**Architectural Relations**:
- REQUIRES, DEPENDS-ON, IMPORTS, EXPORTS
- CALLS, INVOKES, TRIGGERS, LISTENS-TO
- IMPLEMENTS, EXTENDS, OVERRIDES
- FORBIDS, BANS, DEPRECATES, REPLACES

**Organizational Relations**:
- WORKS-AT, MENTORS, REPORTS-TO, COLLABORATES-WITH
- OWNS, MANAGES, LEADS, PARTICIPATES-IN

**Knowledge Relations**:
- KNOWS-ABOUT, LEARNED, DISCOVERED, OBSERVED
- HYPOTHESIZES, VALIDATES, REFUTES, CONFIRMS

### 3. Time-Stamped Observations (Episodic Memory)

#### Observation Structure

Observations capture discrete facts about entities at specific moments:

```typescript
interface Observation {
  about: string;            // Entity ID this observation describes
  content: string;          // Rich narrative (complete context story, not fragments)
  confidence: number;       // 0.0-1.0 confidence score
  temporal: TemporalMetadata;
  episodeId?: string;       // Session/commit/event identifier
  tags: string[];           // Categorization
  metadata: {
    sessionType?: "development" | "planning" | "debugging" | "review" | "research";
    triggeredBy?: "user-explicit" | "agent-inferred" | "pattern-learned" | "system-observed";
    linkedCommits?: string[];  // Git commit hashes
    linkedIssues?: string[];   // Linear issue identifiers
    linkedFiles?: string[];    // File paths
    context?: string;          // Why this observation matters
  };
}
```

#### Statement Decomposition (Critical Best Practice)

**Rule**: One observation = One temporal event

**❌ Bad (Multiple Events)**:
```json
{
  "content": "Implemented Neo4j schema, added memory-mcp, configured git-mcp, and pushed to main"
}
```

**✅ Good (Decomposed)**:
```json
[
  {
    "content": "Implemented Neo4j knowledge graph schema with 9 node types and 11 relationship types for codebase representation",
    "temporal": { "createdAt": "2025-11-08T19:00:00Z" },
    "episodeId": "speedy-gonzalez-phase1-neo4j"
  },
  {
    "content": "Added memory-mcp server to canonical MCP config with custom storage location and namespace isolation",
    "temporal": { "createdAt": "2025-11-08T20:30:00Z" },
    "episodeId": "speedy-gonzalez-phase1-memory-mcp"
  },
  {
    "content": "Configured git-mcp server with explicit repository path for blame-aware refactoring",
    "temporal": { "createdAt": "2025-11-08T21:00:00Z" },
    "episodeId": "speedy-gonzalez-phase1-git-mcp"
  },
  {
    "content": "Pushed Speedy Gonzalez Phase 1 infrastructure commits to main branch",
    "temporal": { "createdAt": "2025-11-08T21:57:00Z" },
    "linkedCommits": ["f8d5b342", "436b31e9"]
  }
]
```

#### Example Episodic Observation for v0-justice-os-ai

```json
{
  "about": "speedy-gonzalez-mode",
  "content": "Phase 1 infrastructure 90% complete: Neo4j schema designed (9 node types, 11 relationships), ETL pipeline implemented (TypeScript AST → graph), memory-mcp and git-mcp added to canonical config (12 total servers). Awaiting user setup: Neo4j Aura credentials, Claude Desktop restart, memory seeding.",
  "confidence": 1.0,
  "temporal": {
    "createdAt": "2025-11-09T16:46:00Z",
    "validFrom": "2025-11-08T19:00:00Z",
    "validTo": null
  },
  "episodeId": "speedy-gonzalez-phase1-session-20251109",
  "tags": ["velocity", "infrastructure", "phase1", "knowledge-graph", "active-initiative"],
  "metadata": {
    "sessionType": "development",
    "triggeredBy": "user-explicit",
    "linkedCommits": ["f8d5b342", "436b31e9", "c97802c7"],
    "linkedIssues": ["SPEEDY-GONZALEZ-MODE"],
    "linkedFiles": [
      "docs/architecture/neo4j-schema.md",
      "scripts/neo4j/setup-neo4j.ts",
      "scripts/neo4j/codebase-to-graph.ts"
    ],
    "context": "Infrastructure setup for 10-50x velocity improvement via knowledge graphs and persistent memory"
  }
}
```

### 4. Memory Management Policies

#### Aging and Decay

```typescript
// Confidence decay policy
const decayPolicies = {
  observations: {
    technical: { halfLife: 30 },     // Technical facts decay slower
    preference: { halfLife: 90 },     // User preferences decay very slow
    temporary: { halfLife: 7 }        // Temporary context decays fast
  },
  relations: {
    architectural: { halfLife: 180 }, // Architecture stable
    organizational: { halfLife: 30 }, // Team changes
    learned: { halfLife: 60 }         // Learned patterns
  }
};
```

#### Pruning Strategy

```typescript
// Remove observations with confidence < threshold
const pruningThresholds = {
  lowConfidence: 0.1,      // Remove if confidence decayed below 10%
  ageLimit: 365,           // Remove observations older than 1 year
  unreferencedLimit: 90    // Remove if not accessed in 90 days
};
```

#### Deduplication

```typescript
// Merge duplicate observations
function deduplicateObservations(obs1: Observation, obs2: Observation): Observation {
  // If semantically similar (cosine similarity > 0.9)
  // Keep observation with higher confidence
  // Merge metadata and evidence
  return {
    ...obs1,
    confidence: Math.max(obs1.confidence, obs2.confidence),
    metadata: {
      ...obs1.metadata,
      ...obs2.metadata,
      evidence: [
        ...(obs1.metadata.evidence || []),
        ...(obs2.metadata.evidence || [])
      ]
    }
  };
}
```

#### Conflict Resolution

```typescript
// LLM-powered contradiction detection
async function resolveContradictions(
  newObservation: Observation,
  existingObservations: Observation[]
): Promise<Resolution> {
  // Find semantically related observations with temporal overlap
  const conflicts = existingObservations.filter(obs =>
    semanticSimilarity(obs.content, newObservation.content) > 0.7 &&
    temporalOverlap(obs.temporal, newObservation.temporal)
  );

  if (conflicts.length > 0) {
    // LLM decides which observation to keep/invalidate
    const resolution = await llm.resolveConflict(newObservation, conflicts);

    // Invalidate old observations by setting validTo
    conflicts.forEach(obs => {
      obs.temporal.validTo = newObservation.temporal.validFrom;
    });

    return resolution;
  }
}
```

### 5. Enhanced Memory Seeding Protocol for v0-justice-os-ai

```
Please remember the following project context with temporal metadata:

**Project Entity** (v0-justice-os-ai):
- Type: "legal-tech"
- Stack: "Next.js 15.5.6, React 19, TypeScript 5, Supabase, PostgreSQL"
- Auth: "Supabase Auth"
- Deployment: "Vercel"
- Mission: "AI-native legal tech for 75 million self-represented litigants"
- Temporal: { createdAt: "2024-01-01T00:00:00Z", validFrom: "2024-01-01T00:00:00Z" }

**Developer Entity** (mathieu):
- Name: "Mathieu Wauters"
- Role: "founder"
- Company: "EmpathyLabs.ai"
- WorkingDir: "/Users/mathieuwauters/Desktop/code/v0-justice-os-ai"
- Temporal: { createdAt: "2024-01-01T00:00:00Z" }

**Relations (with temporal metadata and rich tags)**:

1. mathieu MAINTAINS v0-justice-os-ai
   - Strength: 1.0
   - Temporal: { validFrom: "2024-01-01T00:00:00Z", validTo: null }
   - Tags: ["ownership", "founder", "daily-work", "primary-maintainer"]
   - Metadata: {
       frequency: "daily",
       criticality: "critical",
       source: "explicit",
       context: "Founder and sole maintainer"
     }

2. v0-justice-os-ai REQUIRES Supabase-Auth
   - Strength: 1.0
   - Temporal: { validFrom: "2025-10-15T00:00:00Z", validTo: null }
   - Tags: ["architecture", "authentication", "non-negotiable", "migration"]
   - Metadata: {
       frequency: "continuous",
       criticality: "critical",
       source: "explicit",
       context: "Migrated from Clerk on 2025-10-15"
     }

3. v0-justice-os-ai FORBIDS Clerk
   - Strength: 1.0
   - Temporal: { validFrom: "2025-10-15T00:00:00Z", validTo: null }
   - Tags: ["architecture", "banned", "authentication"]
   - Metadata: {
       frequency: "continuous",
       criticality: "critical",
       source: "explicit",
       context: "Permanently banned after Supabase migration"
     }

4. v0-justice-os-ai IMPLEMENTS dual-system
   - Strength: 1.0
   - Temporal: { validFrom: "2024-06-01T00:00:00Z", validTo: null }
   - Tags: ["architecture", "PrinciplesOS", "JusticeOS", "separation-of-concerns"]
   - Metadata: {
       criticality: "high",
       context: "PrinciplesOS (internal) + JusticeOS (product)"
     }

**Episodic Observations (time-stamped, decomposed)**:

1. About: speedy-gonzalez-mode
   Content: "Phase 1 infrastructure 90% complete: Neo4j schema (9 nodes, 11 relations), ETL pipeline (TypeScript AST → graph), memory-mcp + git-mcp configured (12 total servers). Awaiting: Neo4j Aura credentials, Claude Desktop restart, memory seeding."
   Confidence: 1.0
   Temporal: { createdAt: "2025-11-09T16:46:00Z", validFrom: "2025-11-08T19:00:00Z" }
   EpisodeId: "speedy-gonzalez-phase1-20251109"
   Tags: ["velocity", "infrastructure", "active-initiative", "phase1"]
   Metadata: {
     sessionType: "development",
     triggeredBy: "user-explicit",
     linkedCommits: ["f8d5b342"],
     linkedIssues: ["SPEEDY-GONZALEZ-MODE"]
   }

2. About: mathieu
   Content: "Prefers DEEPSHAFT lane-based workflow for parallel work to prevent file conflicts. Mainline discipline: push to main after 1-3 commits."
   Confidence: 0.9
   Temporal: { createdAt: "2025-11-09T16:46:00Z" }
   Tags: ["workflow", "preferences", "deepshaft", "mainline"]
   Metadata: {
     sessionType: "planning",
     triggeredBy: "pattern-learned"
   }

3. About: v0-justice-os-ai
   Content: "Build time baseline ~120 seconds, target 6-72s after Phase 4 optimization. Context re-establishment baseline ~10 minutes, target < 1 minute after memory-mcp seeding."
   Confidence: 0.8
   Temporal: { createdAt: "2025-11-09T16:46:00Z" }
   Tags: ["performance", "metrics", "baseline"]
   Metadata: {
     sessionType: "research",
     triggeredBy: "user-explicit"
   }

4. About: retardation-award-20251108
   Content: "Week 45 of 2025 #retardoftheweek: DOUBLE award for (1) declaring 'no MCP access' without using WebSearch alternative, (2) delegating Linear issue creation to user instead of checking credentials first. Lesson: TROUBLESHOOT FIRST, CHECK THEN ACT, NEVER DELEGATE WHAT YOU CAN DO."
   Confidence: 1.0
   Temporal: { createdAt: "2025-11-08T21:58:00Z", validFrom: "2025-11-08T13:58:00Z" }
   Tags: ["lessons-learned", "failures", "retardation-award", "embarrassment"]
   Metadata: {
     sessionType: "review",
     triggeredBy: "user-explicit",
     linkedFiles: ["docs/decisions/2025/11/20251108T215800Z_mcp-servers-failed-after-npm-to-pnpm-migration-root-cause-and-sop.md"]
   }
```

### 6. Downstream Analytics Enabled by Rich Schema

#### Temporal Queries

```
Query: "Show me all observations from the last 7 days"

Query: "What was the project status on November 1, 2025?"

Query: "When did we migrate from Clerk to Supabase Auth?"

Query: "Show relationship evolution for v0-justice-os-ai REQUIRES [auth-system]"
```

#### Relation Analytics

```
Query: "What are all CRITICAL relations for v0-justice-os-ai?"

Query: "Show DAILY frequency relations for mathieu"

Query: "Find all FORBIDS relations (banned dependencies)"

Query: "What LEARNED patterns exist with confidence > 0.8?"
```

#### Confidence Tracking

```
Query: "Show observations with decayed confidence < 0.3 (candidates for pruning)"

Query: "List all observations that need re-validation (age > 90 days)"

Query: "Find high-confidence (> 0.9) observations created in last 30 days"
```

#### Episode Reconstruction

```
Query: "Reconstruct timeline for episodeId: speedy-gonzalez-phase1-20251109"

Query: "Show all observations linked to commit f8d5b342"

Query: "What happened during development sessions in November 2025?"
```

### 7. Implementation Checklist

**Phase 1: Basic Temporal Fields**
- [ ] Update memory-mcp seeding protocol with createdAt, validFrom, validTo
- [ ] Add confidence scores to all observations
- [ ] Test point-in-time queries ("What was auth system on Oct 1?")

**Phase 2: Rich Relation Tagging**
- [ ] Extend relations with tags (ownership, architecture, workflow)
- [ ] Add metadata (frequency, criticality, source, context)
- [ ] Test relation filtering ("Show all CRITICAL relations")

**Phase 3: Episodic Memory**
- [ ] Decompose multi-event observations into single-event observations
- [ ] Add episodeId, linkedCommits, linkedIssues to observations
- [ ] Test episode reconstruction ("Timeline for speedy-gonzalez-phase1")

**Phase 4: Memory Management**
- [ ] Implement confidence decay (30-day half-life)
- [ ] Add pruning policy (remove confidence < 0.1)
- [ ] Implement deduplication (merge similar observations)
- [ ] Add contradiction detection (LLM-powered conflict resolution)

**Phase 5: Analytics Dashboard**
- [ ] Query interface for temporal data
- [ ] Relation graph visualization
- [ ] Confidence tracking over time
- [ ] Episode timeline view

---

## Related Documentation

- **Speedy Gonzalez Mode Research**: [docs/reports/2025/11/20251108T195700Z_speedy-gonzalez-mode-multi-agent-graph-driven-development-research.md](./20251108T195700Z_speedy-gonzalez-mode-multi-agent-graph-driven-development-research.md)
- **MCP Integration Guide**: [docs/runbooks/mcp-speedy-gonzalez-integration.md](../../runbooks/mcp-speedy-gonzalez-integration.md)
- **Graphiti Architecture**: [Temporal Knowledge Graphs for Agentic Apps](https://blog.getzep.com/graphiti-knowledge-graphs-for-agents/)
- **OpenAI Temporal Agents**: [Temporal Agents with Knowledge Graphs](https://cookbook.openai.com/examples/partners/temporal_agents_with_knowledge_graphs/temporal_agents_with_knowledge_graphs)
- **MCP Best Practices 2025**: [7 MCP Server Best Practices](https://www.marktechpost.com/2025/07/23/7-mcp-server-best-practices-for-scalable-ai-integrations-in-2025/)

---

**Next Steps**:
1. ✅ Research complete (this document)
2. ⏳ Update memory-mcp seeding protocol with temporal fields
3. ⏳ Seed memory-mcp in Claude Desktop with enhanced schema
4. ⏳ Test temporal queries and relation analytics
5. ⏳ Implement confidence decay and memory management policies

---

_Research conducted via WebSearch on 2025-11-09, documenting best practices from Graphiti, Zep, OpenAI Temporal Agents, and MCP server implementations as of 2025._
