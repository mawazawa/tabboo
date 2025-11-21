# JusticeOS - AI-Native Legal Tech Platform

**📖 Navigation**: This is the project hub. For detailed patterns, see subdirectory CLAUDE.md files:
- **Frontend** → `app/CLAUDE.md` (Next.js routes, components, UI patterns)
- **Backend** → `lib/CLAUDE.md` (AI, databases, APIs, services)
- **Testing** → `tests/CLAUDE.md` (Playwright, Jest, smoke tests)
- **Architecture** → `CLAUDE-GLOBAL.md` (meta-guide for all agents)

**🔍 PRO TIP**: Leverage Knowledge Graph MCP (`mcp_knowledge-graph_*`) for circular dependencies and cross-file relationships - 10-50x faster than sequential analysis.

## Mission

Serve 75 million self-represented litigants in family court crisis through empathy, accessibility, performance, security, and clarity.

## Tech Stack

- **Frontend**: Next.js 15.5.6, React 19, TypeScript 5, Tailwind CSS 4.0, shadcn/ui
- **Backend**: PostgreSQL (Supabase), Supabase Auth, Neo4j Aura, Stripe
- **AI**: Groq (real-time), Claude (formatting), Mixtral (legal), Voyage (embeddings)
- **Testing**: Playwright (E2E), Jest (unit), Biome (linting)
- **Deploy**: Vercel, pnpm@10.20.0, Node 22.x

## Essential Commands

```bash
pnpm dev              # Dev server (localhost:3333)
pnpm build            # Production build
pnpm lint             # Check with Biome
pnpm lint:fix         # Auto-fix
pnpm typecheck        # TypeScript validation
pnpm test:e2e         # Playwright tests
pnpm e2e:smoke        # Fast smoke tests (<120s)
pnpm generate:db-types # Generate Supabase types
```

## Project Structure

```
app/              # Next.js routes & pages → See app/CLAUDE.md
lib/              # Backend logic & services → See lib/CLAUDE.md
tests/            # E2E and unit tests → See tests/CLAUDE.md
components/       # React components (shadcn/ui)
.claude/agents/   # Specialized multi-agent system
```

## Core Principles

- **Mainline Discipline**: Work on `main`, push frequently (≤3 commits)
- **Evidence-Based**: All claims backed by tests/benchmarks
- **DEEPSHAFT Protocol**: Lane-based micro-iterations (≤300 LOC)
- **WCAG AAA**: Accessibility is non-negotiable
- **Double-Loop Learning**: Question the question before solving

## Coding Standards

- **TypeScript**: Strict mode, 2-space indent, single quotes
- **Linter**: Biome (NOT ESLint) - 10-100x faster
- **Line Limit**: 80 characters (Biome enforced)
- **File Naming**: kebab-case via `pnpm validate:filenames`
- **Imports**: `@/` prefix for all internal imports

## Dual System Architecture

**⚠️ CRITICAL**: This codebase contains TWO separate systems - never confuse them:

### 🏢 Principles OS (INTERNAL)
- **Purpose**: Mathieu's company management system (100x shipping speed)
- **Users**: Mathieu + AI agents only
- **Scope**: Software eng, business ops, company governance
- **Location**: `lib/governance/`, `lib/linear/`, `lib/governance/gmail/`

### ⚖️ JusticeOS (PRODUCT)
- **Purpose**: Legal tech for self-represented litigants
- **Users**: 75 million self-represented litigants
- **Scope**: Legal forms, documents, case analysis, court automation
- **Location**: `app/`, `components/`, `lib/cases/`, `lib/evidence/`

**Decision Tree**: Company management? → Principles OS. Self-represented litigants? → JusticeOS.

## Git Workflow

### Mainline Discipline
1. Work directly on `main` (no feature branches)
2. Keep `main` deployable (if broken, stop and fix immediately)
3. Push frequently (max 3 unpushed commits)
4. Run quality gates before push: lint, typecheck, build

### Commit Format
```
<type>(scope): <imperative description>

Evidence: test results, benchmarks, screenshots

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `perf`, `chore`

## Deployment (CRITICAL)

**Code is NOT complete until deployed to production**:

1. ✅ Pass quality gates (tests, lint, typecheck, build)
2. ✅ Push to GitHub `main` branch
3. ✅ Verify Vercel deployment succeeds
4. ✅ Update Linear issue with deployment URL
5. ✅ Mark work complete

**Repository**: `mawazawa/v0-justice-os-ai` (auto-deploys via Vercel)

## Quick Reference

**Frontend work?** → Read `app/CLAUDE.md` for Next.js 15 patterns
**Backend/API work?** → Read `lib/CLAUDE.md` for services, AI, databases
**Writing tests?** → Read `tests/CLAUDE.md` for Playwright/Jest patterns
**Multi-agent coordination?** → See `.claude/agents/shaftmeister.md`

---

**Last Updated**: November 18, 2025
**Version**: Hierarchical Architecture v1.0
