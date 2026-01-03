import React, { createContext, useContext, useMemo, useRef, useCallback } from 'react';
import type {
  Section,
  FlattenedItem,
  LayoutRect,
  SectionFlowProps,
  RenderItemInfo,
  RenderSectionHeaderInfo,
  RenderSectionFooterInfo,
} from '../types';
import type { SectionLayoutManager } from '../core/SectionLayoutManager';
import type { LayoutCache } from '../core/LayoutCache';

/**
 * Internal context value for SectionFlow components.
 */
interface SectionFlowContextValue<TItem> {
  // Data
  sections: Section<TItem>[];
  flattenedData: FlattenedItem<TItem>[];

  // Layout
  layoutManager: SectionLayoutManager;
  layoutCache: LayoutCache;
  horizontal: boolean;

  // State
  collapsedSections: Set<string>;
  scrollOffset: number;
  viewportWidth: number;
  viewportHeight: number;

  // Config
  stickySectionHeadersEnabled: boolean;
  estimatedItemSize: number;
  drawDistance: number;
  debug: boolean;

  // Render functions
  renderItem: (info: RenderItemInfo<TItem>) => React.ReactElement | null;
  renderSectionHeader?: (info: RenderSectionHeaderInfo<TItem>) => React.ReactElement | null;
  renderSectionFooter?: (info: RenderSectionFooterInfo<TItem>) => React.ReactElement | null;

  // Callbacks
  onCellMeasured: (key: string, flatIndex: number, layout: LayoutRect) => void;
  onSectionToggle?: (sectionKey: string, collapsed: boolean) => void;

  // Item type resolution
  getItemType: (flatIndex: number) => string;
}

// Create context with undefined default (will always be provided by SectionFlowProvider)
const SectionFlowContext = createContext<SectionFlowContextValue<unknown> | undefined>(undefined);

/**
 * Hook to access SectionFlow context.
 * Must be used within a SectionFlowProvider.
 */
export function useSectionFlowContext<TItem>(): SectionFlowContextValue<TItem> {
  const context = useContext(SectionFlowContext);
  if (!context) {
    throw new Error('useSectionFlowContext must be used within a SectionFlowProvider');
  }
  return context as SectionFlowContextValue<TItem>;
}

interface SectionFlowProviderProps<TItem> {
  children: React.ReactNode;
  sections: Section<TItem>[];
  flattenedData: FlattenedItem<TItem>[];
  layoutManager: SectionLayoutManager;
  layoutCache: LayoutCache;
  horizontal: boolean;
  collapsedSections: Set<string>;
  scrollOffset: number;
  viewportWidth: number;
  viewportHeight: number;
  stickySectionHeadersEnabled: boolean;
  estimatedItemSize: number;
  drawDistance: number;
  debug: boolean;
  renderItem: (info: RenderItemInfo<TItem>) => React.ReactElement | null;
  renderSectionHeader?: (info: RenderSectionHeaderInfo<TItem>) => React.ReactElement | null;
  renderSectionFooter?: (info: RenderSectionFooterInfo<TItem>) => React.ReactElement | null;
  onCellMeasured: (key: string, flatIndex: number, layout: LayoutRect) => void;
  onSectionToggle?: (sectionKey: string, collapsed: boolean) => void;
  getItemType: (flatIndex: number) => string;
}

/**
 * Provider component for SectionFlow context.
 */
export function SectionFlowProvider<TItem>({
  children,
  sections,
  flattenedData,
  layoutManager,
  layoutCache,
  horizontal,
  collapsedSections,
  scrollOffset,
  viewportWidth,
  viewportHeight,
  stickySectionHeadersEnabled,
  estimatedItemSize,
  drawDistance,
  debug,
  renderItem,
  renderSectionHeader,
  renderSectionFooter,
  onCellMeasured,
  onSectionToggle,
  getItemType,
}: SectionFlowProviderProps<TItem>): React.ReactElement {
  const value = useMemo(
    (): SectionFlowContextValue<TItem> => ({
      sections,
      flattenedData,
      layoutManager,
      layoutCache,
      horizontal,
      collapsedSections,
      scrollOffset,
      viewportWidth,
      viewportHeight,
      stickySectionHeadersEnabled,
      estimatedItemSize,
      drawDistance,
      debug,
      renderItem,
      renderSectionHeader,
      renderSectionFooter,
      onCellMeasured,
      onSectionToggle,
      getItemType,
    }),
    [
      sections,
      flattenedData,
      layoutManager,
      layoutCache,
      horizontal,
      collapsedSections,
      scrollOffset,
      viewportWidth,
      viewportHeight,
      stickySectionHeadersEnabled,
      estimatedItemSize,
      drawDistance,
      debug,
      renderItem,
      renderSectionHeader,
      renderSectionFooter,
      onCellMeasured,
      onSectionToggle,
      getItemType,
    ]
  );

  return (
    <SectionFlowContext.Provider value={value as SectionFlowContextValue<unknown>}>
      {children}
    </SectionFlowContext.Provider>
  );
}
