# Releasing SectionFlow

This project uses [Changesets](https://github.com/changesets/changesets) for automated versioning and publishing.

## How It Works

1. **Make changes** on a feature branch
2. **Add a changeset** describing your change:
   ```bash
   npx changeset
   ```
3. **Commit** the changeset file with your PR
4. **Merge to main** - the release workflow runs automatically
5. **Changesets bot creates** a "chore: version packages" PR
6. **Merge the version PR** - packages are published to npm automatically

## Adding a Changeset

Run `npx changeset` and answer the prompts:
- Select packages that changed (use space to select)
- Choose version bump type: patch, minor, or major
- Write a summary of changes

This creates a file in `.changeset/` that gets committed with your PR.

## Version Bump Guidelines

- **patch** (0.0.x): Bug fixes, documentation, internal changes
- **minor** (0.x.0): New features, non-breaking changes
- **major** (x.0.0): Breaking changes

## Automated Publishing

Publishing is fully automated via GitHub Actions using npm Trusted Publishers (OIDC).
No secrets or tokens need to be managed - authentication is handled automatically.

## Packages Published

- `@dreamstack-us/section-flow` - Main scoped package
- `sectionflow` - Alias package (re-exports main package)

Both packages are versioned and published together.

## The Release Flow

```
Developer Flow:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. Make changes │ ──► │ 2. Add changeset│ ──► │ 3. Open PR      │
│    on branch    │     │    npx changeset│     │    to main      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
Automation Flow:                               ┌─────────────────┐
                                               │ 4. Merge PR     │
                                               │    to main      │
                                               └────────┬────────┘
                                                        │
                              ┌──────────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │ 5. Release      │
                    │    workflow runs│
                    └────────┬────────┘
                             │
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
┌───────────────────┐                   ┌───────────────────┐
│ If changesets     │                   │ If NO changesets  │
│ exist:            │                   │ (version PR       │
│                   │                   │ was merged):      │
│ Create/update     │                   │                   │
│ "Version Packages"│                   │ Run publish       │
│ PR automatically  │                   │ → npm via OIDC    │
└───────────────────┘                   └───────────────────┘
        │                                         │
        ▼                                         ▼
┌───────────────────┐                   ┌───────────────────┐
│ 6. Human reviews  │                   │ 7. Packages live  │
│    and merges     │ ─────────────────►│    on npm!        │
│    version PR     │                   │                   │
└───────────────────┘                   └───────────────────┘
```

## Troubleshooting

### "403 Forbidden" on publish
- Trusted Publishers not configured on npm.com
- Wrong repository name in Trusted Publisher config (case-sensitive!)
- Wrong workflow filename

### Version PR not appearing
- No changeset files in `.changeset/` directory
- Changeset files are empty (no packages selected)

### Build fails before publish
- Check `bun run build` works locally
- Ensure all dependencies are installed

## One-Time Setup: npm Trusted Publishers

For OIDC publishing to work, Trusted Publishers must be configured on npm.com:

### For `@dreamstack-us/section-flow`:
1. Go to: https://www.npmjs.com/package/@dreamstack-us/section-flow/access
2. Scroll to "Publishing access" section
3. Click "Add a trusted publisher"
4. Select "GitHub Actions"
5. Enter:
   - Repository owner: `DreamStack-us`
   - Repository name: `SectionFlow`
   - Workflow filename: `release.yml`
   - Environment: (leave blank)

### For `sectionflow`:
1. Go to: https://www.npmjs.com/package/sectionflow/access
2. Follow the same steps as above
