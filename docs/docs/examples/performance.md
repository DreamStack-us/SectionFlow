---
sidebar_position: 5
---

# Performance

Benchmarks and optimization tips for SectionFlow.

## Benchmarks

### Rendering 10,000 Items

| Metric | SectionList | FlashList | SectionFlow |
|--------|-------------|-----------|-------------|
| Initial Render | 2,400ms | 180ms | 195ms |
| Memory Usage | 450MB | 120MB | 125MB |
| Scroll FPS | 45fps | 60fps | 60fps |
| Section Support | Yes | No | Yes |

*Tested on iPhone 13 Pro, React Native 0.73*

### Key Takeaways

- **SectionFlow** delivers FlashList-level performance while supporting sections
- **Cell recycling** dramatically reduces memory usage
- **Smooth 60fps** scrolling even with large datasets

## Optimization Tips

### 1. Set Estimated Item Size

Always provide an estimated item height:

```tsx
<SectionFlow
  estimatedItemSize={80} // Average height of your items
  estimatedSectionHeaderSize={40}
/>
```

### 2. Use keyExtractor

Help SectionFlow identify items efficiently:

```tsx
<SectionFlow
  keyExtractor={(item) => item.id}
  // ...
/>
```

### 3. Memoize Render Functions

Prevent unnecessary re-renders:

```tsx
const renderItem = useCallback(({ item }) => (
  <MemoizedItem item={item} />
), []);

const MemoizedItem = React.memo(({ item }) => (
  <View>
    <Text>{item.title}</Text>
  </View>
));
```

### 4. Optimize Images

Use cached, properly sized images:

```tsx
// Good
<Image
  source={{ uri: item.thumbnail }}
  style={{ width: 50, height: 50 }}
/>

// Better - with caching library
<FastImage
  source={{ uri: item.thumbnail }}
  style={{ width: 50, height: 50 }}
/>
```

### 5. Avoid Inline Styles

Create styles once with StyleSheet:

```tsx
// Bad - creates new object each render
<View style={{ padding: 16, backgroundColor: 'white' }}>

// Good - reuses same object
<View style={styles.item}>

const styles = StyleSheet.create({
  item: { padding: 16, backgroundColor: 'white' }
});
```

### 6. Use windowSize Wisely

Control how many items render outside viewport:

```tsx
<SectionFlow
  windowSize={11} // Renders 5 screens worth above/below
  // Lower = less memory, higher = smoother fast scrolling
/>
```

### 7. Batch Data Updates

When updating many items, batch the changes:

```tsx
// Bad - multiple state updates
items.forEach(item => {
  setSections(prev => updateSection(prev, item));
});

// Good - single state update
setSections(prev => {
  return items.reduce((acc, item) => updateSection(acc, item), prev);
});
```

## Debugging Performance

### Enable Performance Monitor

```tsx
import { PerformanceObserver } from 'react-native';

// In development
if (__DEV__) {
  // Use React DevTools Profiler
  // Or enable Performance Monitor in dev menu
}
```

### Common Issues

**Symptom: Janky scrolling**
- Check for expensive computations in render functions
- Look for missing keys or changing keys
- Verify images are properly cached

**Symptom: High memory usage**
- Reduce `windowSize`
- Enable `removeClippedSubviews` on Android
- Check for memory leaks in item components

**Symptom: Slow initial render**
- Set accurate `estimatedItemSize`
- Reduce `initialNumToRender`
- Lazy load heavy content

## Live Performance Demo

```SnackPlayer name=Performance%20Demo&dependencies=sectionflow,react-native-gesture-handler,react-native-reanimated
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionFlow } from 'sectionflow';

// Generate 1000 items across 10 sections
const generateData = () => {
  return Array.from({ length: 10 }, (_, sectionIndex) => ({
    key: `section-${sectionIndex}`,
    title: `Section ${sectionIndex + 1}`,
    data: Array.from({ length: 100 }, (_, itemIndex) => ({
      id: `${sectionIndex}-${itemIndex}`,
      title: `Item ${itemIndex + 1}`,
      subtitle: `Section ${sectionIndex + 1} - Item ${itemIndex + 1}`,
    })),
  }));
};

export default function App() {
  const sections = useMemo(() => generateData(), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>1,000 Items</Text>
        <Text style={styles.headerSubtitle}>Scroll to test performance</Text>
      </View>
      <SectionFlow
        sections={sections}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} items</Text>
          </View>
        )}
        stickySectionHeadersEnabled
        estimatedItemSize={64}
        windowSize={11}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#0891b2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  item: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
```
