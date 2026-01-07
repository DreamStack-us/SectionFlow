# SectionFlow

High-performance, section-first list library for React Native. Drop-in replacement for SectionList with 10x better performance through cell recycling.

## Features

- **Cell Recycling**: 10x JS thread improvement over virtualization
- **Section-First**: Native section support without data flattening
- **Type-Safe**: Full TypeScript support with proper generics
- **Sticky Headers**: Section headers that stick during scroll
- **Collapsible Sections**: Built-in expand/collapse support

## Installation

```bash
npm install sectionflow
# or
bun add sectionflow
```

This package is an alias for `@dreamstack-us/section-flow` - both are identical.

## Usage

```tsx
import { SectionFlow } from 'sectionflow';

const sections = [
  { key: 'fruits', title: 'Fruits', data: ['Apple', 'Banana', 'Orange'] },
  { key: 'veggies', title: 'Vegetables', data: ['Carrot', 'Broccoli'] },
];

<SectionFlow
  sections={sections}
  renderItem={({ item }) => <Text>{item}</Text>}
  renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
  stickySectionHeadersEnabled
  collapsible
/>
```

## Documentation

Full documentation available at: https://dreamstack-us.github.io/SectionFlow/

## License

MIT © DreamStack
