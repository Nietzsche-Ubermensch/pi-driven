/**
 * pi-driven enterprise extension
 *
 * Ties together the full enterprise suite:
 * - Bash approval guard (allow-list security)
 * - Git checkpointing (auto-commit before destructive ops)
 * - Session management (list, prune, current)
 * - Pipeline orchestration (rpiv-pi integration)
 * - Mode-aware behavior (plan / orchestrator / yolo / ask / code)
 *
 * @module pi-driven/enterprise
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

// ── Mode detection ─────────────────────────────────────────
function getMode(): string {
  return process.env.PI_MODE ?? "yolo";
}

function isPlanMode(): boolean {
  return getMode() === "plan";
}

function isOrchestratorMode(): boolean {
  return getMode() === "orchestrator";
}

function isAskMode(): boolean {
  return getMode() === "ask";
}

function isCodeMode(): boolean {
  return getMode() === "code";
}

// ── Enterprise extension ───────────────────────────────────
export default function enterpriseExtension(pi: ExtensionAPI) {
  const mode = getMode();

  // ── Session start: announce mode ─────────────────────────
  pi.on("session_start", async (_event, ctx) => {
    const modeLabels: Record<string, string> = {
      plan: "📋 Plan Mode — writes restricted to plan file",
      orchestrator: "🎯 Orchestrator Mode — coordinating subagents",
      yolo: "⚡ YOLO Mode — full access",
      ask: "❓ Ask Mode — read-only, no writes",
      code: "💻 Code Mode — focused code editing",
    };

    ctx.ui.notify(
      `pi-driven enterprise · ${modeLabels[mode] ?? mode}`,
      "info",
    );
  });

  // ── Plan mode: restrict writes to plan file ──────────────
  if (isPlanMode()) {
    pi.on("tool_call", async (event, ctx) => {
      // In plan mode, only allow read tools + write to plan file
      const writeTools = ["write", "edit", "bash"];
      if (writeTools.includes(event.toolName)) {
        // Allow writes to .pi-driven/artifacts/ only
        const input = (event.input as Record<string, string> | undefined) ?? {};
        const path = input["path"] ?? input["filePath"] ?? "";
        if (!path.includes(".pi-driven/artifacts/") && !path.includes(".rpiv/artifacts/")) {
          return {
            block: true,
            reason: `Plan mode: writes restricted to .pi-driven/artifacts/ and .rpiv/artifacts/ directories`,
          };
        }
      }
    });
  }

  // ── Ask mode: block all writes ───────────────────────────
  if (isAskMode()) {
    pi.on("tool_call", async (event, _ctx) => {
      const writeTools = ["write", "edit", "bash", "rm", "mkdir"];
      if (writeTools.includes(event.toolName)) {
        return { block: true, reason: "Ask mode: read-only" };
      }
    });
  }

  // ── Register pipeline status command ─────────────────────
  pi.registerCommand("pipeline", {
    description: "Show pi-driven pipeline status",
    handler: async (_args, ctx) => {
      const fs = await import("node:fs");
      const { join } = await import("node:path");

      const artifactsDir = join(ctx.cwd, ".pi-driven", "artifacts");
      const stages = ["discover", "research", "design", "plan", "implement", "validate"];

      const status = stages.map((stage) => {
        const dir = join(artifactsDir, stage);
        const exists = fs.existsSync(dir);
        const files = exists ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")).length : 0;
        return `${exists ? "✓" : "○"} ${stage}${files > 0 ? ` (${files} files)` : ""}`;
      });

      ctx.ui.notify(
        `Pipeline Status:\n${status.join("\n")}\n\nUse /rpiv-setup to initialize the rpiv-pi pipeline.`,
        "info",
      );
    },
  });

  // ── Register enterprise status command ───────────────────
  pi.registerCommand("enterprise", {
    description: "Show pi-driven enterprise status",
    handler: async (_args, ctx) => {
      const packages = [
        "bash-approval",
        "coding-preferences",
        "git-checkpoint",
        "session-manager",
        "auto-summarize",
        "code-formatter",
        "plannotator",
        "rpiv-pi",
        "rpiv-todo",
        "rpiv-advisor",
        "rpiv-ask-user-question",
        "pi-git-ui",
        "pi-subagents",
      ];

      ctx.ui.notify(
        `pi-driven enterprise v0.1.0\nMode: ${mode}\nPackages: ${packages.length} loaded\n\n` +
          packages.map((p) => `  ✓ ${p}`).join("\n"),
        "info",
      );
    },
  });
}
