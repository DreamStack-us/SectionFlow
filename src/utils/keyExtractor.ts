/**
 * Key extraction utilities for list items.
 */

/**
 * Default key extractor that uses index as string.
 * Note: Using indices as keys is not recommended for dynamic lists.
 */
export function defaultKeyExtractor<TItem>(item: TItem, index: number): string {
  // Try to use common id field names
  const anyItem = item as Record<string, unknown>;

  if (typeof anyItem?.id === 'string' || typeof anyItem?.id === 'number') {
    return String(anyItem.id);
  }

  if (typeof anyItem?.key === 'string' || typeof anyItem?.key === 'number') {
    return String(anyItem.key);
  }

  if (typeof anyItem?._id === 'string' || typeof anyItem?._id === 'number') {
    return String(anyItem._id);
  }

  if (typeof anyItem?.uuid === 'string') {
    return anyItem.uuid;
  }

  // Fallback to index
  return String(index);
}

/**
 * Create a key extractor function with a custom field name.
 */
export function createKeyExtractor<TItem>(
  field: keyof TItem
): (item: TItem, index: number) => string {
  return (item: TItem) => {
    const value = item[field];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    throw new Error(`Key field "${String(field)}" not found on item`);
  };
}

/**
 * Create a composite key from multiple fields.
 */
export function createCompositeKeyExtractor<TItem>(
  fields: (keyof TItem)[]
): (item: TItem, index: number) => string {
  return (item: TItem) => {
    return fields
      .map((field) => {
        const value = item[field];
        return value !== undefined && value !== null ? String(value) : '';
      })
      .join('-');
  };
}

/**
 * Validate that keys are unique within a list.
 * Throws an error if duplicates are found.
 */
export function validateUniqueKeys<TItem>(
  items: TItem[],
  keyExtractor: (item: TItem, index: number) => string
): void {
  const seen = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const key = keyExtractor(items[i], i);

    if (seen.has(key)) {
      throw new Error(
        `Duplicate key "${key}" found at index ${i}. Keys must be unique within a list.`
      );
    }

    seen.add(key);
  }
}
