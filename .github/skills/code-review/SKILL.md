version: 2

updates:
  # ─── NPM ───────────────────────────────────────────────────
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
      timezone: "America/New_York" # Change to your timezone
    open-pull-requests-limit: 10
    rebase-strategy: "auto"
    versioning-strategy: "increase-if-necessary"
    commit-message:
      prefix: "deps"
      include: "scope"
    pull-request-branch-name:
      separator: "-"
    labels:
      - "dependencies"
    groups:
      # ── Everything minor+patch grouped by dependency type ──
      prod-minor-patch:
        dependency-type: "production"
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
      dev-minor-patch:
        dependency-type: "development"
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
      # ── Major updates stay isolated for careful review ──
      prod-major:
        dependency-type: "production"
        patterns:
          - "*"
        update-types:
          - "major"
      dev-major:
        dependency-type: "development"
        patterns:
          - "*"
        update-types:
          - "major"
    ignore:
      # Security updates always get their own PRs regardless
      - dependency-name: "*"
        update-types:
          - "version-update:semver-major"

  # ─── GitHub Actions ────────────────────────────────────────
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "07:00"
      timezone: "America/New_York"
    open-pull-requests-limit: 5
    rebase-strategy: "auto"
    commit-message:
      prefix: "ci"
      include: "scope"
    labels:
      - "dependencies"
      - "github-actions"
    groups:
      actions-minor-patch:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
