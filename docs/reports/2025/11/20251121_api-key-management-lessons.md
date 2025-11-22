# API Key Management: The Goldilocks Principle

**Date**: November 21, 2025  
**Context**: MCP Configuration Session - Lessons Learned  
**Issue**: [JUSTICE-316](https://linear.app/empathylabs/issue/JUSTICE-316)

---

## TL;DR

**The Balance**: Configure actual API keys in gitignored files, document their existence in reports, but redact actual values from committed docs.

**Rule of Thumb**: If it's going to Git → redact it. If it's staying local → real keys OK.

---

## What Happened

### ❌ **The Mistake**
1. Added API keys to `.mcp.json` (correct ✅)
2. Documented full API keys in report `.md` files (wrong ❌)
3. Committed to Git (wrong ❌)
4. GitHub push protection blocked it (saved! 🛡️)
5. **Meta-mistake**: Even documented real keys in the lesson about not documenting real keys! (ironic ❌)

### ✅ **The Fix**
1. Removed `.mcp.json` from Git tracking
2. Added `.mcp.json` to `.gitignore`
3. Redacted API keys from all documentation
4. Kept real keys in `.mcp.json` (local only)
5. Pushed clean history

---

## The Goldilocks Principle

### 🔥 **Too Hot** (Too Careless)
```markdown
❌ BAD: Full key in documentation
GitHub Token: ghp_actual_full_token_here_exposed
```
**Problem**: Security breach, exposed secrets

### ❄️ **Too Cold** (Too Careful)
```markdown
❌ BAD: Over-redacted to uselessness
GitHub Token: [REDACTED]
No mention of configuration status
No usage instructions
```
**Problem**: Documentation is useless, future devs confused

### 🌟 **Just Right** (Balanced)
```markdown
✅ GOOD: Structure + Status + Redacted Value
GitHub Token: Configured ✅
- Key: ghp_**** (REDACTED, stored in .mcp.json)
- Functionality: Full repo integration enabled
- Usage: MCP server auto-loads from gitignored config
```
**Success**: Useful documentation + secure secrets

---

## Quick Reference Card

### Configuration Files (Gitignored)
**These CAN contain real API keys:**
- `.mcp.json` ✅
- `.env` ✅
- `.env.local` ✅
- Any file in `.gitignore` ✅

**Example (.mcp.json):**
```json
{
  "github": {
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_ACTUAL_TOKEN_HERE"
    }
  }
}
```

### Documentation Files (Committed)
**These MUST redact API keys:**
- `docs/*.md` ❌ real keys
- `README.md` ❌ real keys
- Any file committed to Git ❌ real keys

**Example (report.md):**
```markdown
### GitHub Configuration
- **Status**: ✅ Configured
- **Key**: `ghp_****` (REDACTED)
- **Location**: `.mcp.json` (gitignored)
- **Functionality**: Full repository integration enabled
- **Usage**: MCP auto-loads from config file
```

---

## Prevention Checklist

Before committing ANY file with API keys:

- [ ] **Check 1**: Is this file in `.gitignore`?
  - If YES → OK to have real keys
  - If NO → MUST redact keys

- [ ] **Check 2**: Am I committing to Git?
  - If YES → Verify all keys redacted
  - If NO → Real keys OK

- [ ] **Check 3**: Does documentation show:
  - [ ] WHAT is configured? (useful ✅)
  - [ ] HOW to use it? (useful ✅)
  - [ ] WHERE it's stored? (useful ✅)
  - [ ] Actual key VALUES? (must be NO ❌)

- [ ] **Check 4**: Run pre-commit check
  ```bash
  # Quick verification
  git diff --cached | grep -E "(ghp_|sk-|pplx-|AIza)" && echo "⚠️ STOP: API key detected!"
  ```

---

## The Rules (4 Simple Ones)

1. **STORE** real keys in: `.mcp.json`, `.env` (gitignored files)
2. **DOCUMENT** in reports: status ✅ + redacted value (ghp_****)
3. **VERIFY** `.gitignore` includes config files BEFORE committing
4. **REDACT** actual values from anything going to Git

---

## Examples by File Type

### ✅ CORRECT: Config File (.mcp.json)
```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_REAL_TOKEN_HERE"
      }
    },
    "perplexity": {
      "env": {
        "PERPLEXITY_API_KEY": "pplx-YOUR_REAL_KEY_HERE"
      }
    }
  }
}
```
**Why**: File is in `.gitignore`, stays local

### ✅ CORRECT: Documentation (report.md)
```markdown
## API Keys Configured

1. **GitHub**
   - Status: ✅ Configured
   - Key: `ghp_****` (REDACTED)
   - Functionality: Full repo access

2. **Perplexity**
   - Status: ✅ Configured
   - Key: `pplx-****` (REDACTED)
   - Functionality: AI research
```
**Why**: Shows what's configured, redacts values

### ❌ WRONG: Documentation with Real Keys
```markdown
## API Keys
- GitHub: ghp_actual_real_token_exposed_here
- Perplexity: pplx-actual_real_key_exposed_here
```
**Problem**: Real keys in committed documentation

### ❌ WRONG: Over-Redacted Documentation
```markdown
## API Keys
Configuration completed.
```
**Problem**: No useful information, future devs confused

---

## GitHub Push Protection

**What It Does**: Scans commits for secrets, blocks if found

**Example from this session:**
```
remote: error: GH013: Repository rule violations found
remote: - GITHUB PUSH PROTECTION
remote:   - GitHub Personal Access Token detected at .mcp.json:46
remote:   - Perplexity API Key detected at docs/report.md:28
```

**Important**: Push protection is a **safety net**, not a strategy. Don't rely on it!

**Best Practice**: Prevent the mistake before pushing.

---

## Memory Storage Locations

This lesson is now stored in:

1. ✅ **Memory MCP** - "API Key Management Best Practices" entity
2. ✅ **Neo4j Knowledge Graph** - Node #69: "API Key Management: The Goldilocks Principle"
3. ✅ **Linear Issue** - [JUSTICE-316](https://linear.app/empathylabs/issue/JUSTICE-316)
4. ✅ **This Document** - Quick reference for future agents

---

## For Future Agents

When configuring API keys for any system:

1. **Put real keys in**: `.gitignore`d files only
2. **Document**: What's configured, how to use, redact actual values
3. **Verify**: Check `.gitignore` before committing
4. **Balance**: Useful docs + secure secrets

**Don't overthink it**. Just remember:
- Gitignored file → real keys OK
- Committed file → must redact

---

## Testing the Balance

### ✅ Good Documentation Example
```markdown
### Plaid Integration
- **Status**: ✅ Configured
- **Credentials**: 
  - Client ID: Configured in Supabase secrets
  - Secret: Configured in Supabase secrets
  - Token Encryption Key: Generated and stored
- **Environment**: Sandbox
- **Test Users**: See PLAID_SANDBOX_SETUP.md
- **Usage**: 
  ```typescript
  const { open } = usePlaidLink({
    products: ['transactions', 'assets'],
    onSuccess: handleSuccess
  });
  ```
```

**Why it works**:
- Shows WHAT is configured ✅
- Shows HOW to use it ✅
- Provides context and links ✅
- Hides actual secret values ✅
- Future developers can work with this ✅

---

## Key Takeaway

> **"If it's going to Git, it gets redacted. If it's staying local, real keys are fine. Show the structure, confirm the status, hide the values."**

That's it. That's the whole lesson.

---

**Related Issues**: [JUSTICE-316](https://linear.app/empathylabs/issue/JUSTICE-316)  
**Knowledge Graph**: Neo4j Node #69  
**Memory MCP**: "API Key Management Best Practices"

Co-Authored-By: Claude <noreply@anthropic.com>
