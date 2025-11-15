# Branch Cleanup Plan

**Date**: November 15, 2025  
**Status**: Ready for execution

## Current Branch Status

### Active Branches (Keep)
✅ **main** - Production branch (formerly Loveable + enhancements)
✅ **swiftfill-migration** - Working migration branch
✅ **main-backup-20251115** - Backup of pre-migration main (keep for 30 days)

### Branches to Delete (Obsolete)

#### Already Merged/Cherry-Picked ❌
1. **claude/codebase-audit-and-analysis-011CV4S6aYbv41FNr1TMVp75**
   - **Status**: Merged to main on Nov 15
   - **Content**: Custom hooks refactoring (useAuthRedirect, useFormDocument, useAutosave)
   - **Action**: Delete local and remote
   - **Command**: 
     ```bash
     git branch -d claude/codebase-audit-and-analysis-011CV4S6aYbv41FNr1TMVp75
     git push origin --delete claude/codebase-audit-and-analysis-011CV4S6aYbv41FNr1TMVp75
     ```

2. **claude/pre-release-assessment-011CUPyqmTqbUJsUy8CBCYRh**
   - **Status**: Key features cherry-picked
   - **Cherry-picked**: Data loss prevention warning
   - **Remaining**: Autosave status, email validation, forgot password (conflicted, already in Loveable)
   - **Action**: Delete remote (valuable parts already integrated)
   - **Command**: `git push origin --delete claude/pre-release-assessment-011CUPyqmTqbUJsUy8CBCYRh`

3. **claude/redesign-ai-input-widget-011CUPWnDU1aw22J3HWV2x9T**
   - **Status**: Testing infrastructure cherry-picked
   - **Cherry-picked**: Vitest, Testing Library, 50 tests
   - **Remaining**: Security hardening, PWA, performance optimizations (already in Loveable)
   - **Action**: Delete remote
   - **Command**: `git push origin --delete claude/redesign-ai-input-widget-011CUPWnDU1aw22J3HWV2x9T`

#### Auto-Generated Edit Branches ❌
4. **edit/edt-bd78d402-0908-41b8-a869-f43581dd2262**
   - **Status**: Auto-generated Loveable edit branch
   - **Content**: Generic "Changes" commits
   - **Action**: Delete remote
   - **Command**: `git push origin --delete edit/edt-bd78d402-0908-41b8-a869-f43581dd2262`

5. **edit/edt-d3f195e7-98d4-490b-ad0f-f847fceb8e0f**
   - **Status**: Auto-generated Loveable edit branch
   - **Content**: Generic "Changes" commits + some features from product-strategy
   - **Action**: Delete remote
   - **Command**: `git push origin --delete edit/edt-d3f195e7-98d4-490b-ad0f-f847fceb8e0f`

### Branches to Archive (Optional Features) 📦

6. **claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5**
   - **Status**: Contains optional advanced features
   - **Content**: 
     - Multi-AI provider system (OpenAI, Anthropic, Google)
     - FL-320 route and template
     - HTML-first form architecture
     - Dark mode toggle
     - Keyboard shortcuts
     - Automation feasibility analysis
   - **Decision**: Keep for future feature extraction OR delete if not needed
   - **Recommendation**: **ARCHIVE** - Tag for reference, then delete
   - **Commands**:
     ```bash
     # Archive as tag
     git fetch origin claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5
     git tag archive/product-strategy origin/claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5
     git push origin archive/product-strategy
     # Then delete branch
     git push origin --delete claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5
     ```

## Cleanup Execution Plan

### Phase 1: Immediate Cleanup (Execute Now)
Delete all merged and auto-generated branches:

```bash
# Delete local audit branch (already merged)
git branch -d claude/codebase-audit-and-analysis-011CV4S6aYbv41FNr1TMVp75

# Delete remote branches that are obsolete
git push origin --delete claude/codebase-audit-and-analysis-011CV4S6aYbv41FNr1TMVp75
git push origin --delete claude/pre-release-assessment-011CUPyqmTqbUJsUy8CBCYRh
git push origin --delete claude/redesign-ai-input-widget-011CUPWnDU1aw22J3HWV2x9T
git push origin --delete edit/edt-bd78d402-0908-41b8-a869-f43581dd2262
git push origin --delete edit/edt-d3f195e7-98d4-490b-ad0f-f847fceb8e0f
```

### Phase 2: Archive Optional Features (If Needed)
If you want to preserve product-strategy for future reference:

```bash
# Fetch and create archive tag
git fetch origin claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5
git tag archive/product-strategy origin/claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5
git push origin archive/product-strategy

# Delete the branch
git push origin --delete claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5
```

OR simply delete without archiving:

```bash
git push origin --delete claude/product-strategy-planning-011CUSFkSczRFTm6fm3f5wH5
```

### Phase 3: Clean Local Repository (After 30 days)
After confirming main is stable, delete local backup:

```bash
# After 30 days, delete backup branch
git branch -d main-backup-20251115
git push origin --delete main-backup-20251115

# Delete migration branch (once confirmed)
git branch -d swiftfill-migration
git push origin --delete swiftfill-migration
```

## Post-Cleanup Verification

After cleanup, verify branches:

```bash
# List all branches
git branch -a

# Expected result (after Phase 1 + 2):
# * main
#   main-backup-20251115
#   swiftfill-migration
#   remotes/origin/Loveable
#   remotes/origin/main
#   remotes/origin/main-backup-20251115
#   remotes/origin/swiftfill-migration

# Verify tags if archived
git tag -l
```

## Summary

**Branches to delete immediately**: 5
**Branches to archive (optional)**: 1
**Branches to keep**: 3

**Total cleanup impact**: -6 branches, cleaner repository structure

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
