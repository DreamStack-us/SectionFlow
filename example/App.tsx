import React, { useRef, useCallback, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SectionFlow, type Section, type SectionFlowRef, type RenderItemInfo, type RenderSectionHeaderInfo } from '@dreamstack/section-flow';

// Sample data types
interface Contact {
  id: string;
  name: string;
  phone: string;
}

// Generate sample contact data
const generateContacts = (): Section<Contact>[] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  return alphabet.map((letter) => {
    const contacts: Contact[] = [];
    const count = Math.floor(Math.random() * 8) + 2; // 2-10 contacts per section

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames.find((ln) => ln.startsWith(letter)) || lastNames[Math.floor(Math.random() * lastNames.length)];
      contacts.push({
        id: `${letter}-${i}`,
        name: `${firstName} ${lastName.charAt(0) === letter ? lastName : letter + lastName.slice(1)}`,
        phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      });
    }

    // Sort contacts alphabetically
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    return {
      key: letter,
      title: letter,
      data: contacts,
    };
  }).filter((section) => section.data.length > 0);
};

export default function App(): React.ReactElement {
  const listRef = useRef<SectionFlowRef<Contact>>(null);
  const [sections] = useState(() => generateContacts());
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Render each contact item
  const renderItem = useCallback(
    ({ item, index, section }: RenderItemInfo<Contact>) => (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={() => setSelectedContact(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPhone}>{item.phone}</Text>
        </View>
      </Pressable>
    ),
    []
  );

  // Render section headers
  const renderSectionHeader = useCallback(
    ({ section }: RenderSectionHeaderInfo<Contact>) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        <Text style={styles.sectionCount}>{section.data.length}</Text>
      </View>
    ),
    []
  );

  // Scroll to section on letter tap
  const handleLetterPress = useCallback((letter: string) => {
    listRef.current?.scrollToSection({ sectionKey: letter, animated: true });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <Text style={styles.headerSubtitle}>SectionFlow Demo</Text>
      </View>

      {/* Contact List */}
      <View style={styles.listContainer}>
        <SectionFlow<Contact>
          ref={listRef}
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          estimatedItemSize={72}
          estimatedSectionHeaderSize={32}
          keyExtractor={(item) => item.id}
        />

        {/* Alphabet Index */}
        <View style={styles.alphabetIndex}>
          {sections.map((section) => (
            <Pressable
              key={section.key}
              onPress={() => handleLetterPress(section.key)}
              hitSlop={8}
            >
              <Text style={styles.alphabetLetter}>{section.key}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Selected Contact Modal */}
      {selectedContact && (
        <Pressable style={styles.modal} onPress={() => setSelectedContact(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalAvatar}>
              <Text style={styles.modalAvatarText}>{selectedContact.name.charAt(0)}</Text>
            </View>
            <Text style={styles.modalName}>{selectedContact.name}</Text>
            <Text style={styles.modalPhone}>{selectedContact.phone}</Text>
            <Text style={styles.modalHint}>Tap anywhere to close</Text>
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sectionCount: {
    fontSize: 12,
    color: '#999',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  itemPressed: {
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  itemPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  alphabetIndex: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alphabetLetter: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalAvatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  modalName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalPhone: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  modalHint: {
    fontSize: 14,
    color: '#999',
  },
});
