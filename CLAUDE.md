# SectionFlow

High-performance section list for React Native + Web.

## Commands

```bash
bun dev          # Watch mode
bun build        # Production build
bun test         # Run tests
```

## Architecture

```
src/
├── components/     # React components
│   ├── SectionFlow.tsx          # Main component
│   ├── RecyclerContainer.tsx    # Cell recycling viewport
│   ├── RecyclerCell.tsx         # Individual recycled cell
│   ├── SectionHeader.tsx        # Default section header
│   └── StickyHeaderContainer.tsx # Sticky header overlay
├── core/           # Layout algorithms
│   ├── LayoutCache.ts           # Measured layout caching
│   ├── LinearLayoutPositioner.ts # Linear layout calculations
│   ├── SectionLayoutManager.ts  # Section-aware layout
│   ├── CellRecycler.ts          # Cell pool management
│   └── ViewabilityTracker.ts    # Viewability detection
├── hooks/          # Custom hooks
│   ├── useLayoutMeasurement.ts  # Cell measurement
│   ├── useScrollHandler.ts      # Scroll state management
│   ├── useRecycler.ts           # Recycler hook
│   ├── useStickyHeader.ts       # Sticky header logic
│   └── useViewability.ts        # Viewability tracking
├── state/          # Context providers
│   └── SectionFlowContext.tsx   # Shared state context
├── utils/          # Utility functions
└── types.ts        # TypeScript types
```

## Key Concepts

- **Cell Recycling:** Reuses rendered cells for off-screen items (like FlashList)
- **Sticky Headers:** Section headers stick to top during scroll
- **Collapsible Sections:** Toggle via `ref.toggleSection(key)`
- **Absolute Positioning:** All cells positioned absolutely for performance
- **Type-based Pools:** Cells recycled by type for optimal reuse

## Package Names

This library is published under two names (both identical):
- `sectionflow` - Short, easy to remember
- `@dreamstack-us/section-flow` - Scoped under DreamStack org

## Quick Start

```tsx
import { SectionFlow } from 'sectionflow';
// or: import { SectionFlow } from '@dreamstack-us/section-flow';
import type { Section, RenderItemInfo, RenderSectionHeaderInfo } from 'sectionflow';

interface Task {
  id: string;
  title: string;
}

const sections: Section<Task>[] = [
  { key: 'backlog', title: 'Backlog', data: [...] },
  { key: 'in-progress', title: 'In Progress', data: [...] },
];

function MyList() {
  return (
    <SectionFlow<Task>
      sections={sections}
      renderItem={({ item }) => <TaskCard task={item} />}
      renderSectionHeader={({ section }) => <Header title={section.title} />}
      stickySectionHeadersEnabled={true}
      stickyHeaderStyle={{ backgroundColor: '#1e293b' }}
      collapsible={true}
      estimatedItemSize={100}
    />
  );
}
```

## Integration Workflow

See `.claude/workflows/integration-feedback.md` for handling feedback from consuming projects.

## Related Projects

- **oscar-frontend:** Primary consumer (`dreamstack-hq/apps/oscar-frontend`)
- Linear Project: [SectionFlow](https://linear.app/dreamstack/project/sectionflow)
