# SectionFlow

High-performance, section-first list library for React Native. Drop-in replacement for SectionList with 10x better performance through cell recycling.

## Installation

```bash
npm install sectionflow
# or
bun add sectionflow
```

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
