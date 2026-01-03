import type {
  ViewToken,
  ViewabilityConfig,
  FlattenedItem,
  LayoutPositioner,
} from '../types';
import { DEFAULT_VIEWABILITY_CONFIG } from '../constants';

/**
 * ViewabilityTracker monitors which items are currently visible in the viewport
 * and triggers callbacks when viewability changes.
 */
export interface ViewabilityTracker<TItem> {
  updateScrollOffset(offset: number): void;
  setViewportSize(size: number): void;
  setData(flattenedData: FlattenedItem<TItem>[]): void;
  getVisibleIndices(): number[];
  isIndexVisible(index: number): boolean;
  getFirstVisibleIndex(): number;
  getLastVisibleIndex(): number;
  onViewableItemsChanged(
    callback: (info: { viewableItems: ViewToken<TItem>[]; changed: ViewToken<TItem>[] }) => void
  ): () => void;
  recordInteraction(): void;
  dispose(): void;
}

interface TrackedItem {
  flatIndex: number;
  isViewable: boolean;
  lastVisibleTime: number;
  becameVisibleAt: number | null;
}

class ViewabilityTrackerImpl<TItem> implements ViewabilityTracker<TItem> {
  private config: Required<ViewabilityConfig>;
  private layoutPositioner: LayoutPositioner;
  private flattenedData: FlattenedItem<TItem>[] = [];
  private horizontal: boolean;

  private scrollOffset = 0;
  private viewportSize = 0;

  private trackedItems: Map<number, TrackedItem> = new Map();
  private currentlyViewable: Set<number> = new Set();
  private callbacks: Set<(info: { viewableItems: ViewToken<TItem>[]; changed: ViewToken<TItem>[] }) => void> = new Set();

  private hasInteracted = false;
  private pendingUpdate: ReturnType<typeof setTimeout> | null = null;

  constructor(
    layoutPositioner: LayoutPositioner,
    flattenedData: FlattenedItem<TItem>[],
    config: ViewabilityConfig = {},
    horizontal = false
  ) {
    this.layoutPositioner = layoutPositioner;
    this.flattenedData = flattenedData;
    this.horizontal = horizontal;

    this.config = {
      minimumViewTime: config.minimumViewTime ?? DEFAULT_VIEWABILITY_CONFIG.minimumViewTime,
      viewAreaCoveragePercentThreshold:
        config.viewAreaCoveragePercentThreshold ?? DEFAULT_VIEWABILITY_CONFIG.viewAreaCoveragePercentThreshold,
      itemVisiblePercentThreshold:
        config.itemVisiblePercentThreshold ?? DEFAULT_VIEWABILITY_CONFIG.itemVisiblePercentThreshold,
      waitForInteraction: config.waitForInteraction ?? DEFAULT_VIEWABILITY_CONFIG.waitForInteraction,
    };
  }

  /**
   * Update flattened data when it changes.
   */
  setData(flattenedData: FlattenedItem<TItem>[]): void {
    this.flattenedData = flattenedData;
    // Reset tracking for new data
    this.trackedItems.clear();
    this.currentlyViewable.clear();
    this.scheduleUpdate();
  }

  /**
   * Update the current scroll offset.
   */
  updateScrollOffset(offset: number): void {
    this.scrollOffset = offset;
    this.scheduleUpdate();
  }

  /**
   * Update the viewport size.
   */
  setViewportSize(size: number): void {
    if (this.viewportSize !== size) {
      this.viewportSize = size;
      this.scheduleUpdate();
    }
  }

  /**
   * Record that user has interacted with the list.
   */
  recordInteraction(): void {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      this.scheduleUpdate();
    }
  }

  /**
   * Schedule a viewability update (debounced).
   */
  private scheduleUpdate(): void {
    if (this.pendingUpdate) {
      return; // Already scheduled
    }

    this.pendingUpdate = setTimeout(() => {
      this.pendingUpdate = null;
      this.computeViewability();
    }, 0);
  }

  /**
   * Compute which items are viewable based on current scroll position.
   */
  private computeViewability(): void {
    if (this.config.waitForInteraction && !this.hasInteracted) {
      return;
    }

    const now = Date.now();
    const newViewable = new Set<number>();
    const changed: ViewToken<TItem>[] = [];

    // Get visible range from layout positioner
    const { startIndex, endIndex } = this.layoutPositioner.getVisibleRange(
      this.scrollOffset,
      this.viewportSize,
      0 // No overscan for viewability calculation
    );

    // Check each item in visible range
    for (let i = startIndex; i <= endIndex; i++) {
      const layout = this.layoutPositioner.getLayoutForIndex(i);
      const isViewable = this.isItemViewable(i, layout);

      if (isViewable) {
        newViewable.add(i);

        // Track when item became visible
        let tracked = this.trackedItems.get(i);
        if (!tracked) {
          tracked = {
            flatIndex: i,
            isViewable: false,
            lastVisibleTime: now,
            becameVisibleAt: now,
          };
          this.trackedItems.set(i, tracked);
        }

        // Check if item meets minimum view time
        if (!tracked.isViewable && tracked.becameVisibleAt !== null) {
          const visibleDuration = now - tracked.becameVisibleAt;
          if (visibleDuration >= this.config.minimumViewTime) {
            tracked.isViewable = true;
            changed.push(this.createViewToken(i, true));
          }
        }

        tracked.lastVisibleTime = now;
      }
    }

    // Check for items that are no longer viewable
    for (const flatIndex of this.currentlyViewable) {
      if (!newViewable.has(flatIndex)) {
        const tracked = this.trackedItems.get(flatIndex);
        if (tracked && tracked.isViewable) {
          tracked.isViewable = false;
          tracked.becameVisibleAt = null;
          changed.push(this.createViewToken(flatIndex, false));
        }
      }
    }

    this.currentlyViewable = newViewable;

    // Notify callbacks if there are changes
    if (changed.length > 0) {
      const viewableItems = Array.from(this.currentlyViewable)
        .filter(i => this.trackedItems.get(i)?.isViewable)
        .map(i => this.createViewToken(i, true));

      for (const callback of this.callbacks) {
        callback({ viewableItems, changed });
      }
    }
  }

  /**
   * Check if an item meets viewability thresholds.
   */
  private isItemViewable(
    flatIndex: number,
    layout: { x: number; y: number; width: number; height: number }
  ): boolean {
    const itemStart = this.horizontal ? layout.x : layout.y;
    const itemSize = this.horizontal ? layout.width : layout.height;
    const itemEnd = itemStart + itemSize;

    const viewportStart = this.scrollOffset;
    const viewportEnd = this.scrollOffset + this.viewportSize;

    // Calculate visible portion
    const visibleStart = Math.max(itemStart, viewportStart);
    const visibleEnd = Math.min(itemEnd, viewportEnd);
    const visibleSize = Math.max(0, visibleEnd - visibleStart);

    // Check item visible percent threshold
    if (this.config.itemVisiblePercentThreshold > 0) {
      const visiblePercent = itemSize > 0 ? (visibleSize / itemSize) * 100 : 0;
      if (visiblePercent < this.config.itemVisiblePercentThreshold) {
        return false;
      }
    }

    // Check view area coverage threshold
    if (this.config.viewAreaCoveragePercentThreshold > 0) {
      const coveragePercent = this.viewportSize > 0 ? (visibleSize / this.viewportSize) * 100 : 0;
      if (coveragePercent < this.config.viewAreaCoveragePercentThreshold) {
        return false;
      }
    }

    return visibleSize > 0;
  }

  /**
   * Create a ViewToken for an item.
   */
  private createViewToken(flatIndex: number, isViewable: boolean): ViewToken<TItem> {
    const item = this.flattenedData[flatIndex];
    return {
      item: item?.item ?? null,
      key: item?.key ?? `item-${flatIndex}`,
      index: flatIndex,
      isViewable,
      section: item?.section as any,
    };
  }

  /**
   * Get all currently visible indices.
   */
  getVisibleIndices(): number[] {
    return Array.from(this.currentlyViewable);
  }

  /**
   * Check if a specific index is visible.
   */
  isIndexVisible(index: number): boolean {
    return this.currentlyViewable.has(index);
  }

  /**
   * Get the first visible index.
   */
  getFirstVisibleIndex(): number {
    if (this.currentlyViewable.size === 0) {
      return -1;
    }
    return Math.min(...this.currentlyViewable);
  }

  /**
   * Get the last visible index.
   */
  getLastVisibleIndex(): number {
    if (this.currentlyViewable.size === 0) {
      return -1;
    }
    return Math.max(...this.currentlyViewable);
  }

  /**
   * Register a callback for viewability changes.
   */
  onViewableItemsChanged(
    callback: (info: { viewableItems: ViewToken<TItem>[]; changed: ViewToken<TItem>[] }) => void
  ): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    if (this.pendingUpdate) {
      clearTimeout(this.pendingUpdate);
      this.pendingUpdate = null;
    }
    this.callbacks.clear();
    this.trackedItems.clear();
    this.currentlyViewable.clear();
  }
}

/**
 * Factory function to create a ViewabilityTracker.
 */
export function createViewabilityTracker<TItem>(
  layoutPositioner: LayoutPositioner,
  flattenedData: FlattenedItem<TItem>[],
  config?: ViewabilityConfig,
  horizontal?: boolean
): ViewabilityTracker<TItem> {
  return new ViewabilityTrackerImpl(layoutPositioner, flattenedData, config, horizontal);
}
