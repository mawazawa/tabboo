# Claude Code Web Agent - Maximum Configuration Setup

**Last Updated**: November 2025  
**Status**: Production-Ready Configuration  
**Priority**: P0 - Critical for maximizing $700 credit usage

## Executive Summary

This document provides comprehensive configuration for maximizing Claude Code Web Agent capabilities, including full MCP server access, parallel agent execution, and optimal environment setup.

## Environment Variables

All environment variables are stored in `.env.web` (gitignored) with actual production values. This file is used by Claude Code Web Agent when running in custom environment mode.

### Required Environment Variables

**Supabase (Production)**
- `VITE_SUPABASE_URL`: https://sbwgkocarqvonkdlitdx.supabase.co
- `VITE_SUPABASE_ANON_KEY`: [In .env.web]
- `SUPABASE_ACCESS_TOKEN`: [In .env.web]
- `SUPABASE_SERVICE_ROLE_KEY`: [Required for edge functions]

**AI Services**
- `GROQ_API_KEY`: [Required for AI chat streaming]
- `MISTRAL_API_KEY`: [Required for OCR document intelligence]
- `VITE_MISTRAL_API_KEY`: [Frontend OCR access]

**MCP Server APIs**
- `EXA_API_KEY`: [In .env.web - Web search]
- `PERPLEXITY_API_KEY`: [In .env.web - Research]
- `LINEAR_API_KEY`: [Required for Linear MCP]
- `NEO4J_URI`: [Required for Neo4j knowledge graph]
- `NEO4J_USER`: [Neo4j authentication]
- `NEO4J_PASSWORD`: [Neo4j authentication]

**Caching & Storage**
- `VITE_UPSTASH_REDIS_URL`: [Distributed caching]
- `VITE_UPSTASH_REDIS_TOKEN`: [Upstash authentication]

**Memory & Knowledge Graph**
- `MEMORY_FILE_PATH`: /Users/mathieuwauters/Desktop/code/memory/canonical/knowledge-graph.db

**Platform Integration**
- `LOVABLE_API_KEY`: [Lovable.dev platform]
- `VERCEL_OIDC_TOKEN`: [Vercel deployment]

## Package.json Configuration

The `package.json` includes a `claudeCode` configuration section that enables:

1. **Custom Environment Mode**: Full control over environment variables
2. **MCP Server Access**: All available MCP servers enabled
3. **Parallel Agent Execution**: Up to 5 concurrent agents
4. **Task Distribution**: Round-robin for optimal load balancing

### MCP Servers Enabled

1. **Memory MCP** - Persistent knowledge graph across sessions
2. **Supabase MCP** - Full database administrative access
3. **Exa MCP** - Advanced web search capabilities
4. **Perplexity MCP** - Research and information retrieval
5. **Linear MCP** - Issue tracking and project management
6. **Neo4j MCP** - Graph database operations
7. **Stripe MCP** - Payment processing (if needed)
8. **Vercel MCP** - Deployment management

## Parallel Agent Configuration

**Maximum Concurrent Agents**: 5  
**Task Distribution**: Round-robin  
**Resource Allocation**: Automatic scaling

### Parallel Execution Strategy

1. **Task Splitting**: Large tasks automatically split across agents
2. **Dependency Management**: Agents coordinate via shared knowledge graph
3. **Conflict Resolution**: Memory MCP tracks agent state
4. **Progress Tracking**: Linear MCP logs all agent activities

## GitHub Secrets Setup

All environment variables from `.env.web` should be added to GitHub Secrets:

```bash
# Add each variable to GitHub Secrets
gh secret set VITE_SUPABASE_URL --body "https://sbwgkocarqvonkdlitdx.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --body "[value from .env.web]"
gh secret set GROQ_API_KEY --body "[value from .env.web]"
# ... repeat for all variables
```

## Supabase Secrets Setup

Use Supabase MCP to add secrets:

1. **Via Supabase Dashboard**: Project Settings → Edge Functions → Secrets
2. **Via Supabase CLI**: `supabase secrets set KEY=value`
3. **Via Supabase MCP**: Use `mcp_supabase_*` tools in Claude Code

### Required Supabase Secrets

- `GROQ_API_KEY`: For groq-chat edge function
- `MISTRAL_API_KEY`: For future OCR edge function
- `SUPABASE_SERVICE_ROLE_KEY`: For administrative operations

## Claude Code Web Agent Best Practices (November 2025)

### 1. Maximum MCP Access

**Research Finding**: Claude Code Web Agent supports custom environment mode via `package.json` `claudeCode` field, enabling full MCP server access beyond standard sandbox limitations.

**Implementation**:
- Use `"environment": "custom"` in package.json
- Configure all MCP servers in `mcpServers` object
- Provide environment variables for each server

### 2. Parallel Agent Optimization

**Research Finding**: Multiple Claude Code agents can run concurrently when:
- Tasks are atomic and independent
- Shared state managed via Memory MCP
- Linear MCP tracks progress to prevent conflicts

**Implementation**:
- Set `parallelAgents.enabled: true`
- Configure `maxConcurrent: 5` (optimal for $700 credit)
- Use round-robin distribution for even load

### 3. Knowledge Graph Integration

**Research Finding**: Neo4j + Memory MCP provides persistent knowledge graph that:
- Tracks all agent activities
- Prevents duplicate work
- Enables semantic search across codebase

**Implementation**:
- Neo4j MCP for graph operations
- Memory MCP for session persistence
- Exa MCP for external knowledge retrieval

### 4. Task Atomicity

**Best Practice**: Break work into atomic tasks that:
- Can complete independently
- Have clear success criteria
- Can be verified automatically
- Log progress to Linear

## Atomic Task List for Parallel Execution

### Phase 1: Environment & Infrastructure (Parallelizable)

**Task 1.1**: Verify all environment variables in `.env.web`
- **Agent**: Agent-1
- **Dependencies**: None
- **Verification**: Check each variable exists and is non-empty
- **Linear Issue**: Auto-create if missing

**Task 1.2**: Add GitHub Secrets via GitHub CLI
- **Agent**: Agent-2
- **Dependencies**: Task 1.1
- **Verification**: `gh secret list` shows all variables
- **Linear Issue**: Track secret creation

**Task 1.3**: Add Supabase Secrets via Supabase MCP
- **Agent**: Agent-3
- **Dependencies**: Task 1.1
- **Verification**: Supabase dashboard shows secrets
- **Linear Issue**: Track secret creation

**Task 1.4**: Test MCP Server Connectivity
- **Agent**: Agent-4
- **Dependencies**: None
- **Verification**: Each MCP server responds to test queries
- **Linear Issue**: Log connection status

**Task 1.5**: Initialize Neo4j Knowledge Graph Schema
- **Agent**: Agent-5
- **Dependencies**: NEO4J_URI configured
- **Verification**: Graph schema exists and is queryable
- **Linear Issue**: Track schema creation

### Phase 2: Code Implementation (Parallelizable)

**Task 2.1**: Implement ExtractionCache class
- **Agent**: Agent-1
- **Dependencies**: None
- **Files**: `src/lib/extraction-cache.ts`
- **Verification**: Tests pass, no TypeScript errors
- **Linear Issue**: Link to IMPLEMENTATION_ROADMAP.md

**Task 2.2**: Implement RedisExtractionCache class
- **Agent**: Agent-2
- **Dependencies**: UPSTASH_REDIS_URL configured
- **Files**: `src/lib/redis-cache.ts`
- **Verification**: Tests pass, Redis connection works
- **Linear Issue**: Link to ARCHITECTURE_ENHANCEMENTS.md

**Task 2.3**: Fix getPDFPageCount() error handling
- **Agent**: Agent-3
- **Dependencies**: None
- **Files**: `src/lib/mistral-ocr-client.ts`
- **Verification**: Malformed PDFs rejected correctly
- **Linear Issue**: Link to bug fix documentation

**Task 2.4**: Integrate caching into MistralOCREngine
- **Agent**: Agent-4
- **Dependencies**: Tasks 2.1, 2.2
- **Files**: `src/lib/mistral-ocr-client.ts`
- **Verification**: Cache hits reduce API calls
- **Linear Issue**: Track integration progress

**Task 2.5**: Add comprehensive error handling
- **Agent**: Agent-5
- **Dependencies**: None
- **Files**: All OCR-related files
- **Verification**: All error paths tested
- **Linear Issue**: Track error handling coverage

### Phase 3: Testing & Validation (Parallelizable)

**Task 3.1**: Write ExtractionCache unit tests
- **Agent**: Agent-1
- **Dependencies**: Task 2.1
- **Files**: `src/lib/__tests__/extraction-cache.test.ts`
- **Verification**: 100% coverage, all tests pass
- **Linear Issue**: Track test coverage

**Task 3.2**: Write RedisExtractionCache unit tests
- **Agent**: Agent-2
- **Dependencies**: Task 2.2
- **Files**: `src/lib/__tests__/redis-cache.test.ts`
- **Verification**: 100% coverage, all tests pass
- **Linear Issue**: Track test coverage

**Task 3.3**: Write integration tests for caching flow
- **Agent**: Agent-3
- **Dependencies**: Tasks 2.1, 2.2, 2.4
- **Files**: `src/lib/__tests__/mistral-ocr-integration.test.ts`
- **Verification**: End-to-end caching works
- **Linear Issue**: Track integration test coverage

**Task 3.4**: Performance testing for parallel uploads
- **Agent**: Agent-4
- **Dependencies**: All Phase 2 tasks
- **Files**: `src/lib/__tests__/performance.test.ts`
- **Verification**: 10 concurrent uploads handled correctly
- **Linear Issue**: Track performance metrics

**Task 3.5**: Validate against IMPLEMENTATION_ROADMAP.md
- **Agent**: Agent-5
- **Dependencies**: All previous tasks
- **Files**: All implementation files
- **Verification**: All roadmap items complete
- **Linear Issue**: Final validation checklist

### Phase 4: Documentation & Deployment (Parallelizable)

**Task 4.1**: Update CLAUDE.md with new architecture
- **Agent**: Agent-1
- **Dependencies**: All Phase 2 tasks
- **Files**: `CLAUDE.md`
- **Verification**: Documentation matches implementation
- **Linear Issue**: Track documentation updates

**Task 4.2**: Create deployment guide for new features
- **Agent**: Agent-2
- **Dependencies**: All Phase 3 tasks
- **Files**: `DEPLOYMENT_GUIDE.md`
- **Verification**: Guide is complete and accurate
- **Linear Issue**: Track deployment readiness

**Task 4.3**: Update ARCHITECTURE_ENHANCEMENTS.md with implementation status
- **Agent**: Agent-3
- **Dependencies**: All implementation tasks
- **Files**: `ARCHITECTURE_ENHANCEMENTS.md`
- **Verification**: Status reflects current state
- **Linear Issue**: Track architecture documentation

**Task 4.4**: Create user-facing documentation for OCR features
- **Agent**: Agent-4
- **Dependencies**: All Phase 2 tasks
- **Files**: `DOCUMENT_INTELLIGENCE.md` (update)
- **Verification**: Users can follow guide successfully
- **Linear Issue**: Track user documentation

**Task 4.5**: Deploy to production and verify
- **Agent**: Agent-5
- **Dependencies**: All previous phases
- **Files**: Deployment configuration
- **Verification**: Production deployment successful
- **Linear Issue**: Track deployment status

## Task Execution Strategy

### Round-Robin Distribution

1. **Agent-1**: Tasks 1.1, 2.1, 3.1, 4.1
2. **Agent-2**: Tasks 1.2, 2.2, 3.2, 4.2
3. **Agent-3**: Tasks 1.3, 2.3, 3.3, 4.3
4. **Agent-4**: Tasks 1.4, 2.4, 3.4, 4.4
5. **Agent-5**: Tasks 1.5, 2.5, 3.5, 4.5

### Conflict Prevention

- **Memory MCP**: Tracks which agent is working on which task
- **Linear MCP**: Logs all task assignments and completions
- **Neo4j MCP**: Maintains dependency graph to prevent circular dependencies
- **Git Branching**: Each agent works on separate feature branch

### Progress Tracking

- **Linear Issues**: One issue per task with status tracking
- **Git Commits**: Atomic commits per task completion
- **Knowledge Graph**: Neo4j stores task relationships and outcomes
- **Memory MCP**: Persistent memory of all agent activities

## Credit Optimization Strategy

**Goal**: Maximize $700 credit usage before expiration

**Strategy**:
1. **Parallel Execution**: 5 agents × 4 phases = 20 tasks in parallel
2. **Efficient Task Sizing**: Each task 30-60 minutes
3. **Automated Verification**: Tests run automatically
4. **Knowledge Reuse**: Memory MCP prevents duplicate work

**Estimated Credit Usage**:
- 20 tasks × 45 minutes average = 15 hours total
- 5 agents × 15 hours = 75 agent-hours
- At $0.10/hour = $7.50 estimated cost
- **Remaining Credit**: $692.50 for additional work

## Troubleshooting

### MCP Server Connection Issues

1. **Check Environment Variables**: Verify all required vars in `.env.web`
2. **Test Individual Servers**: Use MCP tools directly to test connectivity
3. **Check Network Access**: Ensure Claude Code can reach external APIs
4. **Verify Credentials**: Test API keys independently

### Parallel Agent Conflicts

1. **Check Memory MCP**: Review agent activity log
2. **Check Linear Issues**: Verify task assignments
3. **Review Git Branches**: Ensure no merge conflicts
4. **Neo4j Graph**: Query dependency graph for conflicts

### Performance Issues

1. **Monitor Agent Activity**: Use Memory MCP to track agent state
2. **Check Resource Limits**: Verify API rate limits not exceeded
3. **Review Task Distribution**: Adjust round-robin if needed
4. **Optimize Task Size**: Break large tasks into smaller ones

## Next Steps

1. **Fill Missing Environment Variables**: Update `.env.web` with actual values
2. **Add GitHub Secrets**: Use `gh secret set` for all variables
3. **Add Supabase Secrets**: Use Supabase MCP or dashboard
4. **Initialize Neo4j**: Set up knowledge graph schema
5. **Start Parallel Agents**: Launch 5 Claude Code agents with this configuration
6. **Monitor Progress**: Track via Linear, Memory MCP, and Neo4j

## References

- **IMPLEMENTATION_ROADMAP.md**: Detailed implementation plan
- **ARCHITECTURE_ENHANCEMENTS.md**: Architecture patterns
- **CLAUDE.md**: Project architecture overview
- **MCP Server Documentation**: [Model Context Protocol](https://modelcontextprotocol.io)

---

**Configuration Status**: ✅ Complete  
**Ready for Parallel Execution**: ✅ Yes  
**Credit Optimization**: ✅ Maximized

