import type { Section, SectionLayoutInfo, FlattenedItem, LayoutRect } from '../types';
import type { LayoutCache } from './LayoutCache';
import { LinearLayoutPositioner } from './LinearLayoutPositioner';

/**
 * SectionLayoutManager provides section-aware layout operations on top of
 * the LinearLayoutPositioner. It handles:
 * - Mapping between section/item coordinates and flat indices
 * - Tracking section boundaries and layouts
 * - Managing collapsed section state
 */
export interface SectionLayoutManager {
  // Coordinate mapping
  getFlatIndex(sectionIndex: number, itemIndex: number): number;
  getSectionItemIndex(flatIndex: number): { sectionIndex: number; itemIndex: number; isHeader: boolean; isFooter: boolean };

  // Section layout info
  getSectionLayout(sectionKey: string): SectionLayoutInfo | null;
  getSectionAtOffset(offset: number): SectionLayoutInfo | null;
  getAllSectionLayouts(): SectionLayoutInfo[];

  // Collapse management
  setSectionCollapsed(sectionKey: string, collapsed: boolean): void;
  isSectionCollapsed(sectionKey: string): boolean;
  getCollapsedSections(): Set<string>;

  // Data updates
  updateData(sections: Section<unknown>[], collapsedSections: Set<string>): FlattenedItem<unknown>[];

  // Layout positioner access
  getLayoutPositioner(): LinearLayoutPositioner;
}

interface SectionBoundary {
  sectionIndex: number;
  sectionKey: string;
  headerFlatIndex: number;
  firstItemFlatIndex: number;
  lastItemFlatIndex: number;
  footerFlatIndex: number | null;
  itemCount: number;
}

class SectionLayoutManagerImpl implements SectionLayoutManager {
  private sections: Section<unknown>[] = [];
  private flattenedData: FlattenedItem<unknown>[] = [];
  private collapsedSections: Set<string> = new Set();
  private sectionBoundaries: Map<string, SectionBoundary> = new Map();
  private flatIndexToSection: Map<number, SectionBoundary> = new Map();

  private layoutPositioner: LinearLayoutPositioner;
  private layoutCache: LayoutCache;
  private horizontal: boolean;
  private hasSectionFooters: boolean;

  constructor(
    layoutCache: LayoutCache,
    options: {
      horizontal?: boolean;
      estimatedItemSize?: number;
      estimatedHeaderSize?: number;
      estimatedFooterSize?: number;
      hasSectionFooters?: boolean;
    } = {}
  ) {
    this.layoutCache = layoutCache;
    this.horizontal = options.horizontal ?? false;
    this.hasSectionFooters = options.hasSectionFooters ?? false;

    this.layoutPositioner = new LinearLayoutPositioner(
      layoutCache,
      (flatIndex) => this.getItemTypeForIndex(flatIndex),
      {
        horizontal: this.horizontal,
        estimatedItemSize: options.estimatedItemSize,
        estimatedHeaderSize: options.estimatedHeaderSize,
        estimatedFooterSize: options.estimatedFooterSize,
      }
    );
  }

  /**
   * Get the item type for a flat index (used by layout positioner).
   */
  private getItemTypeForIndex(flatIndex: number): string {
    const item = this.flattenedData[flatIndex];
    if (!item) return 'default';

    if (item.type === 'section-header') return '__section_header__';
    if (item.type === 'section-footer') return '__section_footer__';
    return 'default';
  }

  /**
   * Update sections and compute flattened data.
   */
  updateData(
    sections: Section<unknown>[],
    collapsedSections: Set<string>
  ): FlattenedItem<unknown>[] {
    this.sections = sections;
    this.collapsedSections = collapsedSections;

    this.flattenedData = [];
    this.sectionBoundaries.clear();
    this.flatIndexToSection.clear();

    let flatIndex = 0;

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];
      const isCollapsed = collapsedSections.has(section.key);

      const boundary: SectionBoundary = {
        sectionIndex,
        sectionKey: section.key,
        headerFlatIndex: flatIndex,
        firstItemFlatIndex: -1,
        lastItemFlatIndex: -1,
        footerFlatIndex: null,
        itemCount: 0,
      };

      // Section header
      this.flattenedData.push({
        type: 'section-header',
        key: `header-${section.key}`,
        sectionKey: section.key,
        sectionIndex,
        itemIndex: -1,
        item: null,
        section,
      });
      this.flatIndexToSection.set(flatIndex, boundary);
      flatIndex++;

      // Section items (only if not collapsed)
      if (!isCollapsed) {
        boundary.firstItemFlatIndex = flatIndex;

        for (let itemIndex = 0; itemIndex < section.data.length; itemIndex++) {
          this.flattenedData.push({
            type: 'item',
            key: `item-${section.key}-${itemIndex}`,
            sectionKey: section.key,
            sectionIndex,
            itemIndex,
            item: section.data[itemIndex],
            section,
          });
          this.flatIndexToSection.set(flatIndex, boundary);
          flatIndex++;
        }

        boundary.lastItemFlatIndex = flatIndex - 1;
        boundary.itemCount = section.data.length;

        // Section footer (optional)
        if (this.hasSectionFooters) {
          boundary.footerFlatIndex = flatIndex;
          this.flattenedData.push({
            type: 'section-footer',
            key: `footer-${section.key}`,
            sectionKey: section.key,
            sectionIndex,
            itemIndex: -1,
            item: null,
            section,
          });
          this.flatIndexToSection.set(flatIndex, boundary);
          flatIndex++;
        }
      }

      this.sectionBoundaries.set(section.key, boundary);
    }

    // Update layout positioner with new data
    this.layoutPositioner.setData(this.flattenedData);

    return this.flattenedData;
  }

  /**
   * Get the flat index for a section/item coordinate.
   */
  getFlatIndex(sectionIndex: number, itemIndex: number): number {
    const section = this.sections[sectionIndex];
    if (!section) return -1;

    const boundary = this.sectionBoundaries.get(section.key);
    if (!boundary) return -1;

    if (itemIndex === -1) {
      // Return header index
      return boundary.headerFlatIndex;
    }

    if (this.collapsedSections.has(section.key)) {
      // Section is collapsed, items not in flattened data
      return -1;
    }

    if (itemIndex < 0 || itemIndex >= section.data.length) {
      return -1;
    }

    return boundary.firstItemFlatIndex + itemIndex;
  }

  /**
   * Get section/item coordinates from a flat index.
   */
  getSectionItemIndex(flatIndex: number): {
    sectionIndex: number;
    itemIndex: number;
    isHeader: boolean;
    isFooter: boolean;
  } {
    const item = this.flattenedData[flatIndex];
    if (!item) {
      return { sectionIndex: -1, itemIndex: -1, isHeader: false, isFooter: false };
    }

    return {
      sectionIndex: item.sectionIndex,
      itemIndex: item.itemIndex,
      isHeader: item.type === 'section-header',
      isFooter: item.type === 'section-footer',
    };
  }

  /**
   * Get layout info for a section.
   */
  getSectionLayout(sectionKey: string): SectionLayoutInfo | null {
    const boundary = this.sectionBoundaries.get(sectionKey);
    if (!boundary) return null;

    const headerLayout = this.layoutPositioner.getLayoutForIndex(boundary.headerFlatIndex);

    let footerLayout: LayoutRect | null = null;
    if (boundary.footerFlatIndex !== null) {
      footerLayout = this.layoutPositioner.getLayoutForIndex(boundary.footerFlatIndex);
    }

    // Calculate items offset range
    const isCollapsed = this.collapsedSections.has(sectionKey);
    let itemsStartOffset = this.horizontal ? headerLayout.x + headerLayout.width : headerLayout.y + headerLayout.height;
    let itemsEndOffset = itemsStartOffset;

    if (!isCollapsed && boundary.lastItemFlatIndex >= boundary.firstItemFlatIndex) {
      const lastItemLayout = this.layoutPositioner.getLayoutForIndex(boundary.lastItemFlatIndex);
      itemsEndOffset = this.horizontal
        ? lastItemLayout.x + lastItemLayout.width
        : lastItemLayout.y + lastItemLayout.height;
    }

    return {
      sectionKey,
      sectionIndex: boundary.sectionIndex,
      headerLayout,
      footerLayout,
      itemsStartOffset,
      itemsEndOffset,
      itemCount: boundary.itemCount,
      isCollapsed,
    };
  }

  /**
   * Get the section containing a given scroll offset.
   */
  getSectionAtOffset(offset: number): SectionLayoutInfo | null {
    for (const [sectionKey] of this.sectionBoundaries) {
      const layout = this.getSectionLayout(sectionKey);
      if (!layout) continue;

      const sectionStart = this.horizontal ? layout.headerLayout.x : layout.headerLayout.y;
      const sectionEnd = layout.itemsEndOffset;

      if (offset >= sectionStart && offset < sectionEnd) {
        return layout;
      }
    }

    return null;
  }

  /**
   * Get layout info for all sections.
   */
  getAllSectionLayouts(): SectionLayoutInfo[] {
    const layouts: SectionLayoutInfo[] = [];

    for (const [sectionKey] of this.sectionBoundaries) {
      const layout = this.getSectionLayout(sectionKey);
      if (layout) {
        layouts.push(layout);
      }
    }

    return layouts;
  }

  /**
   * Set a section's collapsed state.
   */
  setSectionCollapsed(sectionKey: string, collapsed: boolean): void {
    if (collapsed) {
      this.collapsedSections.add(sectionKey);
    } else {
      this.collapsedSections.delete(sectionKey);
    }

    // Re-flatten data with new collapsed state
    this.updateData(this.sections, this.collapsedSections);
  }

  /**
   * Check if a section is collapsed.
   */
  isSectionCollapsed(sectionKey: string): boolean {
    return this.collapsedSections.has(sectionKey);
  }

  /**
   * Get all collapsed sections.
   */
  getCollapsedSections(): Set<string> {
    return new Set(this.collapsedSections);
  }

  /**
   * Get the layout positioner for direct layout operations.
   */
  getLayoutPositioner(): LinearLayoutPositioner {
    return this.layoutPositioner;
  }
}

/**
 * Factory function to create a SectionLayoutManager.
 */
export function createSectionLayoutManager(
  layoutCache: LayoutCache,
  options?: {
    horizontal?: boolean;
    estimatedItemSize?: number;
    estimatedHeaderSize?: number;
    estimatedFooterSize?: number;
    hasSectionFooters?: boolean;
  }
): SectionLayoutManager {
  return new SectionLayoutManagerImpl(layoutCache, options);
}
