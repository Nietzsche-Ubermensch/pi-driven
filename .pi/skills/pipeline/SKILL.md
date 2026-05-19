---
name: pipeline
description: Run the rpiv-pi pipeline (discover → research → design → plan → implement → validate) with parallel subagents. Use when implementing features from scratch, performing major refactors, or any task requiring structured planning and verification.
license: MIT
metadata:
  version: "0.1.0"
  requires: ["rpiv-pi", "@tintinweb/pi-subagents"]
---

# Pipeline Skill

Multi-stage development pipeline with parallel subagent analysis.

## Quick Start

```bash
# One-time setup
/rpiv-setup

# Start with discovery
/rpiv-discover "Build a user authentication system"
```

## Pipeline Stages

### 1. Discover
Interview-driven feature requirements gathering.
```text
/rpiv-discover <feature description>
Output: .rpiv/artifacts/discover/<feature>.md
```

### 2. Research
Parallel analysis by specialized subagents:
- `codebase-analyzer` — Understand existing code
- `codebase-locator` — Find relevant files
- `codebase-pattern-finder` — Identify patterns
- `claim-verifier` — Verify assumptions
```text
/skill:research .rpiv/artifacts/discover/<feature>.md
Output: .rpiv/artifacts/research/<latest>.md
```

### 3. Design
Architecture decisions with tradeoff analysis.
```text
/skill:design .rpiv/artifacts/research/<latest>.md
Output: .rpiv/artifacts/designs/<latest>.md
```

### 4. Plan
Concrete implementation plan with checklists.
```text
/skill:plan .rpiv/artifacts/designs/<latest>.md
Output: .rpiv/artifacts/plans/<latest>.md
```

### 5. Implement
Execute the plan, tracking progress with rpiv-todo.
```text
/skill:implement .rpiv/artifacts/plans/<latest>.md
/todos  # Track progress
```

### 6. Validate
Review and verify implementation.
```text
/skill:validate .rpiv/artifacts/implement/<latest>.md
/advisor  # Escalate to frontier model if needed
```

## Subagents

| Subagent | Role |
|----------|------|
| `codebase-analyzer` | Analyze codebase structure and dependencies |
| `codebase-locator` | Find files relevant to a task |
| `codebase-pattern-finder` | Identify existing patterns and conventions |
| `claim-verifier` | Verify claims against codebase evidence |
| `scope-tracer` | Frame and trace task scope boundaries |
| `solution-explorer` | Compare solution approaches |

## Integration with Plannotator

For visual plan review:
```text
/plannotator .rpiv/artifacts/plans/<latest>.md
```

This opens the Plannotator browser UI where you can:
- Annotate the plan with feedback
- See plan diffs on revision
- Approve or request changes
