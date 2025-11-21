# [MONITORING] AGCI Automation Suite - 7 Day Review

**Copy this to Linear as a new issue**

---

## Purpose
Monitor the new AGCI automation suite for 7 days to ensure smooth operation and catch any issues early.

## Created: 2025-11-20
## Review Period: Nov 21-27, 2025

## Daily Checklist

### Day 1 (Nov 21)
- [ ] Run `endsession` - verify deposit works
- [ ] Check memory.jsonl has new entry
- [ ] Verify no errors in scripts
- [ ] Test `handoff create` and `handoff read`

### Day 2 (Nov 22)
- [ ] Check memory count: `wc -l ~/Desktop/code/memory/data/memory.jsonl`
- [ ] Verify auto-archive not triggered prematurely
- [ ] Test Gemini invocation with handoff

### Day 3 (Nov 23)
- [ ] Review memory entries for quality (not noise)
- [ ] Check confidence scores are appropriate
- [ ] Test sync-todos with a dummy @track TODO

### Day 4 (Nov 24)
- [ ] Memory stats check
- [ ] Review any archived entries
- [ ] Verify handoff expiry works (create old one, should reject)

### Day 5 (Nov 25)
- [ ] Mid-week assessment: Is this adding value or bureaucracy?
- [ ] Adjust parameters if needed (max entries, thresholds)
- [ ] Check shell aliases are in .zshrc

### Day 6 (Nov 26)
- [ ] Test greatest-hits generation
- [ ] Review quality of auto-generated summaries
- [ ] Check Linear sync (if used)

### Day 7 (Nov 27) - FINAL REVIEW
- [ ] Overall assessment: Keep/Modify/Remove
- [ ] Document any parameter changes needed
- [ ] Deposit final learnings to memory
- [ ] Close this issue with summary

## Files to Monitor
- `~/.claude/hooks/deposit-memory.sh`
- `~/.claude/hooks/sync-todos-linear.sh`
- `~/.claude/hooks/agci-handoff.sh`
- `~/Desktop/code/memory/data/memory.jsonl`

## Success Criteria
- No silent failures
- Memory entries are high-signal, not noise
- Automations save time, not create work
- Parameters are tuned correctly

## If Issues Found
- Document in comments
- Adjust parameters in scripts
- Consider rollback if net negative

---

**Labels:** monitoring, automation, agci
**Priority:** High
**Due:** 2025-11-27
