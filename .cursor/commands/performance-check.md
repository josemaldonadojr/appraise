# Performance Check

Quick check for performance anti-patterns in your current changes.

## Check Active Files

```bash
# Check staged changes for action chains
git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -l "ctx\.runAction"

# Look for caching issues in staged files
git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -l "ActionCache"

# Check for action chains in current changes
git diff --cached | grep -E "(ctx\.runAction|internal\.)" | head -10
```

## Quick Questions

- [ ] Are we creating unnecessary action chains?
- [ ] Are we caching functions with side effects?
- [ ] Could this be simplified with helper functions?
- [ ] Are we using `ctx.runAction` only when crossing runtimes?

## Red Flags to Watch For

- More than 2 actions calling each other
- Cached functions that mutate data
- Unnecessary "orchestrator" layers
- Actions that just call other actions

Keep it simple: **Single action + helper functions + separate side effects**
