import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { ViewToken, ViewabilityConfig, FlattenedItem, LayoutPositioner } from '../types';
import { createViewabilityTracker, type ViewabilityTracker } from '../core/ViewabilityTracker';
import { DEFAULT_VIEWABILITY_CONFIG } from '../constants';

interface UseViewabilityOptions<TItem> {
  flattenedData: FlattenedItem<TItem>[];
  layoutPositioner: LayoutPositioner;
  scrollOffset: number;
  viewportSize: number;
  horizontal?: boolean;
  viewabilityConfig?: ViewabilityConfig;
  onViewableItemsChanged?: (info: {
    viewableItems: ViewToken<TItem>[];
    changed: ViewToken<TItem>[];
  }) => void;
}

interface ViewabilityResult<TItem> {
  visibleIndices: number[];
  firstVisibleIndex: number;
  lastVisibleIndex: number;
  getVisibleItems: () => ViewToken<TItem>[];
  recordInteraction: () => void;
}

/**
 * Hook for tracking item viewability and triggering callbacks.
 */
export function useViewability<TItem>(
  options: UseViewabilityOptions<TItem>
): ViewabilityResult<TItem> {
  const {
    flattenedData,
    layoutPositioner,
    scrollOffset,
    viewportSize,
    horizontal = false,
    viewabilityConfig = DEFAULT_VIEWABILITY_CONFIG,
    onViewableItemsChanged,
  } = options;

  // Create tracker instance
  const trackerRef = useRef<ViewabilityTracker<TItem> | null>(null);

  // Initialize tracker
  if (!trackerRef.current) {
    trackerRef.current = createViewabilityTracker(
      layoutPositioner,
      flattenedData,
      viewabilityConfig,
      horizontal
    );
  }

  const tracker = trackerRef.current;

  // Update tracker when data changes
  useEffect(() => {
    tracker.setData(flattenedData);
  }, [tracker, flattenedData]);

  // Update viewport size
  useEffect(() => {
    tracker.setViewportSize(viewportSize);
  }, [tracker, viewportSize]);

  // Update scroll offset
  useEffect(() => {
    tracker.updateScrollOffset(scrollOffset);
  }, [tracker, scrollOffset]);

  // Register callback
  useEffect(() => {
    if (!onViewableItemsChanged) return;

    const unsubscribe = tracker.onViewableItemsChanged(onViewableItemsChanged);
    return unsubscribe;
  }, [tracker, onViewableItemsChanged]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      tracker.dispose();
    };
  }, [tracker]);

  const recordInteraction = useCallback(() => {
    tracker.recordInteraction();
  }, [tracker]);

  const getVisibleItems = useCallback((): ViewToken<TItem>[] => {
    return tracker.getVisibleIndices().map((flatIndex) => {
      const item = flattenedData[flatIndex];
      return {
        item: item?.item ?? null,
        key: item?.key ?? `item-${flatIndex}`,
        index: flatIndex,
        isViewable: true,
        section: item?.section as any,
      };
    });
  }, [tracker, flattenedData]);

  // Compute visible indices
  const visibleState = useMemo(() => {
    const indices = tracker.getVisibleIndices();
    return {
      visibleIndices: indices,
      firstVisibleIndex: tracker.getFirstVisibleIndex(),
      lastVisibleIndex: tracker.getLastVisibleIndex(),
    };
  }, [tracker, scrollOffset, viewportSize]);

  return {
    ...visibleState,
    getVisibleItems,
    recordInteraction,
  };
}

/**
 * Hook for handling multiple viewability configs with different callbacks.
 */
export function useMultipleViewabilityConfigs<TItem>(
  flattenedData: FlattenedItem<TItem>[],
  layoutPositioner: LayoutPositioner,
  scrollOffset: number,
  viewportSize: number,
  configs: Array<{
    viewabilityConfig: ViewabilityConfig;
    onViewableItemsChanged: (info: {
      viewableItems: ViewToken<TItem>[];
      changed: ViewToken<TItem>[];
    }) => void;
  }>,
  horizontal = false
): void {
  const trackersRef = useRef<ViewabilityTracker<TItem>[]>([]);

  // Initialize trackers for each config
  useEffect(() => {
    trackersRef.current = configs.map((config) =>
      createViewabilityTracker(
        layoutPositioner,
        flattenedData,
        config.viewabilityConfig,
        horizontal
      )
    );

    // Register callbacks
    const unsubscribes = trackersRef.current.map((tracker, index) =>
      tracker.onViewableItemsChanged(configs[index].onViewableItemsChanged)
    );

    return () => {
      unsubscribes.forEach((unsub) => unsub());
      trackersRef.current.forEach((tracker) => tracker.dispose());
      trackersRef.current = [];
    };
  }, [configs, flattenedData, layoutPositioner, horizontal]);

  // Update data
  useEffect(() => {
    trackersRef.current.forEach((tracker) => tracker.setData(flattenedData));
  }, [flattenedData]);

  // Update viewport
  useEffect(() => {
    trackersRef.current.forEach((tracker) => tracker.setViewportSize(viewportSize));
  }, [viewportSize]);

  // Update scroll
  useEffect(() => {
    trackersRef.current.forEach((tracker) => tracker.updateScrollOffset(scrollOffset));
  }, [scrollOffset]);
}
