import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle, LayoutChangeEvent } from 'react-native';
import type { LayoutRect, RecycledCell } from '../types';

interface RecyclerCellProps {
  cell: RecycledCell;
  layout: LayoutRect;
  children: React.ReactNode;
  onLayout: (key: string, flatIndex: number, layout: LayoutRect) => void;
  debug?: boolean;
}

/**
 * RecyclerCell wraps each item with absolute positioning.
 * This is the fundamental unit of the recycling system.
 *
 * Key responsibilities:
 * 1. Position the item at the correct x/y coordinates
 * 2. Report layout measurements back to the system
 * 3. Maintain stable identity for recycling (via key)
 */
function RecyclerCellComponent({
  cell,
  layout,
  children,
  onLayout,
  debug = false,
}: RecyclerCellProps): React.ReactElement {
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      onLayout(cell.key, cell.flatIndex, { x, y, width, height });
    },
    [cell.key, cell.flatIndex, onLayout]
  );

  const positionStyle: ViewStyle = {
    position: 'absolute',
    left: layout.x,
    top: layout.y,
    width: layout.width,
    // Height is determined by content - don't constrain it
    // This allows for dynamic sizing
  };

  return (
    <View
      style={[positionStyle, debug && styles.debug]}
      onLayout={handleLayout}
      // Key prop for React reconciliation (handled by parent)
    >
      {children}
    </View>
  );
}

const styles: { debug: ViewStyle } = StyleSheet.create({
  debug: {
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
});

/**
 * Memoized cell component to prevent unnecessary re-renders.
 * Only re-renders when:
 * - Cell key changes (different item)
 * - Layout position changes
 * - Children change (new render)
 */
export const RecyclerCell: React.MemoExoticComponent<typeof RecyclerCellComponent> = memo(
  RecyclerCellComponent,
  (prevProps, nextProps) => {
    // Custom comparison for performance
    return (
      prevProps.cell.key === nextProps.cell.key &&
      prevProps.cell.flatIndex === nextProps.cell.flatIndex &&
      prevProps.layout.x === nextProps.layout.x &&
      prevProps.layout.y === nextProps.layout.y &&
      prevProps.layout.width === nextProps.layout.width &&
      prevProps.layout.height === nextProps.layout.height &&
      prevProps.children === nextProps.children &&
      prevProps.debug === nextProps.debug
    );
  }
);

RecyclerCell.displayName = 'RecyclerCell';
