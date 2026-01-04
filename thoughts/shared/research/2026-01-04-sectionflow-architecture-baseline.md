---
date: 2026-01-04T16:00:00-08:00
researcher: Claude
git_commit: pending
branch: feat/DRE-321-oscar-int-fb-1
repository: SectionFlow
topic: "SectionFlow Architecture Baseline"
tags: [research, architecture, performance, baseline, virtualization]
status: complete
last_updated: 2026-01-04
last_updated_by: Claude
---

# Research: SectionFlow Architecture Baseline

**Date**: 2026-01-04
**Researcher**: Claude
**Repository**: SectionFlow

## Summary

SectionFlow is a high-performance React Native section list implementation using FlashList-style cell recycling. This document establishes the architectural baseline for the project, documenting the core algorithms, performance characteristics, and key design decisions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SectionFlow.tsx                         │
│  (Main orchestrator - scroll state, viewport, collapsed)   │
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  useRecycler │    │useScrollHandler│  │useStickyHeader   │
│ (cell pool)  │    │(velocity/dir)│    │(header pinning)  │
└──────────────┘    └──────────────┘    └──────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│              RecyclerContainer.tsx                           │
│  (Absolute positioning viewport, renders visible cells)      │
└──────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Core Layer                                 │
├──────────────┬───────────────┬────────────────┬─────────────┤
│ CellRecycler │  LayoutCache  │ LinearLayout   │ SectionLayout│
│ (pool mgmt)  │  (size cache) │ Positioner     │ Manager      │
└──────────────┴───────────────┴────────────────┴─────────────┘
```

## Detailed Findings

### 1. Cell Recycling System

**File**: `src/core/CellRecycler.ts`

The cell recycler implements a type-stratified object pool pattern:

```typescript
// Pool structure
pools: Map<string, RecyclePool>  // type -> available cells
inUse: Map<string, Set<string>>  // type -> active cell keys
cellCounter: number               // unique key generator
```

**Key Algorithms**:
- **Acquisition** (`acquireCell`): O(1) - pop from type-specific pool
- **Release** (`releaseCell`): O(1) - push to pool if under limit, else discard
- **Pool Sizing**: DEFAULT_MAX_POOL_SIZE = 10 cells per type

**Item Types**:
- `default` - Regular items
- `__section_header__` - Section headers
- `__section_footer__` - Section footers
- Custom types via `getItemType` prop

### 2. Layout Cache System

**File**: `src/core/LayoutCache.ts`

Memoization layer for measured sizes with type-based predictions:

```typescript
cache: Map<string, LayoutRect>     // key -> measured layout
typeStats: Map<string, {           // type -> running average
  totalSize: number
  count: number
}>
```

**Key Operations**:
- `get(key)`: O(1) - Direct cache lookup
- `getAverageSize(type)`: O(1) - Type-based prediction
- `invalidateFrom(index)`: O(n-index) - Cascade invalidation

**Three-Tier Size Estimation**:
1. Cached measured size (highest confidence)
2. Type-based average (medium confidence)
3. Estimated default (fallback)

### 3. Layout Positioner

**File**: `src/core/LinearLayoutPositioner.ts`

Computes absolute positions for all items:

```typescript
computedLayouts: Map<number, LayoutRect>  // index -> position
layoutsValid: boolean                       // cache validity flag
```

**Key Algorithms**:
- **Visible Range**: O(log n) binary search
- **Layout Computation**: O(n) lazy evaluation, cached
- **Invalidation**: O(n-index) for measurements

**Binary Search Implementation**:
```typescript
getVisibleRange(scrollOffset, viewportSize, overscan) {
  const start = binarySearchStart(scrollOffset - overscan);
  const end = binarySearchEnd(scrollOffset + viewportSize + overscan);
  return { startIndex: start, endIndex: end };
}
```

### 4. Section Layout Manager

**File**: `src/core/SectionLayoutManager.ts`

Section-aware abstraction over LinearLayoutPositioner:

```typescript
sectionBoundaries: Map<string, SectionBoundary>
flatIndexToSection: Map<number, SectionBoundary>
collapsedSections: Set<string>
```

**Data Flow**:
```
Section[] → updateData() → FlattenedItem[] → layoutPositioner.setData()
```

**Collapse Mechanics**:
- Collapsed sections exclude items from flattened data
- Boundary recalculation on toggle
- Full layout invalidation on collapse/expand

### 5. Viewability Tracking

**File**: `src/core/ViewabilityTracker.ts`

Time-aware visibility computation:

**Default Configuration**:
```typescript
minimumViewTime: 250               // ms visible before callback
itemVisiblePercentThreshold: 50    // % of item visible
viewAreaCoveragePercentThreshold: 0
waitForInteraction: false
```

**Key Patterns**:
- Debounced with setTimeout(0) - batches rapid scroll
- Only emits on state changes
- O(visible range) computation

### 6. Scroll Handling

**File**: `src/hooks/useScrollHandler.ts`

Scroll state management with velocity tracking:

```typescript
ScrollState {
  offset: number           // current position
  velocity: number         // pixels per millisecond
  direction: 'forward' | 'backward' | 'idle'
  isScrolling: boolean
  contentSize: number
  viewportSize: number
}
```

**Adaptive Draw Distance**:
```typescript
if (velocity < SCROLL_VELOCITY_THRESHOLD) {
  drawDistance = baseDistance;
} else {
  multiplier = min(3, 1 + velocity / threshold);
  drawDistance = baseDistance * multiplier;
}
```

### 7. Sticky Headers

**File**: `src/hooks/useStickyHeader.ts`

Section header pinning with "push" effect:

**Algorithm**:
1. Find current section (last header before scrollOffset)
2. Find next section
3. Calculate push offset when approaching next header
4. Apply translateY for smooth transition

## Performance Characteristics

### Complexity Analysis

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Binary search visible range | O(log n) | Every scroll frame |
| Cell acquire/release | O(1) | Per visible item |
| Layout computation | O(n) | Lazy, cached |
| Viewability tracking | O(visible range) | Debounced |
| Section collapse | O(n) | Re-flatten + invalidate |

### Memory Usage

| Component | Size | Scaling |
|-----------|------|---------|
| Layout Cache | O(measured items) | Bounded by session |
| Computed Layouts | O(n flat items) | All items + headers |
| Cell Pools | O(types × 10) | 3 types × 10 = 30 max |
| Section Boundaries | O(sections) | Linear in sections |

### Key Constants

```typescript
DEFAULT_ESTIMATED_ITEM_SIZE = 50       // fallback item height
DEFAULT_ESTIMATED_HEADER_SIZE = 40     // section header height
DEFAULT_ESTIMATED_FOOTER_SIZE = 0      // section footer (disabled)
DEFAULT_DRAW_DISTANCE = 250            // overscan pixels
DEFAULT_MAX_POOL_SIZE = 10             // cells per type
SCROLL_VELOCITY_THRESHOLD = 2          // pixels per ms
MEASUREMENT_DEBOUNCE_MS = 16           // ~1 frame at 60fps
DEFAULT_END_REACHED_THRESHOLD = 0.5    // 50% of viewport
```

## Optimization Strategies

1. **Lazy Layout Computation**: Layouts computed only when accessed
2. **Binary Search Visibility**: O(log n) vs O(n) for visible range
3. **Type-based Predictions**: Improve estimation with same-type averages
4. **Adaptive Draw Distance**: Scale overscan with scroll velocity (up to 3x)
5. **Debounced Callbacks**: Batch viewability and scroll events
6. **Memoized Rendering**: RecyclerContainer uses useMemo
7. **Custom Cell Equality**: RecyclerCell has shallow comparison

## Data Flow Diagram

```
User Scroll
    ↓
onScroll → useScrollHandler
    ├─→ Calculate velocity, direction
    └─→ Update ScrollState

SectionFlow render with scrollOffset
    ↓
layoutPositioner.getVisibleRange()
    ├─→ Binary search [offset - overscan, offset + viewport + overscan]
    └─→ Returns { startIndex, endIndex }

RecyclerContainer render
    ├─→ For each index in visible range:
    │   ├─→ getCell(type) → from pool or create
    │   └─→ Position absolutely at computed layout
    └─→ Cell onLayout → handleCellLayout
        └─→ updateItemLayout() → cache + invalidate

ViewabilityTracker
    ├─→ updateScrollOffset()
    ├─→ Compute threshold-based visibility
    └─→ Emit callbacks on changes

StickyHeader
    ├─→ Find current/next sections
    ├─→ Calculate push offset
    └─→ Position header overlay
```

## Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Scroll FPS | 60fps | Flipper Performance Monitor |
| Visible range calc | O(log n) | Algorithm analysis |
| Cell operations | O(1) | Algorithm analysis |
| Memory (1000 items) | < 50MB | Flipper Memory Profiler |
| Layout cache hit | > 80% | Runtime logging |

## References

- `src/core/CellRecycler.ts` - Cell pool management
- `src/core/LayoutCache.ts` - Layout caching
- `src/core/LinearLayoutPositioner.ts` - Position computation
- `src/core/SectionLayoutManager.ts` - Section abstraction
- `src/core/ViewabilityTracker.ts` - Visibility detection
- `src/components/SectionFlow.tsx` - Main orchestrator
- `src/hooks/useScrollHandler.ts` - Scroll state
- `src/hooks/useStickyHeader.ts` - Header pinning
