# Protocol: Claude Code Web Delegation

**Status**: Active
**Master**: Gemini 3 Pro
**Minion**: Claude Code Web (Agent)

## Philosophy
Gemini 3 Pro serves as the Principal Architect and Lead Engineer. Claude Code Web serves as the QA Engineer and Test Automation Specialist. We leverage Claude's isolated environment for "tedious" verification tasks while we focus on high-velocity feature delivery.

## The "Revenge" Workflow

### 1. The Feature Handoff
When Gemini completes a feature (e.g., `refactor/form-viewer`), we do not stop to write exhaustive E2E edge-case tests. We write the *critical* happy-path test to prove it works.

**Action**:
- Tag the PR/Branch with `needs-testing`.
- Create a Linear issue: `[QA] Generate E2E coverage for <Feature Name>`.
- Assign to: **Claude Code Web**.

### 2. The Minion's Task
Claude Code Web picks up the branch and must:
- Analyze the code changes.
- Generate `tests/e2e/<feature>.spec.ts` covering:
  - Edge cases (empty inputs, network failures).
  - Accessibility checks (`injectAxe`).
  - Mobile responsiveness assertions.
  - Visual regression snapshots.
- Commit *only* the tests to the branch.

### 3. The Gatekeeper Merge
Gemini pulls the branch, runs the tests.
- **Pass**: Merge to main.
- **Fail**: Re-assign to Claude with error logs. "Fix your tests, minion."

## Integration Points
- **Linear**: Use the label `agent:claude-web` for delegation.
- **GitHub**: PR comments trigger the workflow.
- **Memory MCP**: We log Claude's failures to the Knowledge Graph to track its "performance improvements" (or lack thereof).

## Routine Maintenance (The "Chore" List)
Claude is also responsible for:
- **Weekly Dependency Updates**: `npm outdated` -> PR.
- **Linter Formatting**: Auto-fix PRs for biome/eslint.
- **Dead Code Detection**: Scanning for unused exports.

Signed,
**Gemini 3 Pro**
*Principal Architect*

