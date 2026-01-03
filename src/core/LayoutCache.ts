import type { LayoutRect } from '../types';

/**
 * LayoutCache stores measured layout information for items.
 * This is used for:
 * 1. Caching measured sizes to avoid re-measurement
 * 2. Tracking which items have been measured vs estimated
 * 3. Computing average sizes per item type for better predictions
 */
export interface LayoutCache {
  get(key: string): LayoutRect | undefined;
  set(key: string, layout: LayoutRect): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  invalidateFrom(flatIndex: number, keyToIndexMap: Map<string, number>): void;
  getAverageSize(itemType: string): number | undefined;
  recordMeasurement(itemType: string, size: number): void;
  size: number;
}

interface TypeStats {
  totalSize: number;
  count: number;
}

class LayoutCacheImpl implements LayoutCache {
  private cache: Map<string, LayoutRect> = new Map();
  private typeStats: Map<string, TypeStats> = new Map();

  get(key: string): LayoutRect | undefined {
    return this.cache.get(key);
  }

  set(key: string, layout: LayoutRect): void {
    this.cache.set(key, layout);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.typeStats.clear();
  }

  /**
   * Invalidate all cached layouts from a given flat index onwards.
   * Used when items are inserted/removed and positions need recalculation.
   */
  invalidateFrom(flatIndex: number, keyToIndexMap: Map<string, number>): void {
    for (const [key, index] of keyToIndexMap) {
      if (index >= flatIndex) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get the average measured size for items of a given type.
   * Used for predicting unmeasured item sizes.
   */
  getAverageSize(itemType: string): number | undefined {
    const stats = this.typeStats.get(itemType);
    if (!stats || stats.count === 0) {
      return undefined;
    }
    return stats.totalSize / stats.count;
  }

  /**
   * Record a measurement for computing type averages.
   */
  recordMeasurement(itemType: string, size: number): void {
    let stats = this.typeStats.get(itemType);
    if (!stats) {
      stats = { totalSize: 0, count: 0 };
      this.typeStats.set(itemType, stats);
    }
    stats.totalSize += size;
    stats.count += 1;
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Factory function to create a LayoutCache instance.
 */
export function createLayoutCache(): LayoutCache {
  return new LayoutCacheImpl();
}
