# pi-driven Enterprise Monorepo Architecture

## Research Synthesis

Analysis of reference architectures:
- **terrorobe/pi-mono**: Canonical pi structure — packages/ai, packages/coding-agent, packages/tui, packages/mom. Uses Husky, Biome, GitHub Actions CI with build-binaries + test matrix.
- **Jonghakseo/pi-extension**: Extension monorepo — 20+ packages with lefthook, biome, workspace-driven builds. Pattern: each extension is a self-contained package with tests.
- **healeycodes/pi**, **Gentleman-Programming/gentle-pi**: Confirmed pi ecosystem patterns — pi install, skills, extensions.

### Architecture Decision: Turborepo over Nx

| Factor | Turborepo | Nx | Decision |
|--------|-----------|-----|----------|
| Pi ecosystem fit | Used by pi-mono itself | No pi ecosystem examples | **Turborepo** |
| Configuration overhead | Minimal (turbo.json) | High (project.json per package) | **Turborepo** |
| Caching | Content-addressed, remote cache | Computation hashing | **Turborepo** |
| Learning curve | Low | High | **Turborepo** |
| Power Automate integration | GitHub Actions native | Requires Nx Cloud | **Turborepo** |

## Monorepo Structure

```
pi-driven/
├── apps/                          # Deployable applications
│   ├── api/                       # HTTP API server (Node.js)
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── dashboard/                 # Monitoring dashboard
│       ├── src/
│       └── package.json
├── packages/                      # Shared libraries
│   ├── core/                      # Domain types, Result pattern, config
│   │   ├── src/
│   │   └── package.json
│   ├── pipeline/                  # pi pipeline orchestration
│   │   ├── src/
│   │   └── package.json
│   └── security/                  # Bash approval, coding prefs
│       ├── src/
│       └── package.json
├── services/                      # Pi device services
│   ├── device-manager/            # Device registration, health checks
│   │   ├── src/
│   │   └── package.json
│   └── deploy-agent/              # Deployment agent for Pi cluster
│       ├── src/
│       └── package.json
├── .pi/                           # Pi project configuration
│   ├── settings.json
│   ├── extensions/enterprise.ts
│   ├── skills/
│   └── prompts/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Quality gates (lint, typecheck, test)
│   │   ├── build.yml              # Build with path filtering
│   │   ├── deploy.yml             # Deploy to Pi cluster
│   │   ├── release.yml            # Changelog + version bump
│   │   └── power-automate.yml     # PA webhook + polling triggers
│   └── dependabot.yml
├── docker/
│   ├── Dockerfile.api
│   └── docker-compose.yml
├── power-automate/                # Power Automate flow definitions
│   ├── ci-trigger.json            # Webhook trigger flow
│   ├── deployment-monitor.json    # Polling monitor flow
│   └── rollback-orchestrator.json # Failure recovery flow
├── turbo.json
├── biome.json
├── cliff.toml
├── package.json
└── tsconfig.base.json
```

## Dependency Rules

```
apps/        → packages/*, services/*
packages/    → packages/core (only)
services/    → packages/core, packages/security
```

No circular dependencies. Core package has zero external dependencies.
All internal references use workspace protocol: `"@pi-driven/core": "*"`

## CI/CD Pipeline with Power Automate

### Dual-Trigger Architecture

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Push Event                  │
└────────────────────┬────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   Webhook Trigger    │  ← Real-time (Power Automate)
          │  POST /api/trigger   │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  GitHub Actions CI   │  ← Build, test, deploy
          │  (path-filtered)     │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  Power Automate      │  ← Monitor + Notify
          │  Polling Check       │     (every 5 min)
          └──────────────────────┘
```

### Power Automate Integration

**Authentication**: GitHub PAT stored in Power Automate connection (encrypted).
**Webhook URL**: Power Automate generates HTTP endpoint, registered as GitHub repo webhook.
**Polling**: Power Automate recurrence trigger → GitHub API `GET /repos/{owner}/{repo}/actions/runs` → filter by status.

### Power Automate Flows

1. **CI Trigger Flow** (`ci-trigger.json`)
   - Trigger: HTTP request (GitHub webhook on `push`)
   - Action: Parse event → identify changed packages → call GitHub Actions `workflow_dispatch` with path filter

2. **Deployment Monitor Flow** (`deployment-monitor.json`)
   - Trigger: Recurrence (every 5 minutes)
   - Action: GitHub API → GET deployment statuses → if failure: notify Teams/Slack → if success: log to dashboard

3. **Rollback Orchestrator** (`rollback-orchestrator.json`)
   - Trigger: HTTP request (GitHub Actions `workflow_run` completed with failure)
   - Action: Identify failed deployment → revert to last known good tag → trigger redeploy → notify
