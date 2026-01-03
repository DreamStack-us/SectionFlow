/**
 * Binary search utilities for efficient offset-to-index lookups.
 */

/**
 * Binary search to find the index of an item with a specific value.
 * Returns -1 if not found.
 */
export function binarySearch<T>(
  array: T[],
  target: number,
  getValue: (item: T) => number
): number {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = getValue(array[mid]);

    if (value === target) {
      return mid;
    } else if (value < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

/**
 * Binary search to find the insertion position for a value.
 * Returns the index where the value should be inserted to maintain sorted order.
 */
export function binarySearchInsertPosition<T>(
  array: T[],
  target: number,
  getValue: (item: T) => number
): number {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const value = getValue(array[mid]);

    if (value < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

/**
 * Binary search to find the first item whose end position is after the target.
 * Useful for finding the first visible item.
 */
export function binarySearchFirstAfter(
  offsets: number[],
  sizes: number[],
  target: number
): number {
  let low = 0;
  let high = offsets.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const itemEnd = offsets[mid] + sizes[mid];

    if (itemEnd <= target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

/**
 * Binary search to find the last item whose start position is before the target.
 * Useful for finding the last visible item.
 */
export function binarySearchLastBefore(
  offsets: number[],
  target: number
): number {
  let low = 0;
  let high = offsets.length - 1;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);

    if (offsets[mid] >= target) {
      high = mid - 1;
    } else {
      low = mid;
    }
  }

  return high;
}
