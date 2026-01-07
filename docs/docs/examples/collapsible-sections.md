---
sidebar_position: 3
---

# Collapsible Sections

Allow users to expand and collapse sections to focus on what matters.

## Live Example

```SnackPlayer name=Collapsible%20Sections&dependencies=@dreamstack-us/section-flow,react-native-gesture-handler,react-native-reanimated
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SectionFlow } from '@dreamstack-us/section-flow';

const sections = [
  {
    key: 'today',
    title: 'Today',
    data: [
      { id: '1', title: 'Morning standup', time: '9:00 AM' },
      { id: '2', title: 'Design review', time: '11:00 AM' },
      { id: '3', title: 'Lunch with team', time: '12:30 PM' },
    ],
  },
  {
    key: 'tomorrow',
    title: 'Tomorrow',
    data: [
      { id: '4', title: 'Sprint planning', time: '10:00 AM' },
      { id: '5', title: 'Client call', time: '2:00 PM' },
    ],
  },
  {
    key: 'this-week',
    title: 'This Week',
    data: [
      { id: '6', title: 'Team retrospective', time: 'Wednesday' },
      { id: '7', title: 'Release v2.0', time: 'Friday' },
      { id: '8', title: 'Demo day', time: 'Friday' },
    ],
  },
  {
    key: 'next-week',
    title: 'Next Week',
    data: [
      { id: '9', title: 'Quarterly review', time: 'Monday' },
      { id: '10', title: 'Training session', time: 'Tuesday' },
    ],
  },
];

export default function App() {
  const ref = useRef(null);

  const handleHeaderPress = (sectionKey) => {
    ref.current?.toggleSection(sectionKey);
  };

  const expandAll = () => ref.current?.expandAllSections();
  const collapseAll = () => ref.current?.collapseAllSections();

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={expandAll} style={styles.toolbarButton}>
          <Text style={styles.toolbarText}>Expand All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={collapseAll} style={styles.toolbarButton}>
          <Text style={styles.toolbarText}>Collapse All</Text>
        </TouchableOpacity>
      </View>

      <SectionFlow
        ref={ref}
        sections={sections}
        collapsible={true}
        initialCollapsedSections={['next-week']}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.checkbox} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
            <Text style={styles.itemTime}>{item.time}</Text>
          </View>
        )}
        renderSectionHeader={({ section, isCollapsed }) => (
          <TouchableOpacity
            style={styles.header}
            onPress={() => handleHeaderPress(section.key)}
            activeOpacity={0.7}
          >
            <View style={styles.headerLeft}>
              <Text style={styles.chevron}>{isCollapsed ? '▸' : '▾'}</Text>
              <Text style={styles.headerText}>{section.title}</Text>
            </View>
            <Text style={styles.headerCount}>{section.data.length}</Text>
          </TouchableOpacity>
        )}
        onSectionCollapse={(key, collapsed) => {
          console.log(`Section ${key} is now ${collapsed ? 'collapsed' : 'expanded'}`);
        }}
        estimatedItemSize={56}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  toolbarText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    color: '#1f2937',
  },
  itemTime: {
    fontSize: 13,
    color: '#9ca3af',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
    width: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  headerCount: {
    fontSize: 13,
    color: '#9ca3af',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
```

## How It Works

### Enable Collapsible Sections

```tsx
<SectionFlow
  collapsible={true}
  // ...
/>
```

### Initial Collapsed State

Specify which sections start collapsed:

```tsx
<SectionFlow
  collapsible={true}
  initialCollapsedSections={['archived', 'completed']}
/>
```

### Toggle Programmatically

Use the ref to control sections:

```tsx
const ref = useRef<SectionFlowRef>(null);

// Toggle a single section
ref.current?.toggleSection('today');

// Expand a specific section
ref.current?.expandSection('urgent');

// Collapse a specific section
ref.current?.collapseSection('archived');

// Expand/collapse all
ref.current?.expandAllSections();
ref.current?.collapseAllSections();
```

### Handle Header Press

Make headers tappable to toggle:

```tsx
renderSectionHeader={({ section, isCollapsed }) => (
  <TouchableOpacity
    onPress={() => ref.current?.toggleSection(section.key)}
  >
    <Text>{isCollapsed ? '▸' : '▾'} {section.title}</Text>
  </TouchableOpacity>
)}
```

### Listen for Changes

Track collapse state changes:

```tsx
<SectionFlow
  collapsible={true}
  onSectionCollapse={(sectionKey, isCollapsed) => {
    // Save preference, analytics, etc.
    console.log(`${sectionKey}: ${isCollapsed}`);
  }}
/>
```

## Animated Collapse

The collapse animation is handled automatically. Items smoothly animate in/out when sections toggle.
