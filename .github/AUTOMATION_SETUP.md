# Claude Automated Development Pipeline - Setup Guide

## Overview

This pipeline automates the entire development workflow:
1. **User gives prompt** → Claude web agent creates PR
2. **PR created** → Claude reviews and makes changes via `@claude` mentions
3. **All checks pass** → Auto-merge to main
4. **Merged** → Linear issue updated to Done, knowledge stored in Neo4j

## Required GitHub Secrets

Go to: **Repository Settings → Secrets and variables → Actions**

### Authentication Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | CloudMax OAuth token | Run `/install-github-app` in Claude Code terminal, or from Claude subscription settings |
| `LINEAR_API_KEY` | Linear API key | Linear Settings → API → Personal API keys |
| `EXA_API_KEY` | Exa search API | Get from [exa.ai](https://exa.ai) dashboard |
| `SUPABASE_ACCESS_TOKEN` | Supabase access token | Your existing token |

### Neo4j Knowledge Graph

| Secret Name | Value |
|------------|-------|
| `NEO4J_URI` | `neo4j+s://3884f0bc.databases.neo4j.io` |
| `NEO4J_USERNAME` | `neo4j` |
| `NEO4J_PASSWORD` | Your Neo4j password |

### Linear Configuration

| Secret Name | Description |
|------------|-------------|
| `LINEAR_TEAM_ID` | Your Linear team UUID |
| `LINEAR_AUTOMATION_LABEL_ID` | Label ID for automated issues |
| `LINEAR_DONE_STATE_ID` | State ID for "Done" status |

## Getting Linear IDs

Run these queries with the Linear MCP:

```bash
# Get team ID
mcp__linear__list_teams

# Get label IDs
mcp__linear__list_issue_labels --team "JusticeOS"

# Get state IDs
mcp__linear__list_issue_statuses --team "JusticeOS"
```

## Usage

### 1. Create PR via Claude Web Agent

Give Claude a prompt like:
```
Create a new feature that adds X to the application.
Create a PR when done.
```

### 2. Automated Review & Changes

Once PR is created, mention `@claude` in comments:
```
@claude Please review this PR and fix any type errors
@claude Add tests for the new feature
@claude Update the documentation
```

### 3. Auto-Merge to Production

When all checks pass:
- PR auto-merges via squash merge
- Branch is deleted
- Linear issue moves to Done
- PR metadata stored in Neo4j knowledge graph

## MCP Tools Available to Web Agents

The GitHub Action has access to these MCP servers:

- **neo4j** - Knowledge graph queries and storage
- **linear** - Issue tracking and project management
- **exa** - Web search for latest documentation
- **supabase** - Database operations
- **memory** - Persistent memory across sessions

## Monitoring

### Linear Dashboard
All automated PRs create Linear issues with the automation label.

### Neo4j Knowledge Graph
Query PR history:
```cypher
MATCH (pr:PullRequest)
WHERE pr.merged_at > datetime() - duration('P7D')
RETURN pr.number, pr.title, pr.author
ORDER BY pr.merged_at DESC
```

## Troubleshooting

### OAuth Token Issues
If you see "CLAUDE_CODE_OAUTH_TOKEN required":
1. Ensure CloudMax subscription is active
2. Re-run `/install-github-app` in Claude Code terminal
3. Update the secret in GitHub

### Linear API Errors
Check that LINEAR_API_KEY has the correct permissions for:
- Creating issues
- Updating issue status
- Reading team/label/state data

### Auto-merge Not Working
Ensure:
- Branch protection rules allow squash merges
- All required checks are passing
- PR is not in draft state

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
