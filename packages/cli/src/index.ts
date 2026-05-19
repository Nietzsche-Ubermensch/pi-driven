#!/usr/bin/env node
/**
 * pi-driven CLI — Enterprise workflow orchestrator.
 *
 * Commands:
 *   pi-driven status       Show system status
 *   pi-driven pipeline     Show pipeline artifacts
 *   pi-driven skills       List enterprise skills
 *   pi-driven prompts      List prompt templates
 *   pi-driven validate     Run quality gates
 *   pi-driven release      Changelog preview
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

function cwd() { return process.cwd(); }

function findRoot(): string {
  let dir = cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, ".pi", "settings.json"))) return dir;
    const parent = join(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return cwd();
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const root = findRoot();

  const help = () => {
    console.log("pi-driven — Enterprise workflow orchestrator\n");
    console.log("Commands:");
    console.log("  status       System status (skills, prompts, artifacts, git)");
    console.log("  pipeline     Pipeline artifact status");
    console.log("  skills       List enterprise skills with descriptions");
    console.log("  prompts      List prompt templates with descriptions");
    console.log("  validate     Run quality gates");
    console.log("  release      Changelog preview");
  };

  const scanSkills = () => {
    const dir = join(root, ".pi", "skills");
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory() && existsSync(join(dir, d.name, "SKILL.md")))
      .map(d => d.name);
  };

  const scanPrompts = () => {
    const dir = join(root, ".pi", "prompts");
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => f.endsWith(".md")).map(f => f.replace(".md", ""));
  };

  const scanArtifacts = () => {
    const dir = join(root, ".pi-driven", "artifacts");
    if (!existsSync(dir)) return {};
    const stages = ["discover","research","design","plan","implement","validate"];
    const c: Record<string,number> = {};
    for (const s of stages) {
      const d = join(dir, s);
      c[s] = existsSync(d) ? readdirSync(d).filter(f => f.endsWith(".md")).length : 0;
    }
    return c;
  };

  if (!cmd || cmd === "help") { help(); return; }

  if (cmd === "status") {
    console.log("pi-driven enterprise v0.1.0\n");
    console.log(`Root: ${root}\n`);

    console.log("── Skills ──");
    for (const s of scanSkills()) console.log(`  ✓ ${s}`);

    console.log("\n── Prompt Templates ──");
    for (const p of scanPrompts()) console.log(`  /${p}`);

    console.log("\n── Pipeline Artifacts ──");
    for (const [s, c] of Object.entries(scanArtifacts()))
      console.log(`  ${c > 0 ? "✓" : "○"} ${s}${c > 0 ? ` (${c})` : ""}`);

    try {
      const br = execSync("git branch --show-current", { encoding: "utf-8", cwd: root }).trim();
      const st = execSync("git status --short", { encoding: "utf-8", cwd: root }).trim();
      const n = st ? st.split("\n").length : 0;
      console.log(`\n── Git ──\n  Branch: ${br}\n  Changes: ${n > 0 ? n + " files" : "clean"}`);
    } catch { /* not git */ }
    return;
  }

  if (cmd === "pipeline") {
    console.log("Pipeline Artifacts:\n");
    for (const [s, c] of Object.entries(scanArtifacts()))
      console.log(`  ${c > 0 ? "✓" : "○"} ${s.padEnd(12)} ${c} files`);
    return;
  }

  if (cmd === "skills") {
    console.log("Enterprise Skills:\n");
    for (const s of scanSkills()) {
      try {
        const c = readFileSync(join(root, ".pi", "skills", s, "SKILL.md"), "utf-8");
        const m = c.match(/^description:\s*(.+)$/m);
        const desc = m?.[1]?.trim() ?? "no description";
        console.log(`  /skill:${s}\n    ${desc.substring(0, 100)}\n`);
      } catch { console.log(`  /skill:${s}\n`); }
    }
    return;
  }

  if (cmd === "prompts") {
    console.log("Prompt Templates:\n");
    for (const p of scanPrompts()) {
      try {
        const c = readFileSync(join(root, ".pi", "prompts", p + ".md"), "utf-8");
        const m = c.match(/^description:\s*(.+)$/m);
        const desc = m?.[1]?.trim() ?? "no description";
        console.log(`  /${p}\n    ${desc.substring(0, 100)}\n`);
      } catch { console.log(`  /${p}\n`); }
    }
    return;
  }

  if (cmd === "validate") {
    console.log("Quality Gates:\n");
    try {
      execSync("npx tsc -p packages/core/tsconfig.json --noEmit --skipLibCheck", { cwd: root, stdio: "pipe" });
      console.log("  ✓ core typecheck");
    } catch (e: any) { console.log(`  ✗ core: ${e.message?.split("\n")[0]}`); }
    try {
      const o = execSync("npx vitest run", { cwd: root, encoding: "utf-8" });
      const m = o.match(/(\d+) passed/);
      console.log(`  ✓ ${m ? m[1] : "?"} tests passed`);
    } catch (e: any) { console.log(`  ✗ tests failed`); }
    console.log("\nDone.");
    return;
  }

  if (cmd === "release") {
    try {
      console.log(execSync("npx git cliff --unreleased", { cwd: root, encoding: "utf-8" }));
    } catch (e: any) {
      console.log(`Error: ${e.message}`);
    }
    return;
  }

  console.error(`Unknown: ${cmd}`);
  help();
  process.exit(1);
}

void main();
