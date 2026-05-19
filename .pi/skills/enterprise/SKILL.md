---
name: enterprise
description: Master skill for pi-driven enterprise suite. Covers the full workflow: plan (Plannotator), pipeline (rpiv-pi), implement (rpiv-todo), review (rpiv-advisor), and deploy. Use when working on any task in this repository to understand available tools and conventions.
license: MIT
metadata:
  version: "0.1.0"
  requires: ["plannotator", "rpiv-pi", "rpiv-advisor", "rpiv-todo", "bash-approval"]
---

# pi-driven Enterprise Suite

Enterprise-grade AI-assisted development workflow for pi-driven.

## Architecture

```text
DISCOVER ──→ RESEARCH ──→ DESIGN ──→ PLAN ──→ IMPLEMENT ──→ VALIDATE
   │              │            │          │           │             │
   │              │            │    Plannotator  rpiv-todo    rpiv-advisor
   │         rpiv-pi subagents  │   plan review  task track   escalation
   │                            │
   └──── rpiv-pi pipeline ──────┘
```

## Modes

| Mode | Command | Behavior |
|------|---------|----------|
| Plan | `pi --mode plan` | Restricted writes to `.pi-driven/artifacts/` |
| Orchestrator | `pi --mode orchestrator` | Coordinate subagents via rpiv-pi |
| YOLO | `pi --mode yolo` | Full access (default) |
| Ask | `pi --mode ask` | Read-only, no writes |
| Code | `pi --mode code` | Focused code editing |

## Workflow

### 1. Start with a Plan
```text
/plannotator                    # Enter plan mode
Describe your task              # Agent explores + writes plan
Review in browser               # Approve or request changes
```

### 2. Run the Pipeline
```text
/rpiv-setup                     # One-time: install pipeline skills
/rpiv-discover "your feature"   # Interview-driven feature discovery
/skill:research <artifact>      # Research with parallel subagents
/skill:design <research>        # Architecture design
/skill:plan <design>            # Implementation plan
/skill:implement <plan>         # Execute the plan
```

### 3. Track Progress
```text
/pipeline                       # View artifact status
/todos                          # View task list
Ctrl+Shift+K                    # Launch Kimi Swarm for complex tasks
```

### 4. Review & Escalate
```text
/plannotator-review             # Code review current changes
/advisor                        # Escalate to frontier model for review
/skill:validate <artifact>      # Validate implementation
```

### 5. Deploy
```text
npm run release:patch           # Bump version + changelog
git push --follow-tags          # Triggers CI release
```

## Security

### Bash Approval (allow-list)
Only commands matching `~/.pi/agent/.bash-approval` run without prompting.
Unknown commands are blocked in non-interactive mode.
```text
/bash-approval-list             # Show allowed commands
/bash-approval-reload           # Reload after editing .bash-approval
```

### Coding Preferences (style guard)
Rules at `~/.pi/agent/coding-preferences.json` block:
- `any` type usage → use `unknown` or branded types
- `@ts-ignore` / `@ts-nocheck` → fix the type error
- `console.log` / `console.debug` → remove before commit
- Manual `package-lock.json` deletion → use npm commands
- Bare `throw` → use `Result<T>` pattern

### Install Filter (block-list)
Blocks destructive commands regardless of allow-list:
- `rm -rf`, `git reset --hard`, `git push --force`
- `curl | sh`, `wget | sh`

## Commands

| Command | Description |
|---------|-------------|
| `/enterprise` | Full system status |
| `/pipeline` | Artifact status across stages |
| `/sessions` | List all sessions |
| `/session-prune` | Delete sessions > 30 days |
| `/git-ui` | Interactive git staging |
| `/advisor` | Configure/escalate to reviewer model |
| `/bash-approval-list` | Show allowed bash commands |

## Configuration Files

| File | Purpose |
|------|---------|
| `.pi/settings.json` | pi project config (packages, extensions) |
| `.pi/plannotator.json` | Plan/execute phase model config |
| `.pi/observability.json` | Arize/Phoenix tracing |
| `.pi/extensions/enterprise.ts` | Mode-aware security extension |
| `~/.pi/agent/.bash-approval` | Bash command allow-list |
| `~/.pi/agent/coding-preferences.json` | Style enforcement rules |
| `~/.config/rpiv-advisor/advisor.json` | Frontier escalation model |
| `cliff.toml` | Changelog generation rules |
| `commitlint.config.js` | Commit message validation |

## Providers

| Provider | Model | Use |
|----------|-------|-----|
| opencode-go | deepseek-v4-pro | Default execution |
| anthropic | claude-sonnet-4 | Advisor escalation |
| groq | llama-4-scout | Fast inference |
| google | gemini-2.5-flash | YouTube/video analysis |
| kimi-coding | kimi-k2.6 | Kimi Swarm |

## MCP Tools

| Server | Tools |
|--------|-------|
| brave-search | web, local, video, image, news, summarizer |
| exa | web_search_exa, company_research, linkedin_search, deep_researcher, crawling |
| blackbox | Remote agent task execution |
