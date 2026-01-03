import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import type { LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import type {
  SectionFlowProps,
  SectionFlowRef,
  Section,
  FlattenedItem,
  LayoutRect,
  SectionLayoutInfo,
  ScrollToSectionOptions,
  ScrollToItemOptions,
  ViewToken,
} from '../types';
import {
  DEFAULT_ESTIMATED_ITEM_SIZE,
  DEFAULT_ESTIMATED_HEADER_SIZE,
  DEFAULT_DRAW_DISTANCE,
  DEFAULT_ITEM_TYPE,
  SECTION_HEADER_TYPE,
  SECTION_FOOTER_TYPE,
} from '../constants';
import { createLayoutCache } from '../core/LayoutCache';
import { createSectionLayoutManager } from '../core/SectionLayoutManager';
import { useScrollHandler } from '../hooks/useScrollHandler';
import { useRecycler } from '../hooks/useRecycler';
import { useStickyHeader } from '../hooks/useStickyHeader';
import { useViewability } from '../hooks/useViewability';
import { SectionFlowProvider } from '../state/SectionFlowContext';
import { RecyclerContainer } from './RecyclerContainer';
import { StickyHeaderContainer } from './StickyHeaderContainer';

/**
 * SectionFlow - High-performance section list for React Native
 *
 * A drop-in replacement for SectionList with FlashList-style cell recycling.
 * Provides smooth 60fps scrolling through:
 * - Cell recycling (reuses views instead of creating new ones)
 * - Synchronous measurements (New Architecture)
 * - Type-based recycle pools
 * - Absolute positioning with computed layouts
 */
function SectionFlowInner<TItem>(
  props: SectionFlowProps<TItem>,
  ref: React.ForwardedRef<SectionFlowRef<TItem>>
): React.ReactElement {
  const {
    sections,
    renderItem,
    renderSectionHeader,
    renderSectionFooter,
    keyExtractor,
    getItemType,
    estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE,
    estimatedSectionHeaderSize = DEFAULT_ESTIMATED_HEADER_SIZE,
    estimatedSectionFooterSize = 0,
    horizontal = false,
    stickySectionHeadersEnabled = true,
    collapsible = false,
    defaultCollapsed = [],
    onSectionToggle,
    maxItemsInRecyclePool,
    drawDistance = DEFAULT_DRAW_DISTANCE,
    viewabilityConfig,
    onViewableItemsChanged,
    onEndReached,
    onEndReachedThreshold,
    style,
    contentContainerStyle,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    refreshing,
    onRefresh,
    extraData,
    debug = false,
    ...scrollViewProps
  } = props;

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);

  // Layout state
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);

  // Collapsed sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(defaultCollapsed)
  );

  // Create layout cache (stable)
  const layoutCache = useMemo(() => createLayoutCache(), []);

  // Create section layout manager
  const layoutManager = useMemo(
    () =>
      createSectionLayoutManager(layoutCache, {
        horizontal,
        estimatedItemSize,
        estimatedHeaderSize: estimatedSectionHeaderSize,
        estimatedFooterSize: estimatedSectionFooterSize,
        hasSectionFooters: !!renderSectionFooter,
      }),
    [
      layoutCache,
      horizontal,
      estimatedItemSize,
      estimatedSectionHeaderSize,
      estimatedSectionFooterSize,
      renderSectionFooter,
    ]
  );

  // Flatten sections into renderable data
  const flattenedData = useMemo(
    () => layoutManager.updateData(sections as Section<unknown>[], collapsedSections) as FlattenedItem<TItem>[],
    [layoutManager, sections, collapsedSections, extraData]
  );

  // Update layout positioner container size
  useEffect(() => {
    layoutManager.getLayoutPositioner().setContainerSize(viewportSize.width, viewportSize.height);
  }, [layoutManager, viewportSize]);

  // Get item type for a flat index
  const getItemTypeForIndex = useCallback(
    (flatIndex: number): string => {
      const item = flattenedData[flatIndex];
      if (!item) return DEFAULT_ITEM_TYPE;

      if (item.type === 'section-header') return SECTION_HEADER_TYPE;
      if (item.type === 'section-footer') return SECTION_FOOTER_TYPE;

      if (getItemType && item.item !== null) {
        return getItemType(item.item as TItem, item.itemIndex, item.section);
      }

      return DEFAULT_ITEM_TYPE;
    },
    [flattenedData, getItemType]
  );

  // Scroll handler
  const { scrollState, onScroll, onScrollBeginDrag, onScrollEndDrag, onMomentumScrollBegin, onMomentumScrollEnd } =
    useScrollHandler({
      horizontal,
      onScrollStateChange: (state) => {
        setScrollOffset(state.offset);
      },
      onEndReached: onEndReached ? (distance) => onEndReached({ distanceFromEnd: distance }) : undefined,
      onEndReachedThreshold,
    });

  // Cell recycler
  const { getCell, releaseCell, updateVisibleRange, clearPools, getPoolStats } = useRecycler({
    flattenedData,
    getItemType: getItemType as ((item: unknown, index: number) => string) | undefined,
    maxPoolSize: maxItemsInRecyclePool,
  });

  // Calculate visible range
  const layoutPositioner = layoutManager.getLayoutPositioner();
  const viewportDimension = horizontal ? viewportSize.width : viewportSize.height;
  const visibleRange = useMemo(
    () => layoutPositioner.getVisibleRange(scrollOffset, viewportDimension, drawDistance),
    [layoutPositioner, scrollOffset, viewportDimension, drawDistance]
  );

  // Update recycler with visible range
  useEffect(() => {
    updateVisibleRange(visibleRange.startIndex, visibleRange.endIndex);
  }, [updateVisibleRange, visibleRange.startIndex, visibleRange.endIndex]);

  // Section layouts for sticky headers
  const sectionLayouts = useMemo(
    () => layoutManager.getAllSectionLayouts(),
    [layoutManager, flattenedData, scrollOffset]
  );

  // Sticky header state
  const stickyHeaderState = useStickyHeader({
    sectionLayouts,
    scrollOffset,
    viewportHeight: viewportDimension,
    horizontal,
    enabled: stickySectionHeadersEnabled,
  });

  // Viewability tracking
  const viewabilityResult = useViewability({
    flattenedData,
    layoutPositioner,
    scrollOffset,
    viewportSize: viewportDimension,
    horizontal,
    viewabilityConfig,
    onViewableItemsChanged,
  });

  // Handle cell layout measurement
  const handleCellLayout = useCallback(
    (key: string, flatIndex: number, layout: LayoutRect) => {
      layoutPositioner.updateItemLayout(flatIndex, layout);
    },
    [layoutPositioner]
  );

  // Handle viewport layout
  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewportSize({ width, height });
  }, []);

  // Handle section toggle
  const handleSectionToggle = useCallback(
    (sectionKey: string) => {
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        const isCollapsed = next.has(sectionKey);

        if (isCollapsed) {
          next.delete(sectionKey);
        } else {
          next.add(sectionKey);
        }

        onSectionToggle?.(sectionKey, !isCollapsed);
        return next;
      });
    },
    [onSectionToggle]
  );

  // Content size
  const contentSize = useMemo(() => layoutPositioner.getContentSize(), [layoutPositioner, flattenedData]);

  // Scroll methods
  const scrollToOffset = useCallback(
    (options: { offset: number; animated?: boolean }) => {
      scrollViewRef.current?.scrollTo({
        x: horizontal ? options.offset : 0,
        y: horizontal ? 0 : options.offset,
        animated: options.animated ?? true,
      });
    },
    [horizontal]
  );

  const scrollToSection = useCallback(
    (options: ScrollToSectionOptions) => {
      const { sectionKey, sectionIndex, animated = true, viewPosition = 0 } = options;

      let targetSection: SectionLayoutInfo | null = null;

      if (sectionKey) {
        targetSection = layoutManager.getSectionLayout(sectionKey);
      } else if (sectionIndex !== undefined) {
        const section = sections[sectionIndex];
        if (section) {
          targetSection = layoutManager.getSectionLayout(section.key);
        }
      }

      if (targetSection) {
        const headerOffset = horizontal
          ? targetSection.headerLayout.x
          : targetSection.headerLayout.y;

        scrollToOffset({ offset: headerOffset, animated });
      }
    },
    [layoutManager, sections, horizontal, scrollToOffset]
  );

  const scrollToItem = useCallback(
    (options: ScrollToItemOptions) => {
      const { sectionKey, sectionIndex, itemIndex, animated = true } = options;

      let targetSectionIndex = sectionIndex;
      if (sectionKey) {
        targetSectionIndex = sections.findIndex((s) => s.key === sectionKey);
      }

      if (targetSectionIndex === undefined || targetSectionIndex < 0) return;

      const flatIndex = layoutManager.getFlatIndex(targetSectionIndex, itemIndex);
      if (flatIndex < 0) return;

      const layout = layoutPositioner.getLayoutForIndex(flatIndex);
      const offset = horizontal ? layout.x : layout.y;

      scrollToOffset({ offset, animated });
    },
    [layoutManager, layoutPositioner, sections, horizontal, scrollToOffset]
  );

  const scrollToEnd = useCallback(
    (options?: { animated?: boolean }) => {
      const totalSize = horizontal ? contentSize.width : contentSize.height;
      const offset = Math.max(0, totalSize - viewportDimension);
      scrollToOffset({ offset, animated: options?.animated ?? true });
    },
    [contentSize, viewportDimension, horizontal, scrollToOffset]
  );

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      scrollToSection,
      scrollToItem,
      scrollToOffset,
      scrollToEnd,
      toggleSection: handleSectionToggle,
      getSectionLayouts: () => sectionLayouts,
      getVisibleItems: viewabilityResult.getVisibleItems,
      recordInteraction: viewabilityResult.recordInteraction,
      flashScrollIndicators: () => scrollViewRef.current?.flashScrollIndicators(),
    }),
    [
      scrollToSection,
      scrollToItem,
      scrollToOffset,
      scrollToEnd,
      handleSectionToggle,
      sectionLayouts,
      viewabilityResult,
    ]
  );

  // Empty state
  if (sections.length === 0 && ListEmptyComponent) {
    const EmptyComponent =
      typeof ListEmptyComponent === 'function' ? (
        <ListEmptyComponent />
      ) : (
        ListEmptyComponent
      );

    return (
      <View style={[styles.container, style]}>
        {EmptyComponent}
      </View>
    );
  }

  // Render header/footer components
  const HeaderComponent = ListHeaderComponent ? (
    typeof ListHeaderComponent === 'function' ? (
      <ListHeaderComponent />
    ) : (
      ListHeaderComponent
    )
  ) : null;

  const FooterComponent = ListFooterComponent ? (
    typeof ListFooterComponent === 'function' ? (
      <ListFooterComponent />
    ) : (
      ListFooterComponent
    )
  ) : null;

  return (
    <View style={[styles.container, style]} onLayout={handleViewportLayout}>
      <ScrollView
        ref={scrollViewRef}
        horizontal={horizontal}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={contentContainerStyle}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
          ) : undefined
        }
        {...scrollViewProps}
      >
        {HeaderComponent}

        <SectionFlowProvider
          sections={sections}
          flattenedData={flattenedData}
          layoutManager={layoutManager}
          layoutCache={layoutCache}
          horizontal={horizontal}
          collapsedSections={collapsedSections}
          scrollOffset={scrollOffset}
          viewportWidth={viewportSize.width}
          viewportHeight={viewportSize.height}
          stickySectionHeadersEnabled={stickySectionHeadersEnabled}
          estimatedItemSize={estimatedItemSize}
          drawDistance={drawDistance}
          debug={debug}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          renderSectionFooter={renderSectionFooter}
          onCellMeasured={handleCellLayout}
          onSectionToggle={collapsible ? handleSectionToggle : undefined}
          getItemType={getItemTypeForIndex}
        >
          <RecyclerContainer
            flattenedData={flattenedData}
            visibleRange={visibleRange}
            getLayoutForIndex={(index) => layoutPositioner.getLayoutForIndex(index)}
            getCell={getCell}
            contentSize={contentSize}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderSectionFooter}
            onCellLayout={handleCellLayout}
            horizontal={horizontal}
            debug={debug}
          />
        </SectionFlowProvider>

        {FooterComponent}
      </ScrollView>

      {/* Sticky header overlay */}
      {stickySectionHeadersEnabled && renderSectionHeader && stickyHeaderState.sectionKey && (
        <StickyHeaderContainer
          stickySection={sectionLayouts.find((s) => s.sectionKey === stickyHeaderState.sectionKey) ?? null}
          translateY={stickyHeaderState.translateY}
          sections={sections}
          renderSectionHeader={renderSectionHeader}
          horizontal={horizontal}
        />
      )}

      {/* Debug overlay */}
      {debug && (
        <View style={styles.debugOverlay} pointerEvents="none">
          {/* Debug info would go here */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

/**
 * Export with proper generic typing.
 * Usage: <SectionFlow<MyItemType> sections={...} renderItem={...} />
 */
export const SectionFlow = forwardRef(SectionFlowInner) as <TItem>(
  props: SectionFlowProps<TItem> & { ref?: React.ForwardedRef<SectionFlowRef<TItem>> }
) => React.ReactElement;

// Add display name for debugging
(SectionFlow as React.FC).displayName = 'SectionFlow';
