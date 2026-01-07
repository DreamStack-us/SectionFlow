---
sidebar_position: 1
---

# Cell Recycling

Understanding how SectionFlow achieves high performance through cell recycling.

## The Problem

React Native's built-in `SectionList` creates a new view for every item in your list. With 1,000 items, you get 1,000 views in memory. This leads to:

- **High memory usage** - Each view consumes memory
- **Slow initial render** - Creating views is expensive
- **Janky scrolling** - Garbage collection causes frame drops

## The Solution: Cell Recycling

SectionFlow maintains a small pool of reusable cells. As you scroll:

1. **Items leaving the viewport** return their cell to the pool
2. **Items entering the viewport** grab a cell from the pool
3. **The cell is updated** with the new item's data

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────┐        │
│  │  Off-screen items          │        │
│  │  (no cells)                │        │
│  └─────────────────────────────┘        │
│                                         │
│  ┌─────────────────────────────┐ ◄──┐   │
│  │  Viewport                   │    │   │
│  │                             │    │   │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐  │    │   │
│  │  │ A │ │ B │ │ C │ │ D │  │  Recycled
│  │  └───┘ └───┘ └───┘ └───┘  │  cells   │
│  │                             │    │   │
│  └─────────────────────────────┘ ◄──┘   │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  Off-screen items          │        │
│  │  (no cells)                │        │
│  └─────────────────────────────┘        │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  Cell Pool                 │        │
│  │  ┌───┐ ┌───┐              │        │
│  │  │ E │ │ F │  (idle)      │        │
│  │  └───┘ └───┘              │        │
│  └─────────────────────────────┘        │
└─────────────────────────────────────────┘
```

## Type-Based Pools

SectionFlow maintains separate pools for different item types:

```tsx
// Different item types use different pools
const sections = [
  {
    key: 'messages',
    data: messages.map(m => ({ ...m, type: 'message' })),
  },
  {
    key: 'media',
    data: media.map(m => ({ ...m, type: 'media' })),
  },
];

// Specify item type for optimal recycling
<SectionFlow
  sections={sections}
  getItemType={(item) => item.type}
  renderItem={({ item }) => {
    if (item.type === 'message') return <MessageCell item={item} />;
    if (item.type === 'media') return <MediaCell item={item} />;
  }}
/>
```

### Why Separate Pools?

Different item types often have:
- Different heights
- Different component structures
- Different data requirements

Recycling a "message" cell for a "media" item would require expensive restructuring. Separate pools ensure cells are reused optimally.

## Layout Management

SectionFlow uses absolute positioning for all cells:

```tsx
// Each cell is positioned absolutely
<View style={{
  position: 'absolute',
  top: calculatedOffset,
  left: 0,
  right: 0,
}}>
  {renderItem({ item })}
</View>
```

### Benefits

1. **No layout recalculation** - Adding/removing cells doesn't affect siblings
2. **Smooth animations** - Cells can move independently
3. **Efficient updates** - Only changed cells re-render

### Layout Cache

SectionFlow caches measured heights:

```
LayoutCache {
  sections: {
    'section-1': {
      headerHeight: 40,
      items: [80, 120, 80, 100, ...]
    },
    'section-2': {
      headerHeight: 40,
      items: [80, 80, 160, ...]
    }
  }
}
```

This enables:
- **Instant scroll-to** operations
- **Accurate scroll bar** sizing
- **Predictable cell positioning**

## Implementation Details

### CellRecycler

The core recycling logic:

```tsx
class CellRecycler {
  private pools: Map<string, Cell[]>;

  acquire(type: string): Cell {
    const pool = this.pools.get(type) || [];
    return pool.pop() || this.createCell(type);
  }

  release(cell: Cell, type: string): void {
    const pool = this.pools.get(type) || [];
    pool.push(cell);
    this.pools.set(type, pool);
  }
}
```

### ViewabilityTracker

Determines which items need cells:

```tsx
class ViewabilityTracker {
  getVisibleRange(scrollOffset: number, viewportHeight: number) {
    // Calculate which items are visible + buffer
    return {
      startIndex,
      endIndex,
    };
  }
}
```

### SectionLayoutManager

Handles section-aware positioning:

```tsx
class SectionLayoutManager {
  getOffsetForItem(sectionKey: string, itemIndex: number): number {
    // Sum heights of all preceding sections + items
    return offset;
  }
}
```

## Memory Comparison

| Items | SectionList | SectionFlow |
|-------|-------------|-------------|
| 100   | 100 views   | ~15 views   |
| 1,000 | 1,000 views | ~15 views   |
| 10,000| 10,000 views| ~15 views   |

SectionFlow maintains roughly the same memory footprint regardless of list size.

## When Recycling Kicks In

Cells are recycled when they move outside the **render window**:

```tsx
<SectionFlow
  windowSize={21} // Renders 10 screens above + 10 below viewport
/>
```

- `windowSize={5}` = Aggressive recycling, may see blank cells during fast scroll
- `windowSize={21}` = Balanced (default)
- `windowSize={41}` = Less recycling, smoother fast scroll, more memory

## Best Practices

### 1. Consistent Item Heights

When possible, use consistent heights:

```tsx
// Good - predictable heights
<SectionFlow
  estimatedItemSize={80}
  // All items render at ~80px
/>
```

### 2. Stable Keys

Ensure items have stable, unique keys:

```tsx
// Good
keyExtractor={(item) => item.id}

// Bad - index changes when list changes
keyExtractor={(item, index) => index.toString()}
```

### 3. Avoid Measuring in Render

Don't trigger layout calculations in render:

```tsx
// Bad
renderItem={({ item }) => (
  <View onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
    ...
  </View>
)}

// Good - let SectionFlow handle measurement
renderItem={({ item }) => (
  <View style={styles.fixedHeightItem}>
    ...
  </View>
)}
```
