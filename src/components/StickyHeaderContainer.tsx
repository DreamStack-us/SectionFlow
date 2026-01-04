import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { Section, SectionLayoutInfo, RenderSectionHeaderInfo } from '../types';

interface StickyHeaderContainerProps<TItem> {
  stickySection: SectionLayoutInfo | null;
  translateY: number;
  sections: Section<TItem>[];
  renderSectionHeader: (info: RenderSectionHeaderInfo<TItem>) => React.ReactElement | null;
  horizontal?: boolean;
  style?: ViewStyle;
}

/**
 * Container for the sticky section header.
 * Positioned at the top (or left for horizontal) of the viewport.
 * Handles the "push" effect when the next section approaches.
 */
function StickyHeaderContainerComponent<TItem>({
  stickySection,
  translateY,
  sections,
  renderSectionHeader,
  horizontal = false,
  style,
}: StickyHeaderContainerProps<TItem>): React.ReactElement | null {
  if (!stickySection) {
    return null;
  }

  const section = sections.find((s) => s.key === stickySection.sectionKey);
  if (!section) {
    return null;
  }

  const headerContent = renderSectionHeader({
    section,
    sectionIndex: stickySection.sectionIndex,
  });

  if (!headerContent) {
    return null;
  }

  const containerStyle: ViewStyle = useMemo(
    () => ({
      position: 'absolute',
      top: horizontal ? undefined : 0,
      left: horizontal ? 0 : 0,
      right: horizontal ? undefined : 0,
      transform: horizontal
        ? [{ translateX: translateY }]
        : [{ translateY }],
      zIndex: 1000,
      elevation: 4, // Android shadow
    }),
    [horizontal, translateY]
  );

  return (
    <View style={[containerStyle, styles.shadow, style]} pointerEvents="box-none">
      {headerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Note: backgroundColor is needed for shadow to be visible on iOS
    // Users should set backgroundColor via stickyHeaderStyle prop or in their renderSectionHeader
  },
});

export const StickyHeaderContainer = memo(
  StickyHeaderContainerComponent
) as typeof StickyHeaderContainerComponent;

/**
 * Animated version of sticky header for smoother transitions.
 * Uses Animated API for better performance on the native thread.
 */
interface AnimatedStickyHeaderProps<TItem> extends StickyHeaderContainerProps<TItem> {
  animatedTranslateY: Animated.Value;
}

function AnimatedStickyHeaderContainerComponent<TItem>({
  stickySection,
  animatedTranslateY,
  sections,
  renderSectionHeader,
  horizontal = false,
  style,
}: AnimatedStickyHeaderProps<TItem>): React.ReactElement | null {
  if (!stickySection) {
    return null;
  }

  const section = sections.find((s) => s.key === stickySection.sectionKey);
  if (!section) {
    return null;
  }

  const headerContent = renderSectionHeader({
    section,
    sectionIndex: stickySection.sectionIndex,
  });

  if (!headerContent) {
    return null;
  }

  const animatedStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      top: horizontal ? undefined : 0,
      left: 0,
      right: horizontal ? undefined : 0,
      transform: horizontal
        ? [{ translateX: animatedTranslateY }]
        : [{ translateY: animatedTranslateY }],
      zIndex: 1000,
      elevation: 4,
    }),
    [horizontal, animatedTranslateY]
  );

  return (
    <Animated.View style={[animatedStyle, styles.shadow, style]} pointerEvents="box-none">
      {headerContent}
    </Animated.View>
  );
}

export const AnimatedStickyHeaderContainer = memo(
  AnimatedStickyHeaderContainerComponent
) as typeof AnimatedStickyHeaderContainerComponent;
