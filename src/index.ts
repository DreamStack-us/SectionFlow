/**
 * SectionFlow - High-performance section list for React Native
 *
 * A drop-in replacement for SectionList with FlashList-style cell recycling.
 * Designed for React Native 0.76+ with the New Architecture.
 *
 * @packageDocumentation
 */

// Main component
export { SectionFlow } from './components/SectionFlow';

// Types
export type {
  // Core types
  Section,
  LayoutRect,
  FlattenedItem,
  FlattenedItemType,

  // Props and refs
  SectionFlowProps,
  SectionFlowRef,

  // Render info
  RenderItemInfo,
  RenderSectionHeaderInfo,
  RenderSectionFooterInfo,

  // Scroll options
  ScrollToSectionOptions,
  ScrollToItemOptions,

  // Viewability
  ViewToken,
  ViewabilityConfig,
  ViewabilityConfigCallbackPair,

  // Layout
  SectionLayoutInfo,

  // Recycling
  RecycledCell,
  RecyclePool,

  // Interfaces (for advanced usage)
  LayoutPositioner,
  CellRecyclerInterface,
  ViewabilityTrackerInterface,
} from './types';

// Utility components (for custom implementations)
export { RecyclerCell } from './components/RecyclerCell';
export { RecyclerContainer } from './components/RecyclerContainer';
export { SectionHeader } from './components/SectionHeader';
export { StickyHeaderContainer, AnimatedStickyHeaderContainer } from './components/StickyHeaderContainer';

// Hooks (for advanced usage)
export { useLayoutMeasurement, useCellMeasurement, useProgressiveRender } from './hooks/useLayoutMeasurement';
export { useScrollHandler, useAdaptiveDrawDistance } from './hooks/useScrollHandler';
export { useRecycler, useItemTypeResolver } from './hooks/useRecycler';
export { useStickyHeader, useMultipleStickyHeaders, useStickyHeaderOpacity } from './hooks/useStickyHeader';
export { useViewability, useMultipleViewabilityConfigs } from './hooks/useViewability';

// Core utilities (for custom implementations)
export { createLayoutCache, type LayoutCache } from './core/LayoutCache';
export { createLayoutPositioner, LinearLayoutPositioner } from './core/LinearLayoutPositioner';
export { createCellRecycler } from './core/CellRecycler';
export { createViewabilityTracker, type ViewabilityTracker } from './core/ViewabilityTracker';
export { createSectionLayoutManager, type SectionLayoutManager } from './core/SectionLayoutManager';

// Utility functions
export { flattenSections, getFlatIndex, getSectionItemFromFlatIndex } from './utils/flattenSections';
export { defaultKeyExtractor, createKeyExtractor, createCompositeKeyExtractor, validateUniqueKeys } from './utils/keyExtractor';
export { binarySearch, binarySearchInsertPosition } from './utils/binarySearch';

// Constants
export {
  DEFAULT_ESTIMATED_ITEM_SIZE,
  DEFAULT_ESTIMATED_HEADER_SIZE,
  DEFAULT_DRAW_DISTANCE,
  DEFAULT_MAX_POOL_SIZE,
  DEFAULT_ITEM_TYPE,
  SECTION_HEADER_TYPE,
  SECTION_FOOTER_TYPE,
} from './constants';

// Context (for custom wrappers)
export { SectionFlowProvider, useSectionFlowContext } from './state/SectionFlowContext';
