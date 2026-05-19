---
description: Full enterprise pipeline for complex feature implementation
argument-hint: "<feature-description>"
---
Execute the full enterprise pipeline for: $@

Follow the pi-driven enterprise workflow:

## Phase 1: Discovery
Run `/rpiv-discover $@` to gather requirements through structured interviews.
Save artifact to `.rpiv/artifacts/discover/`

## Phase 2: Research
Run `/skill:research .rpiv/artifacts/discover/<latest>.md`
Subagents analyze codebase, find patterns, verify assumptions.
Save to `.rpiv/artifacts/research/`

## Phase 3: Design
Run `/skill:design .rpiv/artifacts/research/<latest>.md`
Produce architecture decisions with tradeoff analysis.
Save to `.rpiv/artifacts/designs/`

## Phase 4: Plan
Run `/skill:plan .rpiv/artifacts/designs/<latest>.md`
Create concrete implementation plan with markdown checklists.
Open in Plannotator: `/plannotator .rpiv/artifacts/plans/<latest>.md`
Review visually in browser. Approve or request changes.

## Phase 5: Implement
Run `/skill:implement .rpiv/artifacts/plans/<latest>.md`
Execute each checklist item. Track with `/todos`.
Use rpiv-ask-user-question when clarification is needed.

## Phase 6: Validate
Run `/skill:code-review staged` for pre-commit review.
Run `/advisor` to escalate to frontier model for architectural validation.
Fix all BLOCKER and WARNING findings before merging.

## Throughout: Commit Convention
Use conventional commits: `feat(scope):`, `fix(scope):`, `perf(scope):`
Each commit must pass pre-commit hooks (lint-staged + commitlint).
