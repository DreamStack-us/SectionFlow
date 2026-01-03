import type { LayoutRect, LayoutPositioner, FlattenedItem } from '../types';
import type { LayoutCache } from './LayoutCache';
import {
  DEFAULT_ESTIMATED_ITEM_SIZE,
  DEFAULT_ESTIMATED_HEADER_SIZE,
  DEFAULT_ESTIMATED_FOOTER_SIZE,
  SECTION_HEADER_TYPE,
  SECTION_FOOTER_TYPE,
} from '../constants';

interface LinearLayoutPositionerOptions {
  horizontal?: boolean;
  estimatedItemSize?: number;
  estimatedHeaderSize?: number;
  estimatedFooterSize?: number;
  containerWidth?: number;
  containerHeight?: number;
}

/**
 * LinearLayoutPositioner implements the LayoutPositioner interface for
 * standard vertical or horizontal list layouts.
 *
 * It computes absolute positions for each item based on:
 * 1. Measured sizes from LayoutCache (when available)
 * 2. Estimated sizes (when not yet measured)
 * 3. Type-specific size predictions
 */
export class LinearLayoutPositioner implements LayoutPositioner {
  private horizontal: boolean;
  private estimatedItemSize: number;
  private estimatedHeaderSize: number;
  private estimatedFooterSize: number;
  private containerWidth: number;
  private containerHeight: number;

  private flattenedData: FlattenedItem<unknown>[] = [];
  private layoutCache: LayoutCache;
  private getItemType: (flatIndex: number) => string;

  // Cached computed layouts (invalidated on data change)
  private computedLayouts: Map<number, LayoutRect> = new Map();
  private totalContentSize: { width: number; height: number } = { width: 0, height: 0 };
  private layoutsValid = false;

  constructor(
    layoutCache: LayoutCache,
    getItemType: (flatIndex: number) => string,
    options: LinearLayoutPositionerOptions = {}
  ) {
    this.layoutCache = layoutCache;
    this.getItemType = getItemType;
    this.horizontal = options.horizontal ?? false;
    this.estimatedItemSize = options.estimatedItemSize ?? DEFAULT_ESTIMATED_ITEM_SIZE;
    this.estimatedHeaderSize = options.estimatedHeaderSize ?? DEFAULT_ESTIMATED_HEADER_SIZE;
    this.estimatedFooterSize = options.estimatedFooterSize ?? DEFAULT_ESTIMATED_FOOTER_SIZE;
    this.containerWidth = options.containerWidth ?? 0;
    this.containerHeight = options.containerHeight ?? 0;
  }

  /**
   * Update the flattened data and invalidate layouts.
   */
  setData(flattenedData: FlattenedItem<unknown>[]): void {
    this.flattenedData = flattenedData;
    this.invalidateAll();
  }

  /**
   * Update container dimensions.
   */
  setContainerSize(width: number, height: number): void {
    if (this.containerWidth !== width || this.containerHeight !== height) {
      this.containerWidth = width;
      this.containerHeight = height;
      this.invalidateAll();
    }
  }

  /**
   * Get the estimated size for an item based on its type.
   */
  private getEstimatedSize(flatIndex: number): number {
    const item = this.flattenedData[flatIndex];
    if (!item) {
      return this.estimatedItemSize;
    }

    // Check for type-specific average from cache
    const itemType = this.getItemType(flatIndex);
    const avgSize = this.layoutCache.getAverageSize(itemType);
    if (avgSize !== undefined) {
      return avgSize;
    }

    // Use default estimates based on item type
    if (item.type === 'section-header') {
      return this.estimatedHeaderSize;
    }
    if (item.type === 'section-footer') {
      return this.estimatedFooterSize;
    }
    return this.estimatedItemSize;
  }

  /**
   * Get the actual or estimated size for an item.
   */
  private getItemSize(flatIndex: number): number {
    const item = this.flattenedData[flatIndex];
    if (!item) {
      return this.estimatedItemSize;
    }

    // Check cache for measured size
    const cached = this.layoutCache.get(item.key);
    if (cached) {
      return this.horizontal ? cached.width : cached.height;
    }

    // Fall back to estimated
    return this.getEstimatedSize(flatIndex);
  }

  /**
   * Compute layouts for all items if not already computed.
   */
  private ensureLayoutsComputed(): void {
    if (this.layoutsValid) {
      return;
    }

    this.computedLayouts.clear();
    let offset = 0;
    const crossAxisSize = this.horizontal ? this.containerHeight : this.containerWidth;

    for (let i = 0; i < this.flattenedData.length; i++) {
      const size = this.getItemSize(i);

      const layout: LayoutRect = this.horizontal
        ? {
            x: offset,
            y: 0,
            width: size,
            height: crossAxisSize,
          }
        : {
            x: 0,
            y: offset,
            width: crossAxisSize,
            height: size,
          };

      this.computedLayouts.set(i, layout);
      offset += size;
    }

    this.totalContentSize = this.horizontal
      ? { width: offset, height: crossAxisSize }
      : { width: crossAxisSize, height: offset };

    this.layoutsValid = true;
  }

  /**
   * Get the layout for a specific index.
   */
  getLayoutForIndex(index: number): LayoutRect {
    this.ensureLayoutsComputed();
    return (
      this.computedLayouts.get(index) ?? {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
    );
  }

  /**
   * Get the total content size.
   */
  getContentSize(): { width: number; height: number } {
    this.ensureLayoutsComputed();
    return this.totalContentSize;
  }

  /**
   * Get the range of visible indices for the given scroll position.
   * Uses binary search for efficiency with large lists.
   */
  getVisibleRange(
    scrollOffset: number,
    viewportSize: number,
    overscan: number
  ): { startIndex: number; endIndex: number } {
    this.ensureLayoutsComputed();

    if (this.flattenedData.length === 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    const startOffset = Math.max(0, scrollOffset - overscan);
    const endOffset = scrollOffset + viewportSize + overscan;

    // Binary search for start index
    const startIndex = this.binarySearchStart(startOffset);
    // Binary search for end index
    const endIndex = this.binarySearchEnd(endOffset);

    return {
      startIndex: Math.max(0, startIndex),
      endIndex: Math.min(this.flattenedData.length - 1, endIndex),
    };
  }

  /**
   * Binary search to find first item that ends after the given offset.
   */
  private binarySearchStart(offset: number): number {
    let low = 0;
    let high = this.flattenedData.length - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const layout = this.computedLayouts.get(mid);
      if (!layout) {
        low = mid + 1;
        continue;
      }

      const itemEnd = this.horizontal ? layout.x + layout.width : layout.y + layout.height;

      if (itemEnd <= offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low;
  }

  /**
   * Binary search to find last item that starts before the given offset.
   */
  private binarySearchEnd(offset: number): number {
    let low = 0;
    let high = this.flattenedData.length - 1;

    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      const layout = this.computedLayouts.get(mid);
      if (!layout) {
        high = mid - 1;
        continue;
      }

      const itemStart = this.horizontal ? layout.x : layout.y;

      if (itemStart >= offset) {
        high = mid - 1;
      } else {
        low = mid;
      }
    }

    return high;
  }

  /**
   * Update the layout for a specific index after measurement.
   */
  updateItemLayout(index: number, layout: LayoutRect): void {
    const item = this.flattenedData[index];
    if (!item) return;

    const itemType = this.getItemType(index);
    const size = this.horizontal ? layout.width : layout.height;

    // Record measurement for type averages
    this.layoutCache.recordMeasurement(itemType, size);

    // Store in cache
    this.layoutCache.set(item.key, layout);

    // Invalidate layouts from this index onwards
    this.invalidateFrom(index);
  }

  /**
   * Invalidate layouts from a given index.
   */
  invalidateFrom(index: number): void {
    // Remove computed layouts from index onwards
    for (let i = index; i < this.flattenedData.length; i++) {
      this.computedLayouts.delete(i);
    }
    this.layoutsValid = false;
  }

  /**
   * Invalidate all layouts.
   */
  invalidateAll(): void {
    this.computedLayouts.clear();
    this.layoutsValid = false;
  }

  /**
   * Get the index of the item at or just before the given offset.
   */
  getIndexForOffset(offset: number): number {
    this.ensureLayoutsComputed();

    if (this.flattenedData.length === 0) {
      return 0;
    }

    return this.binarySearchStart(offset);
  }

  /**
   * Get the total number of items.
   */
  getTotalItemCount(): number {
    return this.flattenedData.length;
  }
}

/**
 * Factory function to create a LinearLayoutPositioner.
 */
export function createLayoutPositioner(
  layoutCache: LayoutCache,
  getItemType: (flatIndex: number) => string,
  options?: LinearLayoutPositionerOptions
): LinearLayoutPositioner {
  return new LinearLayoutPositioner(layoutCache, getItemType, options);
}
