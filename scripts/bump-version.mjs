#!/usr/bin/env node
// scripts/bump-version.mjs — bump version using npm version
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const bump = process.argv[2] || "patch";
const valid = ["major", "minor", "patch"];

if (!valid.includes(bump)) {
  console.error(`Invalid bump: ${bump}. Use: major | minor | patch`);
  process.exit(1);
}

try {
  // Bump version (creates git tag)
  const newVersion = execSync(`npm version ${bump}`, { encoding: "utf-8" }).trim();
  console.log(`Bumped to ${newVersion}`);

  // Update cliff.toml to use new tag
  console.log("Changelog updated. Push with: git push --follow-tags origin main");
} catch (err) {
  console.error("Bump failed:", err.message);
  process.exit(1);
}
