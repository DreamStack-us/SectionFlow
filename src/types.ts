import type { ViewStyle, StyleProp, ScrollViewProps, LayoutChangeEvent } from 'react-native';

/**
 * Core Types
 */

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Section<TItem> {
  key: string;
  title?: string;
  data: TItem[];
}

/**
 * Flattened item types for internal processing
 */
export type FlattenedItemType = 'section-header' | 'item' | 'section-footer';

export interface FlattenedItem<TItem> {
  type: FlattenedItemType;
  key: string;
  sectionKey: string;
  sectionIndex: number;
  itemIndex: number; // -1 for headers/footers
  item: TItem | null; // null for headers/footers
  section: Section<TItem>;
}

/**
 * Render info passed to render functions
 */
export interface RenderItemInfo<TItem> {
  item: TItem;
  index: number;
  section: Section<TItem>;
  sectionIndex: number;
}

export interface RenderSectionHeaderInfo<TItem> {
  section: Section<TItem>;
  sectionIndex: number;
}

export interface RenderSectionFooterInfo<TItem> {
  section: Section<TItem>;
  sectionIndex: number;
}

/**
 * Viewability types
 */
export interface ViewToken<TItem> {
  item: TItem | null;
  key: string;
  index: number;
  isViewable: boolean;
  section: Section<TItem>;
}

export interface ViewabilityConfig {
  minimumViewTime?: number;
  viewAreaCoveragePercentThreshold?: number;
  itemVisiblePercentThreshold?: number;
  waitForInteraction?: boolean;
}

export interface ViewabilityConfigCallbackPair<TItem> {
  viewabilityConfig: ViewabilityConfig;
  onViewableItemsChanged: (info: {
    viewableItems: ViewToken<TItem>[];
    changed: ViewToken<TItem>[];
  }) => void;
}

/**
 * Cell recycling types
 */
export interface RecycledCell {
  key: string;
  itemType: string;
  flatIndex: number;
}

export interface RecyclePool {
  type: string;
  cells: RecycledCell[];
  maxSize: number;
}

/**
 * Section layout types
 */
export interface SectionLayoutInfo {
  sectionKey: string;
  sectionIndex: number;
  headerLayout: LayoutRect;
  footerLayout: LayoutRect | null;
  itemsStartOffset: number;
  itemsEndOffset: number;
  itemCount: number;
  isCollapsed: boolean;
}

/**
 * Scroll types
 */
export interface ScrollToSectionOptions {
  sectionKey?: string;
  sectionIndex?: number;
  animated?: boolean;
  viewPosition?: number; // 0 = top, 0.5 = center, 1 = bottom
}

export interface ScrollToItemOptions {
  sectionKey?: string;
  sectionIndex?: number;
  itemIndex: number;
  animated?: boolean;
  viewPosition?: number;
}

/**
 * Main component props
 */
export interface SectionFlowProps<TItem> extends Omit<ScrollViewProps, 'children'> {
  // Data
  sections: Section<TItem>[];

  // Render functions
  renderItem: (info: RenderItemInfo<TItem>) => React.ReactElement | null;
  renderSectionHeader?: (info: RenderSectionHeaderInfo<TItem>) => React.ReactElement | null;
  renderSectionFooter?: (info: RenderSectionFooterInfo<TItem>) => React.ReactElement | null;

  // Keys and types
  keyExtractor?: (item: TItem, index: number) => string;
  getItemType?: (item: TItem, index: number, section: Section<TItem>) => string;

  // Layout
  estimatedItemSize?: number;
  estimatedSectionHeaderSize?: number;
  estimatedSectionFooterSize?: number;
  horizontal?: boolean;

  // Sticky headers
  stickySectionHeadersEnabled?: boolean;

  // Collapsibility (Phase 2)
  collapsible?: boolean;
  defaultCollapsed?: string[];
  onSectionToggle?: (sectionKey: string, collapsed: boolean) => void;

  // Performance
  maxItemsInRecyclePool?: number;
  drawDistance?: number; // Overscan in pixels

  // Viewability
  viewabilityConfig?: ViewabilityConfig;
  onViewableItemsChanged?: (info: {
    viewableItems: ViewToken<TItem>[];
    changed: ViewToken<TItem>[];
  }) => void;
  viewabilityConfigCallbackPairs?: ViewabilityConfigCallbackPair<TItem>[];

  // Callbacks
  onEndReached?: (info: { distanceFromEnd: number }) => void;
  onEndReachedThreshold?: number;
  onScrollBeginDrag?: ScrollViewProps['onScrollBeginDrag'];
  onScrollEndDrag?: ScrollViewProps['onScrollEndDrag'];
  onMomentumScrollBegin?: ScrollViewProps['onMomentumScrollBegin'];
  onMomentumScrollEnd?: ScrollViewProps['onMomentumScrollEnd'];

  // Styling
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<{ section: Section<TItem>; leadingItem: TItem; }> | null;
  SectionSeparatorComponent?: React.ComponentType<{ section: Section<TItem>; leadingSection: Section<TItem> | null; trailingSection: Section<TItem> | null; }> | null;

  // Refresh
  refreshing?: boolean;
  onRefresh?: () => void;

  // Extra data for re-render trigger
  extraData?: unknown;

  // Debug
  debug?: boolean;
}

/**
 * Ref methods
 */
export interface SectionFlowRef<TItem = unknown> {
  scrollToSection: (options: ScrollToSectionOptions) => void;
  scrollToItem: (options: ScrollToItemOptions) => void;
  scrollToOffset: (options: { offset: number; animated?: boolean }) => void;
  scrollToEnd: (options?: { animated?: boolean }) => void;
  toggleSection: (sectionKey: string) => void;
  getSectionLayouts: () => SectionLayoutInfo[];
  getVisibleItems: () => ViewToken<TItem>[];
  recordInteraction: () => void;
  flashScrollIndicators: () => void;
}

/**
 * Internal context types
 */
export interface SectionFlowContextValue<TItem> {
  sections: Section<TItem>[];
  flattenedData: FlattenedItem<TItem>[];
  layoutCache: Map<string, LayoutRect>;
  collapsedSections: Set<string>;
  scrollOffset: number;
  viewportHeight: number;
  viewportWidth: number;
  horizontal: boolean;
  stickySectionHeadersEnabled: boolean;
  estimatedItemSize: number;
  drawDistance: number;
  debug: boolean;
}

/**
 * Layout positioner interface (for future layout strategies)
 */
export interface LayoutPositioner {
  getLayoutForIndex(index: number): LayoutRect;
  getContentSize(): { width: number; height: number };
  getVisibleRange(
    scrollOffset: number,
    viewportSize: number,
    overscan: number
  ): { startIndex: number; endIndex: number };
  updateItemLayout(index: number, layout: LayoutRect): void;
  invalidateFrom(index: number): void;
  getIndexForOffset(offset: number): number;
  getTotalItemCount(): number;
}

/**
 * Cell recycler interface
 */
export interface CellRecyclerInterface {
  acquireCell(type: string, flatIndex: number): RecycledCell | null;
  releaseCell(cell: RecycledCell): void;
  clearPools(): void;
  setMaxPoolSize(type: string, size: number): void;
  getPoolStats(): Map<string, { available: number; inUse: number }>;
}

/**
 * Viewability tracker interface
 */
export interface ViewabilityTrackerInterface<TItem> {
  updateScrollOffset(offset: number): void;
  getVisibleIndices(): number[];
  isIndexVisible(index: number): boolean;
  getFirstVisibleIndex(): number;
  getLastVisibleIndex(): number;
  onViewableItemsChanged(
    callback: (info: { viewableItems: ViewToken<TItem>[]; changed: ViewToken<TItem>[] }) => void
  ): () => void;
}

/**
 * Measurement callback type
 */
export type OnLayoutCallback = (event: LayoutChangeEvent) => void;
