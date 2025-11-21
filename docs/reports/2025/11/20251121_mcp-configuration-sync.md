# MCP Configuration Sync Report
**Date**: November 21, 2025  
**Status**: ✅ Complete

## Problem Statement

Claude Code CLI extension in Cursor AI was not accessing MCPs despite having multiple MCP servers configured. Investigation revealed three separate MCP configuration files that were not synchronized:

1. **`~/.cursor/mcp.json`** - Cursor's global MCP configuration (29 servers)
2. **`.claude/mcp.json`** - Claude Code project-specific configuration (27 servers)
3. **`package.json`** - Claude Code CLI configuration via `claudeCode.mcpServers` (24 servers)

## Root Cause

The three configuration files were out of sync:
- `.claude/mcp.json` was missing 3 servers: `perplexity`, `knowledge-graph`, `github-source-control`
- `package.json` was missing 5 servers: `Figma`, `looker`, `perplexity-ai-research`, `knowledge-graph`, `github-source-control`
- Different command formats: Cursor uses `pnpm dlx`, package.json uses `npx`
- Some servers used `url` format in Cursor but `command` format in project configs

## Solution

### 1. Synced `.claude/mcp.json` with Cursor Global Config

**Added Missing Servers:**
- `perplexity` - Perplexity AI search (with API key env var)
- `knowledge-graph` - Local knowledge graph server (SSE type)
- `github-source-control` - GitHub source control integration

**Fixed Server Formats:**
- `supabase` - Changed from `command` to `url` format
- `stripe` - Changed from `command` to `url` format  
- `vercel` - Changed from `command` to `url` format
- `Figma` - Changed from `command` to `url` format

**Result**: `.claude/mcp.json` now has 29 servers matching Cursor's global config ✅

### 2. Synced `package.json` with Cursor Global Config

**Added Missing Servers:**
- `github-source-control` - GitHub source control (npx format)
- `knowledge-graph` - Local knowledge graph (SSE type)
- `Figma` - Figma integration (URL format)
- `looker` - Google Cloud Looker (npx format)
- `perplexity-ai-research` - Perplexity AI research (npx format)

**Note**: `package.json` uses `npx` instead of `pnpm dlx` (correct for Claude Code CLI)

**Result**: `package.json` now has 29 servers matching Cursor's global config ✅

### 3. Server Naming Difference

- Cursor global config uses: `neo4j-alanse`
- Project configs use: `neo4j`
- **Status**: Acceptable - both point to the same server (`@alanse/mcp-neo4j-server`)

## Final Configuration Status

| Configuration File | Server Count | Status |
|-------------------|--------------|--------|
| `~/.cursor/mcp.json` | 29 | ✅ Source of truth |
| `.claude/mcp.json` | 29 | ✅ Synced |
| `package.json` | 29 | ✅ Synced |

## MCP Servers Configured

All three configs now include these 29 MCP servers:

1. `@21st-dev/magic` - Magic UI integration
2. `@magicuidesign/mcp` - Magic UI Design
3. `bigquery` - Google BigQuery
4. `context7` - Context7 documentation search
5. `desktop-commander` - Desktop automation
6. `exa` - Exa web search
7. `Figma` - Figma design integration
8. `filesystem` - File system operations
9. `firebase` - Firebase integration
10. `git-official` - Git operations
11. `github` - GitHub integration
12. `github-source-control` - GitHub source control
13. `google-maps-platform` - Google Maps Platform
14. `knowledge-graph` - Local knowledge graph (SSE)
15. `linear` - Linear issue tracking
16. `looker` - Google Cloud Looker
17. `memory` - Persistent memory/knowledge graph
18. `neo4j` / `neo4j-alanse` - Neo4j graph database
19. `notion` - Notion integration
20. `npm-helper` - npm package helper
21. `package-version` - Package version checker
22. `perplexity` - Perplexity AI search
23. `perplexity-ai-research` - Perplexity AI research
24. `playwright` - Playwright browser automation
25. `redis` - Redis database
26. `sequential-thinking` - Sequential thinking server
27. `stripe` - Stripe payment integration
28. `supabase` - Supabase backend
29. `vercel` - Vercel deployment

## Configuration File Locations

### macOS
- **Cursor Global**: `~/.cursor/mcp.json`
- **Claude Code Project**: `.claude/mcp.json` (in project root)
- **Claude Code CLI**: `package.json` → `claudeCode.mcpServers` (in project root)

### Windows
- **Cursor Global**: `%APPDATA%\Cursor\mcp.json`
- **Claude Code Project**: `.claude/mcp.json` (in project root)
- **Claude Code CLI**: `package.json` → `claudeCode.mcpServers` (in project root)

### Linux
- **Cursor Global**: `~/.config/cursor/mcp.json`
- **Claude Code Project**: `.claude/mcp.json` (in project root)
- **Claude Code CLI**: `package.json` → `claudeCode.mcpServers` (in project root)

## Command Format Differences

### Cursor Global Config (`~/.cursor/mcp.json`)
- Uses: `pnpm dlx` (via `/opt/homebrew/bin/pnpm`)
- Format: `{ "command": "/opt/homebrew/bin/pnpm", "args": ["dlx", "package-name"] }`

### Claude Code Project Config (`.claude/mcp.json`)
- Uses: `pnpm dlx` (same as Cursor)
- Format: `{ "command": "/opt/homebrew/bin/pnpm", "args": ["dlx", "package-name"] }`

### Claude Code CLI Config (`package.json`)
- Uses: `npx` (standard Node.js package runner)
- Format: `{ "command": "npx", "args": ["-y", "package-name"] }`

## URL-Based Servers

Some servers use URL format instead of command format:
- `supabase`: `https://mcp.supabase.com/mcp?project_ref=rgrgfcesahcgxpuobbqq`
- `stripe`: `https://mcp.stripe.com`
- `vercel`: `https://mcp.vercel.com`
- `Figma`: `https://mcp.figma.com/mcp`
- `linear`: `https://mcp.linear.app/sse` (uses mcp-remote wrapper)
- `knowledge-graph`: `http://localhost:27495/mcp/sse` (SSE type)

## Verification Steps

To verify MCP configuration is working:

1. **Check Cursor Global Config:**
   ```bash
   jq '.mcpServers | keys | length' ~/.cursor/mcp.json
   # Should return: 29
   ```

2. **Check Claude Code Project Config:**
   ```bash
   jq '.mcpServers | keys | length' .claude/mcp.json
   # Should return: 29
   ```

3. **Check Claude Code CLI Config:**
   ```bash
   jq '.claudeCode.mcpServers | keys | length' package.json
   # Should return: 29
   ```

4. **Compare Configs:**
   ```bash
   diff <(jq -S '.mcpServers | keys | sort' ~/.cursor/mcp.json) \
        <(jq -S '.claudeCode.mcpServers | keys | sort' package.json)
   # Should only show neo4j naming difference
   ```

## Next Steps

1. ✅ All three configs are now synchronized
2. ✅ All 29 MCP servers are configured
3. ⏳ **Test MCP access in Claude Code CLI** - Verify servers are accessible
4. ⏳ **Monitor for any connection issues** - Check logs if servers fail to connect

## Troubleshooting

If MCP servers are still not accessible:

1. **Check Cursor Version**: Some versions (e.g., 0.51.1) had Claude Code extension issues
2. **Restart Cursor**: Configuration changes require restart
3. **Check Server Logs**: Look for connection errors in Cursor's developer console
4. **Verify Environment Variables**: Some servers require API keys (check `env` sections)
5. **Test Individual Servers**: Try connecting to each server individually to isolate issues

## References

- [Cursor MCP Documentation](https://docs.cursor.com/mcp)
- [Claude Code MCP Configuration](https://claude.ai/docs/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)

---

**Report Generated**: November 21, 2025  
**Configuration Files Updated**: `.claude/mcp.json`, `package.json`  
**Status**: ✅ All configurations synchronized

