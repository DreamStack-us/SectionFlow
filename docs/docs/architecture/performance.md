---
sidebar_position: 2
---

# Performance Architecture

Deep dive into how SectionFlow achieves smooth 60fps scrolling.

## Rendering Pipeline

```
User Scrolls
     │
     ▼
┌─────────────────┐
│  Scroll Event   │  (throttled to 16ms)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Calculate      │  Which items should be visible?
│  Visible Range  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Diff Items     │  What changed since last frame?
│                 │  - Items leaving viewport
│                 │  - Items entering viewport
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Recycle Cells  │  Return cells for leaving items
│                 │  Acquire cells for entering items
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Layout  │  Position cells using transforms
│                 │  (no layout recalculation)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render Frame   │  Native view updates
└─────────────────┘
```

## Key Optimizations

### 1. Throttled Scroll Events

SectionFlow processes scroll events efficiently:

```tsx
// Default: 16ms throttle (60fps)
scrollEventThrottle={16}
```

Each scroll event triggers:
- Visible range calculation: O(log n) binary search
- Cell diff: O(visible items)
- Layout updates: O(changed items)

### 2. Binary Search for Visibility

Instead of iterating through all items:

```tsx
// O(n) - slow
function findFirstVisible(items, scrollOffset) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].offset >= scrollOffset) return i;
  }
}

// O(log n) - fast
function findFirstVisible(items, scrollOffset) {
  let low = 0, high = items.length - 1;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (items[mid].offset < scrollOffset) low = mid + 1;
    else high = mid;
  }
  return low;
}
```

### 3. Transform-Based Positioning

Cells are positioned using transforms, not layout:

```tsx
// Uses GPU-accelerated transforms
<Animated.View
  style={{
    transform: [{ translateY: offset }],
  }}
/>
```

Benefits:
- Avoids triggering layout recalculation
- GPU-accelerated animations
- Smooth 60fps updates

### 4. Batched Updates

Multiple cell changes are batched:

```tsx
// Instead of:
cell1.setPosition(100);  // triggers render
cell2.setPosition(200);  // triggers render
cell3.setPosition(300);  // triggers render

// SectionFlow does:
batchUpdate(() => {
  cell1.setPosition(100);
  cell2.setPosition(200);
  cell3.setPosition(300);
});  // single render
```

### 5. Incremental Rendering

Large lists render incrementally:

```tsx
<SectionFlow
  initialNumToRender={10}      // Render 10 items first
  maxToRenderPerBatch={10}     // Then 10 more per frame
  updateCellsBatchingPeriod={50} // 50ms between batches
/>
```

This keeps the main thread responsive during initial load.

## Sticky Header Implementation

Sticky headers use a separate overlay layer:

```
┌─────────────────────────────────┐
│  Sticky Header Overlay          │  ◄── Fixed position
│  (renders current section       │      layer
│   header)                       │
├─────────────────────────────────┤
│                                 │
│  Scroll Content                 │  ◄── Scrollable
│  ┌───────────────────────────┐  │      content
│  │ Section Header (hidden    │  │
│  │ when sticky is showing)   │  │
│  ├───────────────────────────┤  │
│  │ Item 1                    │  │
│  │ Item 2                    │  │
│  │ Item 3                    │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### How It Works

1. Track scroll position
2. Determine which section header should be sticky
3. Render that header in the overlay
4. Hide the original header to prevent doubling

```tsx
function useStickyHeader(scrollOffset, sections, layoutCache) {
  // Find section whose header should be sticky
  for (let i = sections.length - 1; i >= 0; i--) {
    const sectionOffset = layoutCache.getOffset(sections[i].key);
    if (scrollOffset >= sectionOffset) {
      return sections[i];
    }
  }
  return null;
}
```

## Collapsible Sections

Collapse animations are performant:

### State Management

```tsx
// Collapsed state is a Set for O(1) lookups
const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
  new Set(initialCollapsedSections)
);

// Toggle is O(1)
const toggleSection = (key: string) => {
  setCollapsedSections(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
};
```

### Layout Updates

When a section collapses:

1. Items are removed from render (cells returned to pool)
2. Following sections shift up (transform update)
3. Total content height updates (scroll bar adjusts)

All using transforms - no layout recalculation.

## Memory Management

### Cell Pool Sizing

Pools automatically size based on viewport:

```tsx
const optimalPoolSize = Math.ceil(viewportHeight / estimatedItemSize) + buffer;
```

### Pool Cleanup

Unused cells are cleaned up periodically:

```tsx
// Every 30 seconds, trim pools to optimal size
setInterval(() => {
  pools.forEach((pool, type) => {
    if (pool.length > optimalSize) {
      pool.length = optimalSize;
    }
  });
}, 30000);
```

### Memory Pressure Handling

On low memory warnings:

```tsx
AppState.addEventListener('memoryWarning', () => {
  // Release all pooled cells
  pools.clear();
  // They'll be recreated as needed
});
```

## Profiling Tips

### React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Record while scrolling
4. Look for:
   - Long render times (>16ms)
   - Unnecessary re-renders
   - Cascading updates

### Native Performance Monitor

1. Shake device / Cmd+D
2. Enable "Performance Monitor"
3. Watch for:
   - JS FPS drops
   - UI FPS drops
   - RAM usage

### Common Bottlenecks

| Issue | Cause | Solution |
|-------|-------|----------|
| JS FPS drops | Expensive render | Memoize, simplify |
| UI FPS drops | Layout thrashing | Use transforms |
| RAM spikes | Too many cells | Reduce windowSize |
| Initial lag | Too many items | Reduce initialNumToRender |
