---
sidebar_position: 1
slug: /
---

# Introduction

**SectionFlow** is a high-performance section list component for React Native with cell recycling, sticky headers, and collapsible sections.

## Why SectionFlow?

React Native's built-in `SectionList` re-renders the entire list when data changes, leading to performance issues with large datasets. SectionFlow solves this by:

- **Cell Recycling** - Reuses rendered cells for off-screen items (like FlashList)
- **Absolute Positioning** - All cells positioned absolutely for smooth 60fps scrolling
- **Type-based Pools** - Cells recycled by type for optimal memory usage
- **Sticky Headers** - Section headers stick to top during scroll
- **Collapsible Sections** - Expand/collapse sections with a single API call

## Performance Comparison

| Feature | SectionList | FlashList | SectionFlow |
|---------|-------------|-----------|-------------|
| Cell Recycling | No | Yes | Yes |
| Section Headers | Yes | No | Yes |
| Sticky Headers | Yes | No | Yes |
| Collapsible Sections | No | No | Yes |
| Memory Efficient | No | Yes | Yes |

## Quick Example

```tsx
import { SectionFlow } from 'sectionflow';

const sections = [
  { key: 'fruits', title: 'Fruits', data: ['Apple', 'Banana', 'Orange'] },
  { key: 'veggies', title: 'Vegetables', data: ['Carrot', 'Broccoli', 'Spinach'] },
];

function MyList() {
  return (
    <SectionFlow
      sections={sections}
      renderItem={({ item }) => <Text>{item}</Text>}
      renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
      stickySectionHeadersEnabled
      collapsible
    />
  );
}
```

## Installation

```bash
# npm
npm install sectionflow

# yarn
yarn add sectionflow

# bun
bun add sectionflow
```

## Next Steps

- [Getting Started](/docs/getting-started) - Full setup guide
- [API Reference](/docs/api/props) - All props and methods
- [Examples](/docs/examples/basic-list) - Live interactive examples
