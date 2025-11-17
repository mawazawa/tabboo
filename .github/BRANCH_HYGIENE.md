# Branch Hygiene Rules - SwiftFill

## 🚨 CRITICAL: Always Work on the Latest Branch

### Rule #1: Check Branch Age BEFORE Starting Work
```bash
# ALWAYS run this first:
git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short) - %(committerdate:relative)'

# Main should be the NEWEST or within 1 hour of newest
```

### Rule #2: Main Branch is Source of Truth
- ✅ **DO**: Always start new work from `main`
- ✅ **DO**: Merge features to `main` within 24 hours
- ❌ **DON'T**: Work on branches older than 24 hours
- ❌ **DON'T**: Keep feature branches alive for >48 hours

### Rule #3: Feature Branch Lifecycle
```bash
# 1. Create from main
git checkout main
git pull origin main
git checkout -b feature/your-feature

# 2. Work (max 24-48 hours)
# ... make commits ...

# 3. Merge back to main
git checkout main
git merge feature/your-feature

# 4. Delete immediately
git branch -d feature/your-feature
```

### Rule #4: Daily Branch Audit
Run this EVERY DAY before starting work:
```bash
# Show branches by age
git for-each-ref --sort=-committerdate refs/heads/ --format='%(HEAD) %(refname:short) - %(committerdate:relative) - %(contents:subject)'

# Delete stale branches (>7 days old)
git branch --merged main | grep -v "^* main$" | grep -v "main-backup" | xargs -r git branch -d
```

### Rule #5: Stash Management
```bash
# NEVER keep stashes for >24 hours
git stash list

# Apply or delete stashes DAILY
git stash apply stash@{0}  # Apply
git stash drop stash@{0}   # Delete
```

### Rule #6: Before Every Work Session
```bash
# Pre-flight checklist (30 seconds):
1. git checkout main
2. git pull origin main
3. git status  # Should be clean
4. git log -3  # Verify recent commits
5. npm run dev # Verify it works
```

### Rule #7: Warning Signs You're on Wrong Branch
- ⚠️ Branch is >24 hours old
- ⚠️ Main has commits you don't have
- ⚠️ Features you remember aren't present
- ⚠️ Dev server behaves differently than expected

**ACTION**: Immediately switch to main and investigate.

### Rule #8: Emergency Recovery
If you find yourself on a stale branch:
```bash
# 1. Stash your work
git stash

# 2. Switch to main
git checkout main

# 3. Check if stash is still needed
git stash show -p

# 4. Apply if valuable, drop if not
git stash apply  # or: git stash drop
```

## 📋 Branch Naming Convention
- `feature/descriptive-name` - New features (max 48h lifespan)
- `fix/bug-description` - Bug fixes (max 24h lifespan)
- `docs/topic` - Documentation only (merge immediately)
- `main` - Production-ready code (always deployable)
- `main-backup-YYYYMMDD` - Backup branches (keep max 2)

## 🔄 Integration with Claude Code
When Claude creates a branch, it uses format:
- `claude/task-description-[random-id]`

**YOUR JOB**: Merge these to main within 24 hours or delete them.

## 🎯 Success Metrics
- ✅ Main is always the newest branch (within 1 hour)
- ✅ Zero feature branches older than 48 hours
- ✅ Zero stashes older than 24 hours
- ✅ All team members working from main within 12 hours

## 💪 What Good Looks Like
```bash
$ git branch --sort=-committerdate
* main                    (17 hours ago)
  feature/current-work    (2 hours ago)
  main-backup-20251117   (2 days ago)
```

## ⚠️ What Bad Looks Like (AVOID)
```bash
$ git branch --sort=-committerdate
  claude/old-feature      (20 hours ago)  ← You're here (BAD!)
* main                    (17 hours ago)  ← Missing 3 commits
  feature/stale-work      (3 days ago)    ← Should be deleted
  docs/old-docs           (5 days ago)    ← Should be deleted
```

## 🚀 Automation Opportunity
Consider adding a Git hook:
```bash
# .git/hooks/pre-commit
#!/bin/bash
BRANCH_AGE=$(git log -1 --format=%cd --date=relative)
if [[ $BRANCH_AGE =~ "day" ]]; then
  echo "⚠️  WARNING: This branch is >24 hours old!"
  echo "Consider switching to main first."
  exit 1
fi
```

---

**Remember**: Speed of iteration > Perfect planning. Merge fast, iterate faster.

**Last Updated**: 2025-11-17
**Enforced By**: Mathieu + Claude Code
