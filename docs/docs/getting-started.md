---
sidebar_position: 2
---

# Getting Started

This guide will help you install and configure SectionFlow in your React Native project.

## Prerequisites

- React Native 0.70 or higher
- React 18 or higher

## Installation

Install SectionFlow using your preferred package manager:

```bash
# npm
npm install sectionflow

# yarn
yarn add sectionflow

# bun
bun add sectionflow
```

### Alternative Package Name

SectionFlow is also available as `@dreamstack-us/section-flow`:

```bash
npm install @dreamstack-us/section-flow
```

Both packages are identical - use whichever you prefer.

## Basic Usage

```tsx
import { SectionFlow } from 'sectionflow';
import type { Section, RenderItemInfo, RenderSectionHeaderInfo } from 'sectionflow';
import { View, Text, StyleSheet } from 'react-native';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const sections: Section<Task>[] = [
  {
    key: 'todo',
    title: 'To Do',
    data: [
      { id: '1', title: 'Buy groceries', completed: false },
      { id: '2', title: 'Walk the dog', completed: false },
    ],
  },
  {
    key: 'done',
    title: 'Completed',
    data: [
      { id: '3', title: 'Clean room', completed: true },
    ],
  },
];

function TaskList() {
  const renderItem = ({ item }: RenderItemInfo<Task>) => (
    <View style={styles.item}>
      <Text style={item.completed ? styles.completed : undefined}>
        {item.title}
      </Text>
    </View>
  );

  const renderSectionHeader = ({ section }: RenderSectionHeaderInfo<Task>) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>{section.title}</Text>
    </View>
  );

  return (
    <SectionFlow<Task>
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={true}
      estimatedItemSize={60}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  header: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
```

## TypeScript Support

SectionFlow is written in TypeScript and provides full type safety:

```tsx
import type {
  Section,
  RenderItemInfo,
  RenderSectionHeaderInfo,
  SectionFlowRef
} from 'sectionflow';

// Define your item type
interface MyItem {
  id: string;
  name: string;
}

// Sections are typed
const sections: Section<MyItem>[] = [...];

// Render functions receive typed info
const renderItem = ({ item, index, section }: RenderItemInfo<MyItem>) => {
  // item is typed as MyItem
  return <Text>{item.name}</Text>;
};

// Ref methods are typed
const ref = useRef<SectionFlowRef>(null);
ref.current?.scrollToSection('my-section');
```

## Key Features

### Sticky Section Headers

Enable sticky headers that stay at the top while scrolling:

```tsx
<SectionFlow
  sections={sections}
  renderItem={renderItem}
  renderSectionHeader={renderSectionHeader}
  stickySectionHeadersEnabled={true}
  stickyHeaderStyle={{ backgroundColor: '#1e293b' }}
/>
```

### Collapsible Sections

Allow users to collapse/expand sections:

```tsx
const ref = useRef<SectionFlowRef>(null);

<SectionFlow
  ref={ref}
  sections={sections}
  renderItem={renderItem}
  renderSectionHeader={renderSectionHeader}
  collapsible={true}
/>

// Toggle a section programmatically
ref.current?.toggleSection('my-section-key');
```

### Performance Optimization

For best performance, provide an estimated item size:

```tsx
<SectionFlow
  sections={sections}
  renderItem={renderItem}
  estimatedItemSize={100} // Average height of your items
/>
```

## Next Steps

- [Props Reference](/docs/api/props) - All available props
- [Ref Methods](/docs/api/ref-methods) - Programmatic control
- [Examples](/docs/examples/basic-list) - Live code examples
