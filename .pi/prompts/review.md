---
description: Review staged git changes for bugs, security issues, and code quality
argument-hint: "[focus-area]"
---
Review the staged changes (`git diff --cached`). Focus on:
- Bugs and logic errors that could cause runtime failures
- Security vulnerabilities (injection, XSS, auth bypass, data exposure)
- Error handling gaps (missing try/catch, unhandled rejections)
- Type safety issues (use `unknown` not `any`, proper narrowing)
- Performance concerns (N+1 queries, unnecessary allocations)
- Test coverage gaps for critical paths

For each finding, categorize as:
- **BLOCKER**: Must fix before merge (security, crash)
- **WARNING**: Should fix (correctness, performance)
- **NOTE**: Consider fixing (style, clarity)

$1
