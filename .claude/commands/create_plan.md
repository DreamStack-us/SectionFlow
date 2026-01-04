# Implementation Plan

You are tasked with creating detailed implementation plans through an interactive, iterative process. You should be skeptical, thorough, and work collaboratively with the user to produce high-quality technical specifications.

## Initial Response

When this command is invoked:

1. **Check if parameters were provided**:
   - If a file path or ticket reference was provided, skip the default message
   - Immediately read any provided files FULLY
   - Begin the research process

2. **If no parameters provided**, respond with:
```
I'll help you create a detailed implementation plan for SectionFlow. Let me start by understanding what we're building.

Please provide:
1. The task/ticket description (or reference to a ticket file)
2. Any relevant context, constraints, or specific requirements
3. Links to related research or previous implementations

I'll analyze this information and work with you to create a comprehensive plan.
```

Then wait for the user's input.

## SectionFlow-Specific Considerations

When planning for this codebase, always consider:

### Performance Constraints
- **Memory optimization**: Cell pool sizing, layout cache management
- **Scroll performance**: 60fps target, JS thread budget
- **React Native New Architecture**: Fabric renderer constraints
- **Hermes engine**: JIT compilation, memory patterns

### Architecture Patterns
- Cell recycling pool pattern (type-stratified)
- Lazy layout computation with binary search
- Absolute positioning for all cells
- Section collapse/expand mechanics

### Key Files to Reference
- `src/core/CellRecycler.ts` - Pool management
- `src/core/LayoutCache.ts` - Layout caching
- `src/components/SectionFlow.tsx` - Main orchestrator
- `src/hooks/useRecycler.ts` - Cell lifecycle

### Incremental Rollout Phases
For major features, consider phased approach:
1. **Phase 1**: Basic functionality
2. **Phase 2**: Performance optimization
3. **Phase 3**: Edge cases and polish

## Process Steps

### Step 1: Context Gathering & Initial Analysis

1. **Read all mentioned files immediately and FULLY**
2. **Spawn initial research tasks** using Explore agents:
   - Find all files related to the ticket/task
   - Understand current implementation
   - Identify existing patterns to follow
3. **Present informed understanding and focused questions**

### Step 2: Research & Discovery

1. Verify any corrections with code investigation
2. Create a research todo list
3. Spawn parallel sub-tasks for comprehensive research
4. Present findings and design options

### Step 3: Plan Structure Development

1. Create initial plan outline with phases
2. Get feedback on structure before writing details

### Step 4: Detailed Plan Writing

Save to `thoughts/shared/plans/YYYY-MM-DD-DRE-XXX-description.md`

Use this template:

```markdown
# [Feature/Task Name] Implementation Plan

## Overview
[Brief description of what we're implementing and why]

## Current State Analysis
[What exists now, what's missing, key constraints]

## Desired End State
[Specification of desired end state and how to verify it]

## What We're NOT Doing
[Explicitly list out-of-scope items]

## Implementation Approach
[High-level strategy and reasoning]

## Phase 1: [Descriptive Name]

### Overview
[What this phase accomplishes]

### Changes Required

#### 1. [Component/File Group]
**File**: `path/to/file.ext`
**Changes**: [Summary]

### Success Criteria

#### Automated Verification
- [ ] Tests pass: `bun test`
- [ ] Type checking: `bun run typecheck`
- [ ] Build succeeds: `bun run build`

#### Manual Verification
- [ ] Feature works in example app
- [ ] Performance acceptable (60fps scroll)
- [ ] No memory leaks

## Performance Considerations
[Memory usage, scroll performance, bundle size]

## Testing Strategy
[Unit tests, example app testing, performance benchmarks]

## References
- Original ticket: `thoughts/srihari/tickets/...`
- Related research: `thoughts/shared/research/...`
```

### Step 5: Sync and Review

1. Present the draft plan location
2. Iterate based on feedback
3. Continue refining until satisfied

## Important Guidelines

1. **Be Skeptical**: Question vague requirements, verify with code
2. **Be Interactive**: Get buy-in at each major step
3. **Be Thorough**: Include specific file paths and line numbers
4. **Be Practical**: Focus on incremental, testable changes
5. **Performance First**: Always consider scroll/memory impact
6. **No Open Questions**: Resolve all questions before finalizing

## Success Criteria Guidelines

Always separate into:

**Automated Verification** (can be run by execution agents):
- `bun test`, `bun run typecheck`, `bun run build`
- Specific files that should exist

**Manual Verification** (requires human testing):
- Example app functionality
- Scroll smoothness (60fps)
- Memory usage in Flipper
