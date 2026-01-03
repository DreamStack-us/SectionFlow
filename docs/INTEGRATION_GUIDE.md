# SectionFlow Integration Guide

> A comprehensive guide for integrating `@dreamstack-us/section-flow` into DreamStack applications.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Common Patterns](#common-patterns)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Migration from SectionList](#migration-from-sectionlist)

---

## Overview

SectionFlow is a high-performance, section-first list library for React Native that provides:

- **10x better performance** through cell recycling (FlashList-style)
- **Sticky section headers** that actually work
- **Reliable scroll methods** (`scrollToSection`, `scrollToItem`)
- **Full TypeScript support** with proper generics
- **Drop-in replacement** for React Native's SectionList

### Requirements

- React Native **0.76+** (New Architecture required)
- React **18.0+**
- Expo SDK **52+** (if using Expo)

---

## Installation

### In dreamstack-hq Monorepo

Add to your app's `package.json`:

```json
{
  "dependencies": {
    "@dreamstack-us/section-flow": "workspace:*"
  }
}
```

Then run:

```bash
bun install
```

### Live TypeScript Support

For live type resolution during development (no rebuild needed), ensure your app's `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "customConditions": ["@dreamstack-us/source"]
  }
}
```

This makes TypeScript resolve directly to `.ts` source files within the monorepo.

### Standalone Installation (npm)

```bash
# When published to npm
npm install @dreamstack-us/section-flow

# or
bun add @dreamstack-us/section-flow
```

---

## Quick Start

### Basic Example

```tsx
import { SectionFlow, type Section } from '@dreamstack-us/section-flow';

interface Item {
  id: string;
  title: string;
}

const sections: Section<Item>[] = [
  {
    key: 'featured',
    title: 'Featured',
    data: [
      { id: '1', title: 'Item One' },
      { id: '2', title: 'Item Two' },
    ],
  },
  {
    key: 'recent',
    title: 'Recent',
    data: [
      { id: '3', title: 'Item Three' },
      { id: '4', title: 'Item Four' },
    ],
  },
];

function MyList() {
  return (
    <SectionFlow<Item>
      sections={sections}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      renderSectionHeader={({ section }) => (
        <View style={styles.header}>
          <Text style={styles.headerText}>{section.title}</Text>
        </View>
      )}
      stickySectionHeadersEnabled={true}
    />
  );
}
```

### With Ref Methods

```tsx
import { useRef } from 'react';
import { SectionFlow, type SectionFlowRef } from '@dreamstack-us/section-flow';

function MyList() {
  const listRef = useRef<SectionFlowRef<Item>>(null);

  const scrollToFeatured = () => {
    listRef.current?.scrollToSection({
      sectionKey: 'featured',
      animated: true
    });
  };

  const scrollToItem = () => {
    listRef.current?.scrollToItem({
      sectionKey: 'recent',
      itemIndex: 2,
      animated: true
    });
  };

  return (
    <>
      <Button title="Go to Featured" onPress={scrollToFeatured} />
      <SectionFlow<Item>
        ref={listRef}
        sections={sections}
        renderItem={({ item }) => <ItemRow item={item} />}
        renderSectionHeader={({ section }) => <Header section={section} />}
      />
    </>
  );
}
```

---

## Core Concepts

### Cell Recycling

Unlike React Native's SectionList which destroys and recreates components as they scroll off-screen, SectionFlow **recycles** them:

```
Traditional (SectionList):
  Scroll down → Destroy top items → Create new bottom items → GC pressure

SectionFlow:
  Scroll down → Move top items to pool → Reuse for bottom items → No GC
```

This eliminates garbage collection pauses and provides smooth 60fps scrolling.

### Type-Based Pools

If your list has different item types, use `getItemType` for optimized recycling:

```tsx
<SectionFlow<Item>
  sections={sections}
  getItemType={(item) => {
    if (item.hasImage) return 'image-item';
    if (item.isPromo) return 'promo-item';
    return 'default';
  }}
  renderItem={({ item }) => {
    // Items of same type will reuse each other's views
    if (item.hasImage) return <ImageItem item={item} />;
    if (item.isPromo) return <PromoItem item={item} />;
    return <DefaultItem item={item} />;
  }}
/>
```

### Absolute Positioning

SectionFlow uses absolute positioning for all items:

```tsx
// Each cell is rendered as:
<View style={{
  position: 'absolute',
  top: computedY,
  left: 0,
  width: containerWidth,
}}>
  {yourContent}
</View>
```

This enables:
- Efficient recycling without DOM structure changes
- Precise layout corrections
- Proper sticky header behavior

---

## API Reference

### SectionFlowProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sections` | `Section<T>[]` | required | Array of sections with data |
| `renderItem` | `(info: RenderItemInfo<T>) => ReactElement` | required | Render function for items |
| `renderSectionHeader` | `(info: RenderSectionHeaderInfo<T>) => ReactElement` | - | Render function for headers |
| `renderSectionFooter` | `(info: RenderSectionFooterInfo<T>) => ReactElement` | - | Render function for footers |
| `keyExtractor` | `(item: T, index: number) => string` | auto | Extract unique key from item |
| `getItemType` | `(item: T, index: number, section: Section<T>) => string` | - | Return item type for recycling |
| `estimatedItemSize` | `number` | `50` | Estimated height of items |
| `estimatedSectionHeaderSize` | `number` | `40` | Estimated height of headers |
| `stickySectionHeadersEnabled` | `boolean` | `true` | Enable sticky headers |
| `horizontal` | `boolean` | `false` | Horizontal scrolling |
| `drawDistance` | `number` | `250` | Overscan distance in pixels |
| `maxItemsInRecyclePool` | `number` | `10` | Max recycled items per type |
| `onEndReached` | `(info: { distanceFromEnd: number }) => void` | - | Called when scroll near end |
| `onEndReachedThreshold` | `number` | `0.5` | How far from end to trigger |
| `viewabilityConfig` | `ViewabilityConfig` | - | Configure viewability tracking |
| `onViewableItemsChanged` | `(info) => void` | - | Called when visible items change |
| `ListHeaderComponent` | `ComponentType \| ReactElement` | - | Header above all sections |
| `ListFooterComponent` | `ComponentType \| ReactElement` | - | Footer below all sections |
| `ListEmptyComponent` | `ComponentType \| ReactElement` | - | Shown when sections empty |
| `refreshing` | `boolean` | - | Show refresh indicator |
| `onRefresh` | `() => void` | - | Pull-to-refresh callback |
| `extraData` | `unknown` | - | Trigger re-render on change |
| `debug` | `boolean` | `false` | Show debug overlays |

### SectionFlowRef Methods

```tsx
interface SectionFlowRef<T> {
  // Scroll to a section header
  scrollToSection(options: {
    sectionKey?: string;
    sectionIndex?: number;
    animated?: boolean;
    viewPosition?: number; // 0=top, 0.5=center, 1=bottom
  }): void;

  // Scroll to a specific item
  scrollToItem(options: {
    sectionKey?: string;
    sectionIndex?: number;
    itemIndex: number;
    animated?: boolean;
    viewPosition?: number;
  }): void;

  // Scroll to offset
  scrollToOffset(options: {
    offset: number;
    animated?: boolean
  }): void;

  // Scroll to end
  scrollToEnd(options?: { animated?: boolean }): void;

  // Toggle section collapse (Phase 2)
  toggleSection(sectionKey: string): void;

  // Get all section layouts
  getSectionLayouts(): SectionLayoutInfo[];

  // Get currently visible items
  getVisibleItems(): ViewToken<T>[];

  // Record user interaction (for viewability)
  recordInteraction(): void;

  // Flash scroll indicators
  flashScrollIndicators(): void;
}
```

### Section Type

```tsx
interface Section<T> {
  key: string;      // Unique identifier
  title?: string;   // Display title
  data: T[];        // Items in this section
}
```

### RenderItemInfo

```tsx
interface RenderItemInfo<T> {
  item: T;                    // The item data
  index: number;              // Index within section
  section: Section<T>;        // Parent section
  sectionIndex: number;       // Index of section
}
```

### ViewabilityConfig

```tsx
interface ViewabilityConfig {
  minimumViewTime?: number;                    // ms before considered "viewed" (default: 250)
  viewAreaCoveragePercentThreshold?: number;   // % of viewport item must cover
  itemVisiblePercentThreshold?: number;        // % of item that must be visible (default: 50)
  waitForInteraction?: boolean;                // Wait for user interaction first
}
```

---

## Common Patterns

### Alphabet Index (Contacts List)

```tsx
function ContactsList() {
  const listRef = useRef<SectionFlowRef<Contact>>(null);
  const alphabet = sections.map(s => s.key);

  return (
    <View style={styles.container}>
      <SectionFlow<Contact>
        ref={listRef}
        sections={sections}
        renderItem={({ item }) => <ContactRow contact={item} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text>{section.key}</Text>
          </View>
        )}
      />

      {/* Alphabet index on the side */}
      <View style={styles.alphabetIndex}>
        {alphabet.map(letter => (
          <Pressable
            key={letter}
            onPress={() => listRef.current?.scrollToSection({ sectionKey: letter })}
          >
            <Text style={styles.letter}>{letter}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
```

### Infinite Scroll

```tsx
function InfiniteList() {
  const [sections, setSections] = useState<Section<Item>[]>(initialSections);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);

    const newItems = await fetchMoreItems();
    setSections(prev => {
      // Append to last section or create new
      const updated = [...prev];
      updated[updated.length - 1].data.push(...newItems);
      return updated;
    });

    setLoading(false);
  };

  return (
    <SectionFlow<Item>
      sections={sections}
      renderItem={({ item }) => <ItemRow item={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
    />
  );
}
```

### Pull to Refresh

```tsx
function RefreshableList() {
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<Section<Item>[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    const freshData = await fetchFreshData();
    setSections(freshData);
    setRefreshing(false);
  };

  return (
    <SectionFlow<Item>
      sections={sections}
      renderItem={({ item }) => <ItemRow item={item} />}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
```

### Viewability Tracking (Analytics)

```tsx
function TrackedList() {
  const handleViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    // Track impressions
    changed
      .filter(item => item.isViewable)
      .forEach(item => {
        analytics.trackImpression(item.key);
      });
  }, []);

  return (
    <SectionFlow<Item>
      sections={sections}
      renderItem={({ item }) => <ItemRow item={item} />}
      viewabilityConfig={{
        minimumViewTime: 1000,           // Must be visible for 1 second
        itemVisiblePercentThreshold: 80, // 80% of item must be visible
      }}
      onViewableItemsChanged={handleViewableItemsChanged}
    />
  );
}
```

### Mixed Item Types

```tsx
type ListItem =
  | { type: 'product'; id: string; name: string; price: number }
  | { type: 'ad'; id: string; imageUrl: string }
  | { type: 'banner'; id: string; message: string };

function MixedList() {
  return (
    <SectionFlow<ListItem>
      sections={sections}
      getItemType={(item) => item.type}
      renderItem={({ item }) => {
        switch (item.type) {
          case 'product':
            return <ProductCard product={item} />;
          case 'ad':
            return <AdBanner ad={item} />;
          case 'banner':
            return <PromoBanner banner={item} />;
        }
      }}
    />
  );
}
```

---

## Performance Optimization

### 1. Use `getItemType` for Heterogeneous Lists

```tsx
// ❌ Without getItemType - all items share one pool
<SectionFlow renderItem={({ item }) =>
  item.large ? <LargeItem /> : <SmallItem />
} />

// ✅ With getItemType - separate pools, no layout thrashing
<SectionFlow
  getItemType={(item) => item.large ? 'large' : 'small'}
  renderItem={({ item }) =>
    item.large ? <LargeItem /> : <SmallItem />
  }
/>
```

### 2. Provide Accurate Size Estimates

```tsx
// Measure your actual item heights and provide them
<SectionFlow
  estimatedItemSize={72}          // Your actual item height
  estimatedSectionHeaderSize={48}  // Your actual header height
  renderItem={...}
/>
```

### 3. Memoize Render Functions

```tsx
// ❌ Creates new function every render
<SectionFlow
  renderItem={({ item }) => <ItemRow item={item} />}
/>

// ✅ Stable function reference
const renderItem = useCallback(
  ({ item }: RenderItemInfo<Item>) => <ItemRow item={item} />,
  []
);

<SectionFlow renderItem={renderItem} />
```

### 4. Memoize Item Components

```tsx
// ❌ Re-renders on every parent render
function ItemRow({ item }: { item: Item }) {
  return <View>...</View>;
}

// ✅ Only re-renders when item changes
const ItemRow = memo(function ItemRow({ item }: { item: Item }) {
  return <View>...</View>;
});
```

### 5. Use `extraData` for External State

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);

// extraData triggers re-render when selection changes
<SectionFlow
  sections={sections}
  extraData={selectedId}
  renderItem={({ item }) => (
    <ItemRow
      item={item}
      selected={item.id === selectedId}
      onSelect={() => setSelectedId(item.id)}
    />
  )}
/>
```

### 6. Adjust Draw Distance for Your Use Case

```tsx
// Fast scrolling lists - increase overscan
<SectionFlow drawDistance={500} />

// Memory-constrained - reduce overscan
<SectionFlow drawDistance={100} />
```

---

## Troubleshooting

### Items Not Rendering

**Cause**: Missing or zero container height.

**Solution**: Ensure parent has defined height:

```tsx
// ❌ No height defined
<View>
  <SectionFlow sections={sections} />
</View>

// ✅ Flex or explicit height
<View style={{ flex: 1 }}>
  <SectionFlow sections={sections} />
</View>
```

### Sticky Headers Not Working

**Cause**: `stickySectionHeadersEnabled` is false or no `renderSectionHeader`.

**Solution**:

```tsx
<SectionFlow
  stickySectionHeadersEnabled={true}  // Ensure this is true
  renderSectionHeader={({ section }) => (
    <View style={styles.header}>
      <Text>{section.title}</Text>
    </View>
  )}
/>
```

### Items Flickering During Fast Scroll

**Cause**: Not enough items in recycle pool.

**Solution**: Increase pool size:

```tsx
<SectionFlow
  maxItemsInRecyclePool={20}
  drawDistance={400}
/>
```

### TypeScript Generic Not Inferring

**Cause**: Missing explicit generic.

**Solution**: Explicitly provide the generic:

```tsx
// ❌ Type might not infer correctly
<SectionFlow sections={sections} />

// ✅ Explicit generic
<SectionFlow<MyItemType> sections={sections} />
```

### Performance Issues on Old Architecture

**Cause**: SectionFlow is optimized for New Architecture.

**Solution**: Ensure New Architecture is enabled:

```json
// app.json (Expo)
{
  "expo": {
    "newArchEnabled": true
  }
}
```

---

## Migration from SectionList

### Before (SectionList)

```tsx
import { SectionList } from 'react-native';

<SectionList
  sections={sections}
  renderItem={({ item, index, section }) => <ItemRow item={item} />}
  renderSectionHeader={({ section }) => <Header section={section} />}
  keyExtractor={(item) => item.id}
  stickySectionHeadersEnabled={true}
/>
```

### After (SectionFlow)

```tsx
import { SectionFlow } from '@dreamstack-us/section-flow';

<SectionFlow<ItemType>
  sections={sections}
  renderItem={({ item, index, section }) => <ItemRow item={item} />}
  renderSectionHeader={({ section }) => <Header section={section} />}
  keyExtractor={(item) => item.id}
  stickySectionHeadersEnabled={true}

  // NEW: Performance optimizations
  estimatedItemSize={72}
  getItemType={(item) => item.type}
/>
```

### Key Differences

| Feature | SectionList | SectionFlow |
|---------|-------------|-------------|
| Recycling | ❌ Virtualization | ✅ Cell recycling |
| Sticky Headers | Buggy | Works correctly |
| scrollToLocation | Often fails | Reliable |
| TypeScript | Poor generics | Full generics |
| Architecture | Both | New Arch only |
| Performance | ~30fps on Android | 60fps |

---

## Questions?

- Open an issue on the [SectionFlow repo](https://github.com/DreamStack-us/SectionFlow)
- Ask in the #engineering Slack channel
- Check the [example app](../example/App.tsx) for working code

---

*Last updated: January 2026*
