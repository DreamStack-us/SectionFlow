import type { Section, FlattenedItem } from '../types';

interface FlattenOptions {
  collapsedSections?: Set<string>;
  includeSectionFooters?: boolean;
}

/**
 * Flatten sections into a single array of items for virtualization.
 * Each item includes metadata about its section and position.
 */
export function flattenSections<TItem>(
  sections: Section<TItem>[],
  options: FlattenOptions = {}
): FlattenedItem<TItem>[] {
  const { collapsedSections = new Set(), includeSectionFooters = false } = options;
  const result: FlattenedItem<TItem>[] = [];

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    const isCollapsed = collapsedSections.has(section.key);

    // Always add section header
    result.push({
      type: 'section-header',
      key: `header-${section.key}`,
      sectionKey: section.key,
      sectionIndex,
      itemIndex: -1,
      item: null,
      section,
    });

    // Add items only if not collapsed
    if (!isCollapsed) {
      for (let itemIndex = 0; itemIndex < section.data.length; itemIndex++) {
        result.push({
          type: 'item',
          key: `item-${section.key}-${itemIndex}`,
          sectionKey: section.key,
          sectionIndex,
          itemIndex,
          item: section.data[itemIndex],
          section,
        });
      }

      // Optionally add section footer
      if (includeSectionFooters) {
        result.push({
          type: 'section-footer',
          key: `footer-${section.key}`,
          sectionKey: section.key,
          sectionIndex,
          itemIndex: -1,
          item: null,
          section,
        });
      }
    }
  }

  return result;
}

/**
 * Get the flat index for a specific section and item index.
 */
export function getFlatIndex<TItem>(
  sections: Section<TItem>[],
  sectionIndex: number,
  itemIndex: number,
  collapsedSections: Set<string> = new Set(),
  includeSectionFooters = false
): number {
  let flatIndex = 0;

  for (let i = 0; i < sectionIndex; i++) {
    const section = sections[i];
    flatIndex++; // Header

    if (!collapsedSections.has(section.key)) {
      flatIndex += section.data.length; // Items
      if (includeSectionFooters) {
        flatIndex++; // Footer
      }
    }
  }

  // Add header of target section
  flatIndex++;

  // Add items up to target index
  if (itemIndex >= 0 && !collapsedSections.has(sections[sectionIndex].key)) {
    flatIndex += itemIndex;
  }

  return flatIndex;
}

/**
 * Get section and item index from a flat index.
 */
export function getSectionItemFromFlatIndex<TItem>(
  sections: Section<TItem>[],
  flatIndex: number,
  collapsedSections: Set<string> = new Set(),
  includeSectionFooters = false
): { sectionIndex: number; itemIndex: number; type: 'header' | 'item' | 'footer' } | null {
  let currentFlatIndex = 0;

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    const isCollapsed = collapsedSections.has(section.key);

    // Check if this is the header
    if (currentFlatIndex === flatIndex) {
      return { sectionIndex, itemIndex: -1, type: 'header' };
    }
    currentFlatIndex++;

    if (!isCollapsed) {
      // Check items
      for (let itemIndex = 0; itemIndex < section.data.length; itemIndex++) {
        if (currentFlatIndex === flatIndex) {
          return { sectionIndex, itemIndex, type: 'item' };
        }
        currentFlatIndex++;
      }

      // Check footer
      if (includeSectionFooters) {
        if (currentFlatIndex === flatIndex) {
          return { sectionIndex, itemIndex: -1, type: 'footer' };
        }
        currentFlatIndex++;
      }
    }
  }

  return null;
}
