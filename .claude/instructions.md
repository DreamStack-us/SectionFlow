# SectionFlow - Claude Code Instructions

## Git Workflow: Trunk-Based Development

**CRITICAL: Never push directly to `main`.**

### Required Workflow

1. **Create a feature branch from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b <branch-name>
   ```

2. **Branch naming conventions:**
   - `feat/<description>` - New features
   - `fix/<description>` - Bug fixes
   - `docs/<description>` - Documentation
   - `refactor/<description>` - Code refactoring
   - `ci/<description>` - CI/CD changes
   - `chore/<description>` - Maintenance tasks

3. **Push to feature branch:**
   ```bash
   git push origin <branch-name>
   ```

4. **Open a Pull Request targeting `main`**

5. **Merge via PR** (never direct push to main)

### Example

```bash
# Start new work
git checkout main && git pull
git checkout -b feat/add-sticky-headers

# Make changes, commit
git add . && git commit -m "feat: add sticky header support"

# Push and create PR
git push origin feat/add-sticky-headers
gh pr create --base main
```

## Project Context

- **Package**: `@dreamstack-us/section-flow` + `sectionflow` alias
- **Build**: `bun run build` (uses tsdown)
- **Typecheck**: `bun run typecheck`
- **Versioning**: Changesets (`bun changeset`)

## Publishing (When Ready)

Both packages are currently `"private": true`. When ready to publish:

1. Remove `"private": true` from root `package.json` and `packages/sectionflow/package.json`
2. Create changeset: `bun changeset`
3. Push - CI creates "Version Packages" PR
4. Merge PR to publish both packages to npm
