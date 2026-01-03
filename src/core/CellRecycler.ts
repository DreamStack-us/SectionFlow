import type { CellRecyclerInterface, RecycledCell, RecyclePool } from '../types';
import { DEFAULT_MAX_POOL_SIZE } from '../constants';

/**
 * CellRecycler manages pools of recycled cell instances per item type.
 * This is the core of FlashList-style performance - reusing view components
 * instead of destroying and recreating them.
 */
class CellRecyclerImpl implements CellRecyclerInterface {
  private pools: Map<string, RecyclePool> = new Map();
  private inUse: Map<string, Set<string>> = new Map(); // type -> set of cell keys in use
  private defaultMaxPoolSize: number;
  private cellCounter = 0;

  constructor(defaultMaxPoolSize: number = DEFAULT_MAX_POOL_SIZE) {
    this.defaultMaxPoolSize = defaultMaxPoolSize;
  }

  /**
   * Acquire a cell from the pool for the given type.
   * Returns null if no recycled cells are available (caller should create new).
   */
  acquireCell(type: string, flatIndex: number): RecycledCell | null {
    const pool = this.pools.get(type);

    if (!pool || pool.cells.length === 0) {
      // No recycled cells available
      return null;
    }

    // Pop a cell from the pool
    const cell = pool.cells.pop()!;
    cell.flatIndex = flatIndex;

    // Track as in use
    let inUseSet = this.inUse.get(type);
    if (!inUseSet) {
      inUseSet = new Set();
      this.inUse.set(type, inUseSet);
    }
    inUseSet.add(cell.key);

    return cell;
  }

  /**
   * Release a cell back to its pool for recycling.
   */
  releaseCell(cell: RecycledCell): void {
    const { itemType: type, key } = cell;

    // Remove from in-use tracking
    const inUseSet = this.inUse.get(type);
    if (inUseSet) {
      inUseSet.delete(key);
    }

    // Get or create pool for this type
    let pool = this.pools.get(type);
    if (!pool) {
      pool = {
        type,
        cells: [],
        maxSize: this.defaultMaxPoolSize,
      };
      this.pools.set(type, pool);
    }

    // Only add to pool if under max size
    if (pool.cells.length < pool.maxSize) {
      pool.cells.push(cell);
    }
    // If at max size, the cell is discarded (GC'd)
  }

  /**
   * Clear all recycled cells from all pools.
   * Useful when data changes significantly.
   */
  clearPools(): void {
    this.pools.clear();
    this.inUse.clear();
  }

  /**
   * Set the maximum pool size for a specific item type.
   */
  setMaxPoolSize(type: string, size: number): void {
    let pool = this.pools.get(type);
    if (!pool) {
      pool = {
        type,
        cells: [],
        maxSize: size,
      };
      this.pools.set(type, pool);
    } else {
      pool.maxSize = size;
      // Trim pool if necessary
      while (pool.cells.length > size) {
        pool.cells.pop();
      }
    }
  }

  /**
   * Get statistics about pool usage for debugging.
   */
  getPoolStats(): Map<string, { available: number; inUse: number }> {
    const stats = new Map<string, { available: number; inUse: number }>();

    // Collect all known types
    const allTypes = new Set([...this.pools.keys(), ...this.inUse.keys()]);

    for (const type of allTypes) {
      const pool = this.pools.get(type);
      const inUseSet = this.inUse.get(type);

      stats.set(type, {
        available: pool?.cells.length ?? 0,
        inUse: inUseSet?.size ?? 0,
      });
    }

    return stats;
  }

  /**
   * Generate a unique key for a new cell.
   */
  generateCellKey(type: string): string {
    return `${type}-${++this.cellCounter}`;
  }

  /**
   * Create a new cell (when pool is empty).
   */
  createCell(type: string, flatIndex: number): RecycledCell {
    const key = this.generateCellKey(type);
    const cell: RecycledCell = {
      key,
      itemType: type,
      flatIndex,
    };

    // Track as in use
    let inUseSet = this.inUse.get(type);
    if (!inUseSet) {
      inUseSet = new Set();
      this.inUse.set(type, inUseSet);
    }
    inUseSet.add(key);

    return cell;
  }

  /**
   * Get or create a cell - the main method used during rendering.
   * First tries to acquire from pool, then creates new if needed.
   */
  getCell(type: string, flatIndex: number): RecycledCell {
    const recycled = this.acquireCell(type, flatIndex);
    if (recycled) {
      return recycled;
    }
    return this.createCell(type, flatIndex);
  }
}

/**
 * Factory function to create a CellRecycler instance.
 */
export function createCellRecycler(
  defaultMaxPoolSize: number = DEFAULT_MAX_POOL_SIZE
): CellRecyclerImpl {
  return new CellRecyclerImpl(defaultMaxPoolSize);
}

export type { CellRecyclerImpl };
