---
sidebar_position: 1
---

# Props

Complete reference for all SectionFlow component props.

## Required Props

### `sections`

```tsx
sections: Section<T>[]
```

Array of section objects. Each section must have:

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Unique identifier for the section |
| `title` | `string` | Display title for the section header |
| `data` | `T[]` | Array of items in this section |

```tsx
const sections: Section<Task>[] = [
  { key: 'backlog', title: 'Backlog', data: [...] },
  { key: 'in-progress', title: 'In Progress', data: [...] },
];
```

### `renderItem`

```tsx
renderItem: (info: RenderItemInfo<T>) => React.ReactElement
```

Renders each item in the list.

```tsx
interface RenderItemInfo<T> {
  item: T;           // The item data
  index: number;     // Index within the section
  section: Section<T>; // Parent section
  sectionIndex: number; // Index of the section
}
```

Example:
```tsx
renderItem={({ item, index }) => (
  <View style={styles.item}>
    <Text>{item.title}</Text>
  </View>
)}
```

## Section Header Props

### `renderSectionHeader`

```tsx
renderSectionHeader?: (info: RenderSectionHeaderInfo<T>) => React.ReactElement
```

Renders section headers.

```tsx
interface RenderSectionHeaderInfo<T> {
  section: Section<T>;  // The section data
  index: number;        // Section index
  isCollapsed: boolean; // Whether section is collapsed
}
```

Example:
```tsx
renderSectionHeader={({ section, isCollapsed }) => (
  <View style={styles.header}>
    <Text>{section.title}</Text>
    <Text>{isCollapsed ? '▸' : '▾'}</Text>
  </View>
)}
```

### `stickySectionHeadersEnabled`

```tsx
stickySectionHeadersEnabled?: boolean
```

Enable sticky section headers. Default: `false`

### `stickyHeaderStyle`

```tsx
stickyHeaderStyle?: ViewStyle
```

Additional styles applied to the sticky header container.

```tsx
stickyHeaderStyle={{
  backgroundColor: '#1e293b',
  shadowOpacity: 0.1,
}}
```

## Collapsible Props

### `collapsible`

```tsx
collapsible?: boolean
```

Enable collapsible sections. Default: `false`

### `initialCollapsedSections`

```tsx
initialCollapsedSections?: string[]
```

Array of section keys that should be collapsed initially.

```tsx
initialCollapsedSections={['archived', 'completed']}
```

### `onSectionCollapse`

```tsx
onSectionCollapse?: (sectionKey: string, isCollapsed: boolean) => void
```

Called when a section's collapsed state changes.

## Layout Props

### `estimatedItemSize`

```tsx
estimatedItemSize?: number
```

Estimated height of each item. Improves initial render performance.

### `estimatedSectionHeaderSize`

```tsx
estimatedSectionHeaderSize?: number
```

Estimated height of section headers. Default: `40`

### `contentContainerStyle`

```tsx
contentContainerStyle?: ViewStyle
```

Style applied to the scroll content container.

### `style`

```tsx
style?: ViewStyle
```

Style applied to the outer container.

## Scroll Props

### `onScroll`

```tsx
onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
```

Called on scroll events.

### `onMomentumScrollEnd`

```tsx
onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
```

Called when momentum scroll ends.

### `scrollEventThrottle`

```tsx
scrollEventThrottle?: number
```

How often to fire scroll events (ms). Default: `16`

### `showsVerticalScrollIndicator`

```tsx
showsVerticalScrollIndicator?: boolean
```

Show vertical scroll indicator. Default: `true`

## Viewability Props

### `onViewableItemsChanged`

```tsx
onViewableItemsChanged?: (info: {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}) => void
```

Called when viewable items change.

### `viewabilityConfig`

```tsx
viewabilityConfig?: ViewabilityConfig
```

Configuration for determining which items are viewable.

```tsx
viewabilityConfig={{
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 250,
}}
```

## Performance Props

### `windowSize`

```tsx
windowSize?: number
```

Number of items to render outside the visible area. Default: `21`

### `maxToRenderPerBatch`

```tsx
maxToRenderPerBatch?: number
```

Maximum items to render per batch. Default: `10`

### `updateCellsBatchingPeriod`

```tsx
updateCellsBatchingPeriod?: number
```

Time between batch renders (ms). Default: `50`

### `removeClippedSubviews`

```tsx
removeClippedSubviews?: boolean
```

Remove views outside viewport. Default: `true` on Android

## Keyboard Props

### `keyboardShouldPersistTaps`

```tsx
keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
```

Keyboard dismiss behavior on tap.

### `keyboardDismissMode`

```tsx
keyboardDismissMode?: 'none' | 'on-drag' | 'interactive'
```

When to dismiss keyboard while scrolling.

## Other Props

### `inverted`

```tsx
inverted?: boolean
```

Invert the scroll direction. Default: `false`

### `ListEmptyComponent`

```tsx
ListEmptyComponent?: React.ComponentType | React.ReactElement
```

Rendered when sections array is empty.

### `ListHeaderComponent`

```tsx
ListHeaderComponent?: React.ComponentType | React.ReactElement
```

Rendered at the top of the list.

### `ListFooterComponent`

```tsx
ListFooterComponent?: React.ComponentType | React.ReactElement
```

Rendered at the bottom of the list.

### `keyExtractor`

```tsx
keyExtractor?: (item: T, index: number) => string
```

Extract unique key for each item. Default uses `item.id` or `item.key`.

### `refreshControl`

```tsx
refreshControl?: React.ReactElement
```

Pull-to-refresh component.

```tsx
refreshControl={
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
  />
}
```
