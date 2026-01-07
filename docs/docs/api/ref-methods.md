---
sidebar_position: 2
---

# Ref Methods

SectionFlow exposes several methods via ref for programmatic control.

## Usage

```tsx
import { useRef } from 'react';
import { SectionFlow } from 'sectionflow';
import type { SectionFlowRef } from 'sectionflow';

function MyComponent() {
  const ref = useRef<SectionFlowRef>(null);

  const scrollToTop = () => {
    ref.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <>
      <Button onPress={scrollToTop} title="Scroll to Top" />
      <SectionFlow
        ref={ref}
        sections={sections}
        renderItem={renderItem}
      />
    </>
  );
}
```

## Scroll Methods

### `scrollToSection`

```tsx
scrollToSection(sectionKey: string, animated?: boolean): void
```

Scrolls to the beginning of a section.

```tsx
// Scroll to section with animation
ref.current?.scrollToSection('in-progress', true);

// Scroll without animation
ref.current?.scrollToSection('completed', false);
```

### `scrollToItem`

```tsx
scrollToItem(params: {
  sectionKey: string;
  itemIndex: number;
  animated?: boolean;
  viewPosition?: number;
}): void
```

Scrolls to a specific item within a section.

```tsx
ref.current?.scrollToItem({
  sectionKey: 'tasks',
  itemIndex: 5,
  animated: true,
  viewPosition: 0.5, // Center the item
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `sectionKey` | `string` | Key of the section containing the item |
| `itemIndex` | `number` | Index of the item within the section |
| `animated` | `boolean` | Animate the scroll. Default: `true` |
| `viewPosition` | `number` | Position in viewport (0-1). 0 = top, 0.5 = center, 1 = bottom |

### `scrollToOffset`

```tsx
scrollToOffset(params: {
  offset: number;
  animated?: boolean;
}): void
```

Scrolls to a specific offset.

```tsx
// Scroll to top
ref.current?.scrollToOffset({ offset: 0, animated: true });

// Scroll to 500px from top
ref.current?.scrollToOffset({ offset: 500, animated: true });
```

### `scrollToEnd`

```tsx
scrollToEnd(params?: { animated?: boolean }): void
```

Scrolls to the end of the list.

```tsx
ref.current?.scrollToEnd({ animated: true });
```

## Section Control Methods

### `toggleSection`

```tsx
toggleSection(sectionKey: string): void
```

Toggles the collapsed state of a section. Requires `collapsible={true}`.

```tsx
// Toggle the 'archived' section
ref.current?.toggleSection('archived');
```

### `expandSection`

```tsx
expandSection(sectionKey: string): void
```

Expands a collapsed section.

```tsx
ref.current?.expandSection('tasks');
```

### `collapseSection`

```tsx
collapseSection(sectionKey: string): void
```

Collapses an expanded section.

```tsx
ref.current?.collapseSection('completed');
```

### `expandAllSections`

```tsx
expandAllSections(): void
```

Expands all sections.

```tsx
ref.current?.expandAllSections();
```

### `collapseAllSections`

```tsx
collapseAllSections(): void
```

Collapses all sections.

```tsx
ref.current?.collapseAllSections();
```

### `isSectionCollapsed`

```tsx
isSectionCollapsed(sectionKey: string): boolean
```

Returns whether a section is currently collapsed.

```tsx
const isCollapsed = ref.current?.isSectionCollapsed('archived');
console.log(isCollapsed); // true or false
```

## Layout Methods

### `getScrollOffset`

```tsx
getScrollOffset(): number
```

Returns the current scroll offset.

```tsx
const offset = ref.current?.getScrollOffset();
console.log(offset); // e.g., 250
```

### `getContentHeight`

```tsx
getContentHeight(): number
```

Returns the total content height.

```tsx
const height = ref.current?.getContentHeight();
console.log(height); // e.g., 5000
```

### `getVisibleItems`

```tsx
getVisibleItems(): Array<{
  sectionKey: string;
  itemIndex: number;
  item: T;
}>
```

Returns currently visible items.

```tsx
const visible = ref.current?.getVisibleItems();
console.log(visible);
// [
//   { sectionKey: 'tasks', itemIndex: 0, item: {...} },
//   { sectionKey: 'tasks', itemIndex: 1, item: {...} },
// ]
```

## Example: Chat UI with Auto-Scroll

```tsx
function ChatScreen() {
  const ref = useRef<SectionFlowRef>(null);
  const [messages, setMessages] = useState(initialMessages);

  const sendMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text }]);

    // Scroll to the new message
    setTimeout(() => {
      ref.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={{ flex: 1 }}>
      <SectionFlow
        ref={ref}
        sections={[{ key: 'messages', title: 'Chat', data: messages }]}
        renderItem={renderMessage}
        inverted={true}
      />
      <MessageInput onSend={sendMessage} />
    </View>
  );
}
```

## Example: Jump to Section Menu

```tsx
function SectionedList() {
  const ref = useRef<SectionFlowRef>(null);

  const jumpToSection = (key: string) => {
    ref.current?.scrollToSection(key, true);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.quickNav}>
        {sections.map(section => (
          <TouchableOpacity
            key={section.key}
            onPress={() => jumpToSection(section.key)}
          >
            <Text>{section.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <SectionFlow
        ref={ref}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
      />
    </View>
  );
}
```
