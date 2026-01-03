import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import type { Section } from '../types';

interface SectionHeaderProps<TItem> {
  section: Section<TItem>;
  sectionIndex: number;
  isCollapsed?: boolean;
  collapsible?: boolean;
  onToggle?: (sectionKey: string) => void;
  renderContent?: (info: {
    section: Section<TItem>;
    sectionIndex: number;
    isCollapsed: boolean;
  }) => React.ReactElement | null;
  style?: ViewStyle;
}

/**
 * Default section header component.
 * Can be overridden by providing renderSectionHeader prop to SectionFlow.
 */
function SectionHeaderComponent<TItem>({
  section,
  sectionIndex,
  isCollapsed = false,
  collapsible = false,
  onToggle,
  renderContent,
  style,
}: SectionHeaderProps<TItem>): React.ReactElement {
  const handlePress = useCallback(() => {
    if (collapsible && onToggle) {
      onToggle(section.key);
    }
  }, [collapsible, onToggle, section.key]);

  // If custom render function provided, use it
  if (renderContent) {
    const content = renderContent({ section, sectionIndex, isCollapsed });
    if (content) {
      if (collapsible) {
        return (
          <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            {content}
          </TouchableOpacity>
        );
      }
      return <View>{content}</View>;
    }
  }

  // Default header UI
  const Wrapper = collapsible ? TouchableOpacity : View;
  const wrapperProps = collapsible
    ? { onPress: handlePress, activeOpacity: 0.7 }
    : {};

  return (
    <Wrapper {...wrapperProps} style={[styles.container, style]}>
      <Text style={styles.title}>{section.title ?? section.key}</Text>
      {collapsible && (
        <Text style={styles.indicator}>{isCollapsed ? '▸' : '▾'}</Text>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  indicator: {
    fontSize: 14,
    color: '#666',
  },
});

export const SectionHeader = memo(SectionHeaderComponent) as typeof SectionHeaderComponent;
