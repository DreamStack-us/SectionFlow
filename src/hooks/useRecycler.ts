import { useCallback, useRef, useMemo, useEffect } from 'react';
import { createCellRecycler, type CellRecyclerImpl } from '../core/CellRecycler';
import type { RecycledCell, FlattenedItem } from '../types';
import { DEFAULT_ITEM_TYPE, SECTION_HEADER_TYPE, SECTION_FOOTER_TYPE } from '../constants';

interface UseRecyclerOptions<TItem> {
  flattenedData: FlattenedItem<TItem>[];
  getItemType?: (item: TItem, index: number) => string;
  maxPoolSize?: number;
}

interface RecyclerResult {
  getCell: (flatIndex: number) => RecycledCell;
  releaseCell: (cell: RecycledCell) => void;
  updateVisibleRange: (startIndex: number, endIndex: number) => void;
  clearPools: () => void;
  getPoolStats: () => Map<string, { available: number; inUse: number }>;
}

/**
 * Hook for managing cell recycling state.
 * Provides methods to acquire and release cells based on visibility.
 */
export function useRecycler<TItem>(options: UseRecyclerOptions<TItem>): RecyclerResult {
  const { flattenedData, getItemType, maxPoolSize } = options;

  // Create recycler instance (stable across renders)
  const recycler = useRef<CellRecyclerImpl | null>(null);
  if (!recycler.current) {
    recycler.current = createCellRecycler(maxPoolSize);
  }

  // Track currently rendered cells
  const activeCells = useRef<Map<number, RecycledCell>>(new Map());
  const visibleRange = useRef<{ start: number; end: number }>({ start: 0, end: -1 });

  /**
   * Get the item type for a flat index.
   */
  const getTypeForIndex = useCallback(
    (flatIndex: number): string => {
      const item = flattenedData[flatIndex];
      if (!item) return DEFAULT_ITEM_TYPE;

      if (item.type === 'section-header') return SECTION_HEADER_TYPE;
      if (item.type === 'section-footer') return SECTION_FOOTER_TYPE;

      if (getItemType && item.item !== null) {
        return getItemType(item.item, item.itemIndex);
      }

      return DEFAULT_ITEM_TYPE;
    },
    [flattenedData, getItemType]
  );

  /**
   * Get or create a cell for a flat index.
   */
  const getCell = useCallback(
    (flatIndex: number): RecycledCell => {
      // Check if already have an active cell for this index
      const existing = activeCells.current.get(flatIndex);
      if (existing) {
        return existing;
      }

      // Get type for this index
      const type = getTypeForIndex(flatIndex);

      // Get cell from recycler (may be recycled or new)
      const cell = recycler.current!.getCell(type, flatIndex);

      // Track as active
      activeCells.current.set(flatIndex, cell);

      return cell;
    },
    [getTypeForIndex]
  );

  /**
   * Release a cell back to the pool.
   */
  const releaseCell = useCallback((cell: RecycledCell) => {
    activeCells.current.delete(cell.flatIndex);
    recycler.current!.releaseCell(cell);
  }, []);

  /**
   * Update the visible range and recycle cells outside it.
   */
  const updateVisibleRange = useCallback(
    (startIndex: number, endIndex: number) => {
      const prevStart = visibleRange.current.start;
      const prevEnd = visibleRange.current.end;

      visibleRange.current = { start: startIndex, end: endIndex };

      // Release cells that are now outside visible range
      for (const [flatIndex, cell] of activeCells.current) {
        if (flatIndex < startIndex || flatIndex > endIndex) {
          releaseCell(cell);
        }
      }
    },
    [releaseCell]
  );

  /**
   * Clear all pools (e.g., on data change).
   */
  const clearPools = useCallback(() => {
    activeCells.current.clear();
    recycler.current!.clearPools();
  }, []);

  /**
   * Get pool statistics for debugging.
   */
  const getPoolStats = useCallback(() => {
    return recycler.current!.getPoolStats();
  }, []);

  // Clear pools when data changes significantly
  const dataLength = flattenedData.length;
  useEffect(() => {
    // If data length changes dramatically, clear pools
    if (activeCells.current.size > dataLength * 2) {
      clearPools();
    }
  }, [dataLength, clearPools]);

  return {
    getCell,
    releaseCell,
    updateVisibleRange,
    clearPools,
    getPoolStats,
  };
}

/**
 * Hook to determine which item type to use for rendering.
 * Returns a stable function that maps flat indices to type strings.
 */
export function useItemTypeResolver<TItem>(
  flattenedData: FlattenedItem<TItem>[],
  getItemType?: (item: TItem, index: number) => string
): (flatIndex: number) => string {
  return useCallback(
    (flatIndex: number): string => {
      const item = flattenedData[flatIndex];
      if (!item) return DEFAULT_ITEM_TYPE;

      if (item.type === 'section-header') return SECTION_HEADER_TYPE;
      if (item.type === 'section-footer') return SECTION_FOOTER_TYPE;

      if (getItemType && item.item !== null) {
        return getItemType(item.item, item.itemIndex);
      }

      return DEFAULT_ITEM_TYPE;
    },
    [flattenedData, getItemType]
  );
}
