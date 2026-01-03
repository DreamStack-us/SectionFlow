import { useCallback, useRef, useLayoutEffect } from 'react';
import type { View, LayoutChangeEvent } from 'react-native';
import type { LayoutRect } from '../types';

interface UseMeasurementOptions {
  onMeasure: (layout: LayoutRect) => void;
  enabled?: boolean;
}

interface MeasurementResult {
  ref: React.RefObject<View | null>;
  onLayout: (event: LayoutChangeEvent) => void;
  measure: () => void;
}

/**
 * Hook for synchronous layout measurement using New Architecture features.
 *
 * In React Native's New Architecture with Fabric, useLayoutEffect runs synchronously
 * before paint, allowing us to measure and correct layouts without visible glitches.
 *
 * This hook provides:
 * 1. A ref to attach to the View
 * 2. An onLayout callback for initial/resize measurements
 * 3. A measure function for on-demand measurement
 */
export function useLayoutMeasurement(options: UseMeasurementOptions): MeasurementResult {
  const { onMeasure, enabled = true } = options;
  const ref = useRef<View>(null);
  const lastMeasurement = useRef<LayoutRect | null>(null);

  /**
   * Measure the view using measureInWindow for absolute positioning.
   * In New Architecture, this is synchronous when called in useLayoutEffect.
   */
  const measure = useCallback(() => {
    if (!enabled || !ref.current) return;

    ref.current.measureInWindow((x, y, width, height) => {
      // measureInWindow returns window coordinates
      // We primarily care about width/height for layout calculations
      const layout: LayoutRect = { x, y, width, height };

      // Only report if changed to avoid unnecessary updates
      if (
        !lastMeasurement.current ||
        lastMeasurement.current.width !== width ||
        lastMeasurement.current.height !== height
      ) {
        lastMeasurement.current = layout;
        onMeasure(layout);
      }
    });
  }, [enabled, onMeasure]);

  /**
   * Handle layout events from React Native's onLayout prop.
   * This fires on mount and whenever the layout changes.
   */
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!enabled) return;

      const { x, y, width, height } = event.nativeEvent.layout;
      const layout: LayoutRect = { x, y, width, height };

      // Only report if changed
      if (
        !lastMeasurement.current ||
        lastMeasurement.current.width !== width ||
        lastMeasurement.current.height !== height
      ) {
        lastMeasurement.current = layout;
        onMeasure(layout);
      }
    },
    [enabled, onMeasure]
  );

  return { ref, onLayout, measure };
}

/**
 * Hook for measuring a cell's layout and reporting to the layout system.
 * Uses synchronous measurement in New Architecture for smooth corrections.
 */
export function useCellMeasurement(
  cellKey: string,
  onCellMeasured: (key: string, layout: LayoutRect) => void,
  enabled = true
): MeasurementResult {
  const handleMeasure = useCallback(
    (layout: LayoutRect) => {
      onCellMeasured(cellKey, layout);
    },
    [cellKey, onCellMeasured]
  );

  return useLayoutMeasurement({
    onMeasure: handleMeasure,
    enabled,
  });
}

/**
 * Hook for progressive rendering - measures initial items and expands.
 * Implements FlashList v2's progressive rendering strategy.
 */
export function useProgressiveRender(
  totalItems: number,
  initialCount: number,
  batchSize: number,
  onRenderCountChange: (count: number) => void
): {
  renderCount: number;
  onItemMeasured: (index: number) => void;
} {
  const renderCount = useRef(Math.min(initialCount, totalItems));
  const measuredCount = useRef(0);

  const onItemMeasured = useCallback(
    (index: number) => {
      measuredCount.current++;

      // If all current items are measured, expand render window
      if (measuredCount.current >= renderCount.current && renderCount.current < totalItems) {
        const newCount = Math.min(renderCount.current + batchSize, totalItems);
        renderCount.current = newCount;
        onRenderCountChange(newCount);
      }
    },
    [totalItems, batchSize, onRenderCountChange]
  );

  return {
    renderCount: renderCount.current,
    onItemMeasured,
  };
}
