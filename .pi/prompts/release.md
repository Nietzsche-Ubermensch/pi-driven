---
description: Prepare a release: check changelog, run tests, bump version
argument-hint: "<major|minor|patch>"
---
Prepare a release for pi-driven. Steps:

1. **Verify quality gates**
   - `npm run lint` passes
   - `npm run typecheck` passes
   - `npm test` passes with coverage ≥ 80%
   - `npm audit --audit-level=high` returns clean

2. **Review changelog**
   - `npm run changelog:preview` shows all unreleased entries
   - Entries are user-facing, specific, and well-categorized
   - Cross-reference with git log: `git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD`

3. **Bump version**
   - `npm run release:$1` bumps version, generates changelog, creates tag
   - Verify the tag: `git tag -l --sort=-v:refname | head -1`

4. **Push**
   - `git push --follow-tags origin main`
   - This triggers the GitHub Actions release workflow

5. **Verify deployment**
   - Check GitHub Actions for release workflow completion
   - Verify the release appears on GitHub Releases page
