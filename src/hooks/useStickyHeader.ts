import { useMemo, useRef, useCallback } from 'react';
import type { SectionLayoutInfo, LayoutRect } from '../types';

interface StickyHeaderState {
  sectionKey: string | null;
  sectionIndex: number;
  translateY: number;
  isSticky: boolean;
  headerLayout: LayoutRect | null;
}

interface UseStickyHeaderOptions {
  sectionLayouts: SectionLayoutInfo[];
  scrollOffset: number;
  viewportHeight: number;
  horizontal?: boolean;
  enabled?: boolean;
}

/**
 * Hook for computing sticky header positioning.
 * Handles the "pushing" effect when the next section header approaches.
 */
export function useStickyHeader(options: UseStickyHeaderOptions): StickyHeaderState {
  const { sectionLayouts, scrollOffset, viewportHeight, horizontal = false, enabled = true } = options;

  return useMemo(() => {
    if (!enabled || sectionLayouts.length === 0) {
      return {
        sectionKey: null,
        sectionIndex: -1,
        translateY: 0,
        isSticky: false,
        headerLayout: null,
      };
    }

    // Find the section whose header should be sticky
    // This is the last section whose header has scrolled past the top
    let currentSection: SectionLayoutInfo | null = null;
    let nextSection: SectionLayoutInfo | null = null;

    for (let i = 0; i < sectionLayouts.length; i++) {
      const section = sectionLayouts[i];
      const headerStart = horizontal ? section.headerLayout.x : section.headerLayout.y;

      if (headerStart <= scrollOffset) {
        currentSection = section;
        nextSection = sectionLayouts[i + 1] ?? null;
      } else {
        break;
      }
    }

    if (!currentSection) {
      return {
        sectionKey: null,
        sectionIndex: -1,
        translateY: 0,
        isSticky: false,
        headerLayout: null,
      };
    }

    const headerSize = horizontal
      ? currentSection.headerLayout.width
      : currentSection.headerLayout.height;

    // Calculate push offset if next section is approaching
    let translateY = 0;

    if (nextSection) {
      const nextHeaderStart = horizontal
        ? nextSection.headerLayout.x
        : nextSection.headerLayout.y;

      const pushPoint = nextHeaderStart - headerSize;

      if (scrollOffset > pushPoint) {
        // Push the current header up as next section approaches
        translateY = pushPoint - scrollOffset;
      }
    }

    return {
      sectionKey: currentSection.sectionKey,
      sectionIndex: currentSection.sectionIndex,
      translateY,
      isSticky: true,
      headerLayout: currentSection.headerLayout,
    };
  }, [sectionLayouts, scrollOffset, viewportHeight, horizontal, enabled]);
}

/**
 * Hook for tracking multiple sticky headers (e.g., for multi-level sections).
 */
export function useMultipleStickyHeaders(
  sectionLayouts: SectionLayoutInfo[],
  scrollOffset: number,
  levels: number = 1
): StickyHeaderState[] {
  return useMemo(() => {
    // For now, just return single sticky header in array
    // Future: support nested section levels
    const states: StickyHeaderState[] = [];

    if (sectionLayouts.length === 0) {
      return states;
    }

    let currentSection: SectionLayoutInfo | null = null;
    let nextSection: SectionLayoutInfo | null = null;

    for (let i = 0; i < sectionLayouts.length; i++) {
      const section = sectionLayouts[i];
      const headerStart = section.headerLayout.y;

      if (headerStart <= scrollOffset) {
        currentSection = section;
        nextSection = sectionLayouts[i + 1] ?? null;
      } else {
        break;
      }
    }

    if (currentSection) {
      const headerSize = currentSection.headerLayout.height;
      let translateY = 0;

      if (nextSection) {
        const nextHeaderStart = nextSection.headerLayout.y;
        const pushPoint = nextHeaderStart - headerSize;

        if (scrollOffset > pushPoint) {
          translateY = pushPoint - scrollOffset;
        }
      }

      states.push({
        sectionKey: currentSection.sectionKey,
        sectionIndex: currentSection.sectionIndex,
        translateY,
        isSticky: true,
        headerLayout: currentSection.headerLayout,
      });
    }

    return states;
  }, [sectionLayouts, scrollOffset, levels]);
}

/**
 * Hook for determining sticky header opacity during transitions.
 */
export function useStickyHeaderOpacity(
  stickyState: StickyHeaderState,
  fadeDistance: number = 20
): number {
  return useMemo(() => {
    if (!stickyState.isSticky) return 0;
    if (stickyState.translateY >= 0) return 1;

    // Fade out as header is pushed up
    const fadeProgress = Math.abs(stickyState.translateY) / fadeDistance;
    return Math.max(0, 1 - fadeProgress);
  }, [stickyState.isSticky, stickyState.translateY, fadeDistance]);
}
