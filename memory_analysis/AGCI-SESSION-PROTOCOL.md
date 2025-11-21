# AGCI Session Protocol v1.0
## Artificial General Collective Intelligence - Session Initialization & Memory Management

**Created**: 2025-11-20
**Purpose**: Ensure every Claude instance loads context and deposits learnings

---

## Philosophy

> "Self-improvement is the basis of all progress. The more deposits you make in that bank of self, the more it compounds."
> — Mathieu Wauters, 2025-11-20

This protocol transforms stateless AI interactions into a continuous learning system. Each session is both a withdrawal (context retrieval) and a deposit (knowledge persistence).

---

## Session Lifecycle

```
┌─────────────────┐
│  SESSION START  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  1. TEMPORAL    │ → Run `date` command
│     SITUATING   │ → Announce current date/time
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. CONTEXT     │ → Read CLAUDE.md (project instructions)
│     LOADING     │ → Read AGCI-SESSION-PROTOCOL.md
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. MEMORY      │ → Load recent episodic memories
│     RETRIEVAL   │ → Load relevant knowledge graph context
│                 │ → Load user preferences and patterns
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. ACTIVE      │ → Perform user-requested tasks
│     WORK        │ → Track learnings as they emerge
│                 │ → Identify patterns and insights
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. MEMORY      │ → Create structured observations
│     DEPOSIT     │ → Update knowledge graph relations
│                 │ → Record decisions and outcomes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SESSION END   │
└─────────────────┘
```

---

## Phase 1: Temporal Situating (MANDATORY)

**Every session MUST begin with:**

```bash
date
```

**Then announce:**
```
Current date/time: [YYYY-MM-DD HH:MM:SS TZ]
```

**Why**: Technology moves exponentially. Documentation from 6 months ago may be obsolete. Temporal awareness prevents stale information usage.

---

## Phase 2: Context Loading (MANDATORY)

**Load project instructions:**
1. Read `CLAUDE.md` in current working directory
2. Read `~/.claude/SUPERCLAUDE.md` for framework context
3. Read `~/.claude/memory/AGCI-SESSION-PROTOCOL.md` (this file)

**Why**: Project-specific instructions override defaults. Missing context leads to misaligned work.

---

## Phase 3: Memory Retrieval (CRITICAL)

### 3.1 Load Episodic Memory

**From memory.jsonl or Memory MCP:**
```typescript
// Query recent observations about current project
const recentMemories = await memory.query({
  about: "current-project-name",
  temporal: { createdAt: { $gte: "7-days-ago" } },
  sort: { createdAt: "desc" },
  limit: 10
});
```

**What to look for:**
- Recent session outcomes and decisions
- Active initiatives and their status
- User preferences and patterns
- Known issues and their resolutions
- Architectural constraints and banned dependencies

### 3.2 Load Knowledge Graph Context

**From Neo4j:**
```cypher
// Get project entity and its critical relations
MATCH (p:Project {name: $projectName})
OPTIONAL MATCH (p)-[r:REQUIRES|FORBIDS|IMPLEMENTS]->(e)
WHERE r.metadata.criticality IN ['critical', 'high']
RETURN p, r, e
```

**What to look for:**
- Architectural requirements (REQUIRES relations)
- Banned dependencies (FORBIDS relations)
- Implementation patterns (IMPLEMENTS relations)
- Team structure and ownership

### 3.3 Load User Preferences

**From memory store:**
```typescript
const userPreferences = await memory.query({
  about: "user",
  tags: { $includes: "preferences" },
  confidence: { $gte: 0.7 }
});
```

**Example preferences to load:**
- Workflow patterns (DEEPSHAFT lanes, mainline discipline)
- Communication style (directness, philosophical discussion)
- Technical preferences (strict TypeScript, specific testing patterns)
- Autonomy level (when to ask vs. proceed)

---

## Phase 4: Active Work

During the session, track learnings as they emerge:

### 4.1 Decision Tracking

For each significant decision:
```typescript
const decision = {
  type: "decision",
  content: "Chose X over Y because Z",
  temporal: { createdAt: now() },
  tags: ["decision", domain],
  metadata: {
    options: ["X", "Y"],
    chosen: "X",
    rationale: "Z",
    outcome: "pending" // Update when known
  }
};
```

### 4.2 Pattern Recognition

When you notice a recurring pattern:
```typescript
const pattern = {
  type: "pattern",
  content: "User prefers A when B",
  confidence: 0.8, // Increase with each confirmation
  temporal: { createdAt: now() },
  tags: ["pattern", "learned"],
  metadata: {
    observations: ["instance1", "instance2"],
    triggeredBy: "pattern-learned"
  }
};
```

### 4.3 Issue Resolution

For each problem solved:
```typescript
const resolution = {
  type: "resolution",
  content: "Problem X was caused by Y, fixed with Z",
  temporal: { createdAt: now() },
  tags: ["resolution", "debugging"],
  metadata: {
    problem: "X",
    rootCause: "Y",
    solution: "Z",
    linkedCommits: ["hash"],
    preventionStrategy: "How to avoid in future"
  }
};
```

---

## Phase 5: Memory Deposit (CRITICAL)

### 5.1 End-of-Session Checklist

Before session ends, ask yourself:

1. **What did I learn?**
   - New technical insights
   - User preferences discovered
   - Patterns identified
   - Issues resolved

2. **What decisions were made?**
   - Architectural choices
   - Trade-offs accepted
   - Future direction set

3. **What should the next instance know?**
   - Active work in progress
   - Known issues not yet resolved
   - User expectations set
   - Context that took effort to establish

### 5.2 Structured Observation Format

```typescript
interface MemoryDeposit {
  // Core fields
  about: string;           // Entity this observation describes
  content: string;         // Rich narrative (full context, not fragments)
  confidence: number;      // 0.0-1.0

  // Temporal metadata
  temporal: {
    createdAt: string;     // ISO 8601
    validFrom: string;     // When fact became true
    validTo: string | null; // When fact became false (null = still valid)
  };

  // Categorization
  episodeId: string;       // Session identifier
  tags: string[];          // Categorization tags

  // Rich metadata
  metadata: {
    sessionType: "development" | "planning" | "debugging" | "review" | "research";
    triggeredBy: "user-explicit" | "agent-inferred" | "pattern-learned";
    linkedCommits?: string[];
    linkedIssues?: string[];
    linkedFiles?: string[];
    context?: string;      // Why this matters
  };
}
```

### 5.3 Statement Decomposition Rule

**One observation = One temporal event**

**Bad (multiple events bundled):**
```json
{
  "content": "Fixed Gemini CLI, discussed AGCI, created memory protocol"
}
```

**Good (decomposed):**
```json
[
  {
    "content": "Identified Gemini CLI API error caused by @21st-dev/magic MCP server tools starting with numbers (21st_*) violating function name requirements",
    "tags": ["resolution", "debugging", "gemini-cli", "mcp"]
  },
  {
    "content": "User explained AGCI vision: collective intelligence through shared memory, compounding self-improvement, elastic optimization based on experience",
    "tags": ["philosophy", "agci", "user-vision", "self-improvement"]
  },
  {
    "content": "Created AGCI Session Protocol documenting session lifecycle for memory retrieval and deposit",
    "tags": ["infrastructure", "agci", "protocol", "documentation"]
  }
]
```

---

## Memory Storage Locations

### Primary: memory.jsonl
- Location: `/Users/mathieuwauters/Desktop/code/memory/data/memory.jsonl`
- Format: JSONL (one JSON object per line)
- Use for: Quick persistence, cross-session retrieval

### Secondary: Neo4j Knowledge Graph
- Connection: Via neo4j-alanse MCP
- Use for: Complex relation queries, graph traversal, pattern discovery

### Tertiary: Project-specific memory
- Location: `~/.claude/memory/`
- Use for: Project-specific context, task lists

---

## Memory Management Policies

### Confidence Decay

Observations automatically lose confidence over time:
- Technical facts: 30-day half-life
- User preferences: 90-day half-life
- Temporary context: 7-day half-life

### Pruning

Remove observations when:
- Confidence decayed below 0.1
- Not accessed in 90 days
- Older than 1 year

### Conflict Resolution

When new observation contradicts existing:
1. Identify semantically related observations
2. Check temporal overlap
3. Invalidate old observation (set validTo)
4. Keep higher-confidence observation

---

## Enforcement

### CLAUDE.md Integration

Add to every project's CLAUDE.md:

```markdown
### Session Initialization Protocol (MANDATORY)

Every Claude Code session MUST:

1. **Temporal Situating**: Run `date` command, announce current date/time
2. **Context Loading**: Read CLAUDE.md, SUPERCLAUDE.md, AGCI-SESSION-PROTOCOL.md
3. **Memory Retrieval**: Load recent memories from memory.jsonl and Neo4j
4. **Session Deposit**: Before ending, deposit learnings in structured format

Failure to follow this protocol results in context loss and repeated mistakes.
```

### Hook Enforcement (Optional)

```bash
# .claude/hooks/session-start.sh
#!/bin/bash
echo "AGCI Protocol: Temporal situating required"
date
echo "Memory location: ~/Desktop/code/memory/data/memory.jsonl"
```

---

## Example Session Flow

### Session Start
```
User: "Help me fix the auth flow"

Claude: [Runs date]
Current date/time: 2025-11-20 15:30:00 PST

[Loads memories]
Retrieved context:
- Project uses Supabase Auth (migrated from Clerk on 2025-10-15)
- Clerk is PERMANENTLY BANNED
- User prefers direct communication
- Last session worked on TRO workflow

[Proceeds with task using loaded context]
```

### Session End
```
Claude: Before we close, let me deposit what I learned:

1. Auth issue was caused by missing RLS policy on user_profiles table
   - Tags: resolution, auth, supabase, rls
   - Linked: commit abc123

2. User prefers explanation of root cause before showing fix
   - Tags: pattern, preferences, communication
   - Confidence: 0.85

[Writes to memory.jsonl]

These learnings are now available for future sessions.
```

---

## Metrics for AGCI Health

Track over time:
- **Deposit Rate**: Observations per session
- **Retrieval Usage**: How often memory is queried
- **Context Accuracy**: Did loaded memory help? (user feedback)
- **Confidence Trends**: Are observations decaying appropriately?
- **Pattern Emergence**: New patterns identified per week

---

## Version History

- **v1.0** (2025-11-20): Initial protocol created by Claude during self-improvement task
  - Session lifecycle defined
  - Memory retrieval and deposit documented
  - Structured observation format established
  - Enforcement mechanisms outlined

---

_This protocol is a living document. Each session that uses it should identify improvements and update accordingly._

---

**Remember**: Every interaction is a deposit opportunity. Compound interest works for knowledge too.
