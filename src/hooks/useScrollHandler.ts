import { useCallback, useRef, useMemo } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SCROLL_VELOCITY_THRESHOLD } from '../constants';

interface ScrollState {
  offset: number;
  velocity: number;
  direction: 'forward' | 'backward' | 'idle';
  isScrolling: boolean;
  contentSize: number;
  viewportSize: number;
}

interface UseScrollHandlerOptions {
  horizontal?: boolean;
  onScrollStateChange?: (state: ScrollState) => void;
  onEndReached?: (distanceFromEnd: number) => void;
  onEndReachedThreshold?: number;
}

interface ScrollHandlerResult {
  scrollState: React.RefObject<ScrollState>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange: (width: number, height: number) => void;
}

/**
 * Hook for tracking scroll state with velocity and direction detection.
 * Used for adaptive buffering and scroll optimization.
 */
export function useScrollHandler(options: UseScrollHandlerOptions = {}): ScrollHandlerResult {
  const {
    horizontal = false,
    onScrollStateChange,
    onEndReached,
    onEndReachedThreshold = 0.5,
  } = options;

  const scrollState = useRef<ScrollState>({
    offset: 0,
    velocity: 0,
    direction: 'idle',
    isScrolling: false,
    contentSize: 0,
    viewportSize: 0,
  });

  const lastOffset = useRef(0);
  const lastTimestamp = useRef(Date.now());
  const endReachedCalled = useRef(false);

  /**
   * Calculate velocity from consecutive scroll events.
   */
  const calculateVelocity = useCallback(
    (newOffset: number): number => {
      const now = Date.now();
      const timeDelta = now - lastTimestamp.current;

      if (timeDelta === 0) return scrollState.current.velocity;

      const offsetDelta = newOffset - lastOffset.current;
      const velocity = offsetDelta / timeDelta; // pixels per ms

      lastOffset.current = newOffset;
      lastTimestamp.current = now;

      return velocity;
    },
    []
  );

  /**
   * Determine scroll direction from velocity.
   */
  const getDirection = useCallback(
    (velocity: number): 'forward' | 'backward' | 'idle' => {
      if (Math.abs(velocity) < 0.1) return 'idle';
      return velocity > 0 ? 'forward' : 'backward';
    },
    []
  );

  /**
   * Check if we've reached the end and should trigger callback.
   */
  const checkEndReached = useCallback(() => {
    if (!onEndReached) return;

    const { offset, contentSize, viewportSize } = scrollState.current;
    const distanceFromEnd = contentSize - offset - viewportSize;
    const threshold = viewportSize * onEndReachedThreshold;

    if (distanceFromEnd <= threshold && !endReachedCalled.current) {
      endReachedCalled.current = true;
      onEndReached(distanceFromEnd);
    } else if (distanceFromEnd > threshold) {
      // Reset when scrolled away from end
      endReachedCalled.current = false;
    }
  }, [onEndReached, onEndReachedThreshold]);

  /**
   * Update scroll state and notify listeners.
   */
  const updateScrollState = useCallback(
    (event: NativeScrollEvent, isScrolling: boolean) => {
      const { contentOffset, contentSize, layoutMeasurement } = event;

      const offset = horizontal ? contentOffset.x : contentOffset.y;
      const size = horizontal ? contentSize.width : contentSize.height;
      const viewport = horizontal ? layoutMeasurement.width : layoutMeasurement.height;

      const velocity = calculateVelocity(offset);
      const direction = getDirection(velocity);

      scrollState.current = {
        offset,
        velocity,
        direction,
        isScrolling,
        contentSize: size,
        viewportSize: viewport,
      };

      onScrollStateChange?.(scrollState.current);
      checkEndReached();
    },
    [horizontal, calculateVelocity, getDirection, onScrollStateChange, checkEndReached]
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateScrollState(event.nativeEvent, scrollState.current.isScrolling);
    },
    [updateScrollState]
  );

  const onScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollState.current.isScrolling = true;
      updateScrollState(event.nativeEvent, true);
    },
    [updateScrollState]
  );

  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Scrolling might continue with momentum
      updateScrollState(event.nativeEvent, scrollState.current.isScrolling);
    },
    [updateScrollState]
  );

  const onMomentumScrollBegin = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollState.current.isScrolling = true;
      updateScrollState(event.nativeEvent, true);
    },
    [updateScrollState]
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollState.current.isScrolling = false;
      scrollState.current.direction = 'idle';
      scrollState.current.velocity = 0;
      updateScrollState(event.nativeEvent, false);
    },
    [updateScrollState]
  );

  const onContentSizeChange = useCallback((width: number, height: number) => {
    scrollState.current.contentSize = horizontal ? width : height;
  }, [horizontal]);

  return {
    scrollState,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onContentSizeChange,
  };
}

/**
 * Hook to calculate adaptive draw distance based on scroll velocity.
 * Increases buffer for fast scrolling to reduce blank areas.
 */
export function useAdaptiveDrawDistance(
  baseDistance: number,
  scrollVelocity: number
): number {
  return useMemo(() => {
    const absVelocity = Math.abs(scrollVelocity);

    if (absVelocity < SCROLL_VELOCITY_THRESHOLD) {
      return baseDistance;
    }

    // Scale draw distance with velocity (max 3x for very fast scrolling)
    const velocityMultiplier = Math.min(3, 1 + absVelocity / SCROLL_VELOCITY_THRESHOLD);
    return Math.round(baseDistance * velocityMultiplier);
  }, [baseDistance, scrollVelocity]);
}
