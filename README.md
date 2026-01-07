# SectionFlow

High-performance, section-first list library for React Native. Drop-in replacement for SectionList with 10x better performance through cell recycling.

> **Development Status**: This library is in active development and not yet ready for production use.

## Features

- **Cell Recycling**: 10x JS thread improvement over virtualization
- **Section-First**: Native section support without data flattening
- **Type-Safe**: Full TypeScript support with proper generics
- **Sticky Headers**: Headers that actually work
- **Collapsible Sections**: Built-in, no external state needed

## Installation

```bash
npm install @dreamstack-us/section-flow
# or
bun add @dreamstack-us/section-flow
```

## Usage

```tsx
import { SectionFlow } from '@dreamstack-us/section-flow';

const sections = [
  { key: 'a', title: 'A', data: ['Alice', 'Adam'] },
  { key: 'b', title: 'B', data: ['Bob', 'Beth'] },
];

<SectionFlow
  sections={sections}
  renderItem={({ item }) => <Text>{item}</Text>}
  renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
  stickyHeaders
  collapsible
/>
```

## License

MIT © DreamStack
