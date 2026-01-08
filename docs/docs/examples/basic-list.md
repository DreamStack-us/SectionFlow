---
sidebar_position: 1
---

# Basic List

A simple sectioned list with items grouped by category.

## Live Example

```SnackPlayer name=Basic%20List&dependencies=sectionflow,react-native-gesture-handler,react-native-reanimated
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionFlow } from 'sectionflow';

const sections = [
  {
    key: 'fruits',
    title: 'Fruits',
    data: [
      { id: '1', name: 'Apple', emoji: '🍎' },
      { id: '2', name: 'Banana', emoji: '🍌' },
      { id: '3', name: 'Orange', emoji: '🍊' },
      { id: '4', name: 'Grape', emoji: '🍇' },
    ],
  },
  {
    key: 'vegetables',
    title: 'Vegetables',
    data: [
      { id: '5', name: 'Carrot', emoji: '🥕' },
      { id: '6', name: 'Broccoli', emoji: '🥦' },
      { id: '7', name: 'Tomato', emoji: '🍅' },
    ],
  },
  {
    key: 'dairy',
    title: 'Dairy',
    data: [
      { id: '8', name: 'Milk', emoji: '🥛' },
      { id: '9', name: 'Cheese', emoji: '🧀' },
      { id: '10', name: 'Butter', emoji: '🧈' },
    ],
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      <SectionFlow
        sections={sections}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            <Text style={styles.headerText}>{section.title}</Text>
            <Text style={styles.count}>{section.data.length} items</Text>
          </View>
        )}
        estimatedItemSize={60}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  count: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
```

## Code Breakdown

### Section Data Structure

Each section needs a `key`, `title`, and `data` array:

```tsx
const sections = [
  {
    key: 'fruits',      // Unique identifier
    title: 'Fruits',    // Display text
    data: [...]         // Array of items
  },
];
```

### Render Functions

**renderItem** - Renders each item in the list:

```tsx
renderItem={({ item }) => (
  <View style={styles.item}>
    <Text>{item.name}</Text>
  </View>
)}
```

**renderSectionHeader** - Renders section headers:

```tsx
renderSectionHeader={({ section }) => (
  <View style={styles.header}>
    <Text>{section.title}</Text>
  </View>
)}
```

### Performance

Set `estimatedItemSize` to improve initial render:

```tsx
estimatedItemSize={60} // Average height of each item
```

## Next Steps

- [Sticky Headers](/docs/examples/sticky-headers) - Headers that stick while scrolling
- [Collapsible Sections](/docs/examples/collapsible-sections) - Expand/collapse sections
