# Claude Code Workflow for SectionFlow

This document describes the Claude Code workflow infrastructure for developing SectionFlow, a high-performance React Native section list with cell recycling.

## Four-Phase Workflow

```
Research → Plan → Implement → Validate
```

### 1. Research (`/research_codebase`)

Conduct comprehensive research across the codebase to understand existing patterns and algorithms.

```bash
# Example usage
/research_codebase how does cell recycling work
/research_codebase explain the layout computation system
/research_codebase what happens during a scroll event
```

**Output**: Research document in `thoughts/shared/research/`

### 2. Plan (`/create_plan`)

Create detailed implementation plans with phases, success criteria, and performance considerations.

```bash
# Example usage
/create_plan thoughts/srihari/tickets/add-horizontal-layout.md
/create_plan implement variable height items
```

**Output**: Plan document in `thoughts/shared/plans/`

### 3. Implement (`/implement_plan`)

Execute an approved plan phase by phase, with verification at each step.

```bash
# Example usage
/implement_plan thoughts/shared/plans/2026-01-04-horizontal-layout.md
```

**Verification Steps**:
1. `bun run typecheck` - TypeScript validation
2. `bun run build` - Production build
3. `bun test` - Test suite
4. Manual testing in example app

### 4. Validate (`/validate_plan`)

Comprehensive validation including performance benchmarks.

```bash
# Example usage
/validate_plan thoughts/shared/plans/2026-01-04-horizontal-layout.md
```

**Performance Checks**:
- FPS benchmarks (target: 60fps)
- Memory profiling (Flipper)
- Comparison vs SectionList
- Cell recycling efficiency

## Agent Roles

### Architect Agent (`.claude/agents/architect.md`)

**Focus**: Virtualization algorithms, cell recycling, layout systems

Use for:
- Algorithm design decisions
- Performance optimization strategies
- Memory management patterns
- Layout computation approaches

**Key Code Areas**:
- `src/core/CellRecycler.ts` - Pool management
- `src/core/LayoutCache.ts` - Layout caching
- `src/core/LinearLayoutPositioner.ts` - Position computation

### Infra Agent (`.claude/agents/infra.md`)

**Focus**: Performance profiling, builds, React Native tooling

Use for:
- Build system issues
- Performance profiling setup
- React Native New Architecture
- Benchmark creation

**Tools**:
- Flipper Performance Monitor
- Hermes Profiler
- Bundle size analysis

## Directory Structure

```
.claude/
├── commands/           # Workflow commands
│   ├── research_codebase.md
│   ├── create_plan.md
│   ├── implement_plan.md
│   └── validate_plan.md
├── agents/             # Project-specific agents
│   ├── architect.md    # Virtualization focus
│   └── infra.md        # Profiling focus
├── workflows/          # Existing workflows
│   └── integration-feedback.md
└── instructions.md     # Git workflow

thoughts/
├── srihari/            # Personal notes (gitignored)
│   ├── tickets/
│   └── notes/
└── shared/             # Team-shared
    ├── research/       # Research documents
    └── plans/          # Implementation plans
```

## Performance Validation Patterns

### FPS Benchmarking

```bash
cd example
bun ios  # or bun android

# In Flipper:
# 1. Enable Performance Monitor
# 2. Scroll through 1000+ items
# 3. Note average FPS and frame drops
```

**Targets**:
- Normal scroll: 60fps
- Fast scroll: 60fps
- Direction change: No drops

### Memory Profiling

```bash
# Use Flipper Memory Profiler
# 1. Note initial heap size
# 2. Scroll for 5 minutes
# 3. Check for memory growth
# 4. Verify pool sizes stay bounded
```

**Targets**:
- Pool size: ≤ 30 cells (3 types × 10)
- No memory leaks over time
- JS heap stable during scroll

### vs SectionList Comparison

Document comparison metrics:

| Metric | SectionFlow | SectionList |
|--------|-------------|-------------|
| Initial render | ms | ms |
| Scroll FPS | fps | fps |
| Memory usage | MB | MB |
| JS thread | % | % |

## Key Constants

```typescript
DEFAULT_ESTIMATED_ITEM_SIZE = 50       // fallback item height
DEFAULT_DRAW_DISTANCE = 250            // overscan pixels
DEFAULT_MAX_POOL_SIZE = 10             // cells per type
SCROLL_VELOCITY_THRESHOLD = 2          // px/ms for adaptive overscan
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `bun dev` | Watch mode |
| `bun build` | Production build |
| `bun test` | Run tests |
| `bun run typecheck` | TypeScript validation |

## Integration with oscar-frontend

SectionFlow is consumed by oscar-frontend. When making changes:

1. Build SectionFlow: `bun build`
2. Update oscar-frontend dependency
3. Test integration in oscar app
4. Document any API changes

See `.claude/workflows/integration-feedback.md` for the integration feedback process.

## Related Resources

- [CLAUDE.md](./CLAUDE.md) - Project overview
- [Linear Project](https://linear.app/dreamstack/project/sectionflow) - Issue tracking
- `thoughts/shared/research/2026-01-04-sectionflow-architecture-baseline.md` - Architecture baseline
