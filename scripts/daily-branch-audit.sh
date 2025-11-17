#!/bin/bash
# Daily Branch Audit Script for SwiftFill
# Run this EVERY DAY before starting work

set -e

echo "🔍 SwiftFill Daily Branch Audit"
echo "================================"
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Show all branches by age
echo "📊 All branches (by age):"
git for-each-ref --sort=-committerdate refs/heads/ --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(color:green)%(committerdate:relative)%(color:reset) - %(contents:subject)' | head -10
echo ""

# Check if main is the newest
NEWEST_BRANCH=$(git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short)' | head -1)
if [ "$NEWEST_BRANCH" != "main" ]; then
  echo "⚠️  WARNING: Main is NOT the newest branch!"
  echo "   Newest: $NEWEST_BRANCH"
  echo "   You may be missing important updates."
  echo ""
fi

# Check if current branch is stale
if [ "$CURRENT_BRANCH" != "main" ]; then
  BRANCH_AGE=$(git log -1 --format=%cd --date=relative)
  if [[ $BRANCH_AGE =~ "day" ]] || [[ $BRANCH_AGE =~ "week" ]] || [[ $BRANCH_AGE =~ "month" ]]; then
    echo "🚨 CRITICAL: You're on a stale branch ($BRANCH_AGE old)!"
    echo "   Switch to main immediately:"
    echo "   $ git checkout main"
    echo ""
  fi
fi

# Check stash age
STASH_COUNT=$(git stash list | wc -l | tr -d ' ')
if [ "$STASH_COUNT" -gt 0 ]; then
  echo "📦 Stashes found: $STASH_COUNT"
  git stash list | head -5
  echo ""
  echo "⚠️  Review and apply/drop stashes older than 24 hours"
  echo ""
fi

# Check if main is behind origin
echo "🔄 Checking sync with origin..."
git fetch origin main --quiet
BEHIND=$(git rev-list --count main..origin/main)
AHEAD=$(git rev-list --count origin/main..main)

if [ "$BEHIND" -gt 0 ]; then
  echo "⚠️  Main is $BEHIND commits behind origin/main"
  echo "   Run: git pull origin main"
  echo ""
fi

if [ "$AHEAD" -gt 0 ]; then
  echo "✅ Main is $AHEAD commits ahead of origin/main"
  echo "   Consider pushing: git push origin main"
  echo ""
fi

# Find stale branches (>7 days)
echo "🗑️  Branches older than 7 days:"
STALE_BRANCHES=$(git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short) %(committerdate:relative)' | grep -E "(week|month|year)" | grep -v "main-backup" || echo "None found")
if [ "$STALE_BRANCHES" != "None found" ]; then
  echo "$STALE_BRANCHES"
  echo ""
  echo "   Suggested cleanup:"
  echo "   $ git branch -D branch-name"
else
  echo "✅ None found"
fi
echo ""

# Recommendation
echo "💡 Recommended action:"
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "   1. Save work: git stash (if needed)"
  echo "   2. Switch to main: git checkout main"
  echo "   3. Pull latest: git pull origin main"
  echo "   4. Start fresh: git checkout -b feature/your-work"
else
  echo "   ✅ You're on main - good to go!"
  echo "   Create a feature branch when ready:"
  echo "   $ git checkout -b feature/your-work"
fi

echo ""
echo "================================"
echo "✅ Audit complete"
