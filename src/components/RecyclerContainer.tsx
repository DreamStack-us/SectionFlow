import React, { memo, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle, LayoutChangeEvent } from 'react-native';
import { RecyclerCell } from './RecyclerCell';
import type {
  FlattenedItem,
  LayoutRect,
  RecycledCell,
  RenderItemInfo,
  RenderSectionHeaderInfo,
  RenderSectionFooterInfo,
} from '../types';

interface RecyclerContainerProps<TItem> {
  flattenedData: FlattenedItem<TItem>[];
  visibleRange: { startIndex: number; endIndex: number };
  getLayoutForIndex: (index: number) => LayoutRect;
  getCell: (flatIndex: number) => RecycledCell;
  contentSize: { width: number; height: number };
  renderItem: (info: RenderItemInfo<TItem>) => React.ReactElement | null;
  renderSectionHeader?: (info: RenderSectionHeaderInfo<TItem>) => React.ReactElement | null;
  renderSectionFooter?: (info: RenderSectionFooterInfo<TItem>) => React.ReactElement | null;
  onCellLayout: (key: string, flatIndex: number, layout: LayoutRect) => void;
  horizontal?: boolean;
  debug?: boolean;
}

/**
 * RecyclerContainer manages the absolute-positioned content area.
 * It renders only the visible items within the current scroll window.
 *
 * Key responsibilities:
 * 1. Set content size for scroll container
 * 2. Render visible items at correct positions
 * 3. Coordinate cell recycling
 */
function RecyclerContainerComponent<TItem>({
  flattenedData,
  visibleRange,
  getLayoutForIndex,
  getCell,
  contentSize,
  renderItem,
  renderSectionHeader,
  renderSectionFooter,
  onCellLayout,
  horizontal = false,
  debug = false,
}: RecyclerContainerProps<TItem>): React.ReactElement {
  const { startIndex, endIndex } = visibleRange;

  // Render visible cells
  const cells = useMemo(() => {
    const result: React.ReactElement[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const item = flattenedData[i];
      if (!item) continue;

      const cell = getCell(i);
      const layout = getLayoutForIndex(i);

      let content: React.ReactElement | null = null;

      switch (item.type) {
        case 'section-header':
          if (renderSectionHeader) {
            content = renderSectionHeader({
              section: item.section,
              sectionIndex: item.sectionIndex,
            });
          }
          break;

        case 'section-footer':
          if (renderSectionFooter) {
            content = renderSectionFooter({
              section: item.section,
              sectionIndex: item.sectionIndex,
            });
          }
          break;

        case 'item':
          if (item.item !== null) {
            content = renderItem({
              item: item.item,
              index: item.itemIndex,
              section: item.section,
              sectionIndex: item.sectionIndex,
            });
          }
          break;
      }

      if (content) {
        result.push(
          <RecyclerCell
            key={cell.key}
            cell={cell}
            layout={layout}
            onLayout={onCellLayout}
            debug={debug}
          >
            {content}
          </RecyclerCell>
        );
      }
    }

    return result;
  }, [
    startIndex,
    endIndex,
    flattenedData,
    getCell,
    getLayoutForIndex,
    renderItem,
    renderSectionHeader,
    renderSectionFooter,
    onCellLayout,
    debug,
  ]);

  const containerStyle: ViewStyle = useMemo(
    () => ({
      width: contentSize.width || '100%',
      height: contentSize.height,
      position: 'relative',
    }),
    [contentSize.width, contentSize.height]
  );

  return (
    <View style={[containerStyle, debug && styles.debug]}>
      {cells}
    </View>
  );
}

const styles = StyleSheet.create({
  debug: {
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
});

export const RecyclerContainer = memo(RecyclerContainerComponent) as typeof RecyclerContainerComponent;
