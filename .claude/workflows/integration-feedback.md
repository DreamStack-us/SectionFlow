# Integration Feedback Workflow

When a consuming project (oscar-frontend, etc.) discovers issues during integration, follow this workflow.

## Issue Categories

| Category | Action | Example |
|----------|--------|---------|
| API Improvements | New ticket + implement | Missing `stickyHeaderStyle` prop |
| Bugs | New ticket + fix | Hardcoded white background |
| Performance | New ticket + profile | Unnecessary re-renders |
| Documentation | Update docs | Unclear usage patterns |

## Workflow

### 1. Ticket-First Approach

**BEFORE making any changes:**

1. Create a Linear ticket in the **SectionFlow project**
2. Get the ticket ID (e.g., DRE-321)
3. Create a feature branch: `feat/DRE-321/description`
4. Make changes, commit with ticket reference
5. Rebuild: `bun run build`
6. Consumer updates their code to use the fix

### 2. Ticket Template for Integration Feedback

```markdown
## Problem discovered during integration

**Consumer:** [oscar-frontend / project name]
**Consumer Ticket:** DRE-XXX (link)

## Issue

[Description of the issue encountered]

## Proposed Solution

[API change / bug fix / etc.]

## Files to modify

- src/components/...
- src/types.ts (if API change)
```

### 3. Branch Naming

```
feat/DRE-XXX/short-description
```

Examples:
- `feat/DRE-321/sticky-header-style`
- `feat/DRE-322/fix-collapse-animation`

### 4. Commit Messages

Always reference the ticket:

```bash
git commit -m "feat: add stickyHeaderStyle prop (DRE-321)"
git commit -m "fix: remove hardcoded white background (DRE-321)"
```

### 5. After Fixing

1. Rebuild: `bun run build`
2. Consumer runs `bun install` to pick up changes
3. Add comment to consumer ticket noting the fix
4. Close the SectionFlow ticket

## Example: DRE-321 stickyHeaderStyle

This ticket was created retroactively after discovering the issue during oscar-frontend integration:

1. **Issue:** Sticky headers had hardcoded white background
2. **Consumer ticket:** DRE-317 (SectionFlow integration)
3. **SectionFlow ticket:** DRE-321
4. **Solution:** Added `stickyHeaderStyle` prop
5. **Files:** `types.ts`, `SectionFlow.tsx`, `StickyHeaderContainer.tsx`

## Linking Tickets

Use Linear's relation features:
- **Related to:** Link consumer ticket ↔ library ticket
- **Blocks/Blocked by:** If consumer work is blocked by library fix

## Consumers

Current projects using SectionFlow:
- `dreamstack-hq/apps/oscar-frontend` - OSCAR fleet management dashboard
