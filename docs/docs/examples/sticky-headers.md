---
sidebar_position: 2
---

# Sticky Headers

Section headers that stick to the top of the screen while scrolling through their section.

## Live Example

```SnackPlayer name=Sticky%20Headers&dependencies=@dreamstack-us/section-flow,react-native-gesture-handler,react-native-reanimated
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionFlow } from '@dreamstack-us/section-flow';

// Generate sample data
const generateTasks = (status, count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${status}-${i}`,
    title: `Task ${i + 1}`,
    description: `This is a ${status.toLowerCase()} task`,
  }));
};

const sections = [
  {
    key: 'backlog',
    title: 'Backlog',
    data: generateTasks('Backlog', 8),
  },
  {
    key: 'todo',
    title: 'To Do',
    data: generateTasks('Todo', 6),
  },
  {
    key: 'in-progress',
    title: 'In Progress',
    data: generateTasks('InProgress', 4),
  },
  {
    key: 'review',
    title: 'In Review',
    data: generateTasks('Review', 3),
  },
  {
    key: 'done',
    title: 'Done',
    data: generateTasks('Done', 10),
  },
];

const statusColors = {
  backlog: '#94a3b8',
  todo: '#3b82f6',
  'in-progress': '#f59e0b',
  review: '#8b5cf6',
  done: '#22c55e',
};

export default function App() {
  return (
    <View style={styles.container}>
      <SectionFlow
        sections={sections}
        renderItem={({ item, section }) => (
          <View style={styles.item}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColors[section.key] },
              ]}
            />
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.header,
              { borderLeftColor: statusColors[section.key] },
            ]}
          >
            <Text style={styles.headerText}>{section.title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{section.data.length}</Text>
            </View>
          </View>
        )}
        stickySectionHeadersEnabled={true}
        stickyHeaderStyle={styles.stickyHeader}
        estimatedItemSize={72}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    backgroundColor: '#0f172a',
    borderLeftWidth: 3,
  },
  stickyHeader: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
```

## How It Works

### Enable Sticky Headers

```tsx
<SectionFlow
  stickySectionHeadersEnabled={true}
  // ...
/>
```

### Style the Sticky Header

Apply additional styles when the header is stuck:

```tsx
<SectionFlow
  stickySectionHeadersEnabled={true}
  stickyHeaderStyle={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }}
/>
```

### Dynamic Header Styling

Access the section in `renderSectionHeader` for dynamic styling:

```tsx
renderSectionHeader={({ section }) => (
  <View
    style={[
      styles.header,
      { borderLeftColor: getColorForSection(section.key) },
    ]}
  >
    <Text>{section.title}</Text>
  </View>
)}
```

## Best Practices

1. **Solid Background** - Always use a solid background color for sticky headers to prevent content showing through

2. **Shadow for Depth** - Add shadow/elevation to make it clear the header is floating

3. **Compact Height** - Keep sticky headers relatively short to maximize visible content

4. **High Contrast** - Ensure text is readable against the header background
