---
sidebar_position: 4
---

# Chat UI

Build a chat interface with inverted scrolling where new messages appear at the bottom.

## Live Example

```SnackPlayer name=Chat%20UI&dependencies=@dreamstack-us/section-flow,react-native-gesture-handler,react-native-reanimated
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SectionFlow } from '@dreamstack-us/section-flow';

const initialMessages = [
  {
    key: 'today',
    title: 'Today',
    data: [
      { id: '1', text: 'Hey! How are you?', sender: 'them', time: '9:00 AM' },
      { id: '2', text: "I'm good! Working on the new feature.", sender: 'me', time: '9:02 AM' },
      { id: '3', text: 'Nice! How is it going?', sender: 'them', time: '9:05 AM' },
      { id: '4', text: 'Pretty well! Should be done by EOD.', sender: 'me', time: '9:10 AM' },
    ],
  },
  {
    key: 'yesterday',
    title: 'Yesterday',
    data: [
      { id: '5', text: 'Did you see the game last night?', sender: 'them', time: '8:30 PM' },
      { id: '6', text: 'Yes! What a finish!', sender: 'me', time: '8:45 PM' },
    ],
  },
];

export default function App() {
  const ref = useRef(null);
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => {
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        data: [...updated[0].data, newMessage],
      };
      return updated;
    });

    setInputText('');

    // Scroll to the new message
    setTimeout(() => {
      ref.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SectionFlow
        ref={ref}
        sections={messages}
        inverted={true}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'me' ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === 'me' ? styles.myText : styles.theirText,
              ]}
            >
              {item.text}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        estimatedItemSize={60}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: '#ffffff',
  },
  theirText: {
    color: '#1f2937',
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1f2937',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
```

## Key Features

### Inverted List

The `inverted` prop flips the scroll direction so newest content appears at the bottom:

```tsx
<SectionFlow
  inverted={true}
  // ...
/>
```

### Auto-Scroll to New Messages

Use the ref to scroll when new messages arrive:

```tsx
const ref = useRef<SectionFlowRef>(null);

const sendMessage = () => {
  // Add message to state...

  setTimeout(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, 100);
};
```

### Keyboard Handling

Wrap with `KeyboardAvoidingView` for proper keyboard handling:

```tsx
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
  <SectionFlow ... />
  <TextInput ... />
</KeyboardAvoidingView>
```

### Date Separators

Use section headers as date separators:

```tsx
const messages = [
  { key: 'today', title: 'Today', data: [...] },
  { key: 'yesterday', title: 'Yesterday', data: [...] },
];
```

## Performance Tips

1. **Estimated Item Size** - Set based on average message height
2. **Memoize Components** - Wrap message bubbles in `React.memo`
3. **Batch Updates** - When loading history, update state once
