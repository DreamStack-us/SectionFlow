/**
 * Default configuration values for SectionFlow
 */

export const DEFAULT_ESTIMATED_ITEM_SIZE = 50;
export const DEFAULT_ESTIMATED_HEADER_SIZE = 40;
export const DEFAULT_ESTIMATED_FOOTER_SIZE = 0;

export const DEFAULT_DRAW_DISTANCE = 250; // pixels of overscan

export const DEFAULT_MAX_POOL_SIZE = 10; // max recycled cells per type

export const DEFAULT_ITEM_TYPE = 'default';
export const SECTION_HEADER_TYPE = '__section_header__';
export const SECTION_FOOTER_TYPE = '__section_footer__';

export const DEFAULT_END_REACHED_THRESHOLD = 0.5;

export const DEFAULT_VIEWABILITY_CONFIG = {
  minimumViewTime: 250,
  viewAreaCoveragePercentThreshold: 0,
  itemVisiblePercentThreshold: 50,
  waitForInteraction: false,
} as const;

export const PROGRESSIVE_RENDER_INITIAL_COUNT = 2;
export const PROGRESSIVE_RENDER_BATCH_SIZE = 5;

export const SCROLL_VELOCITY_THRESHOLD = 2; // pixels per ms for fast scroll detection

export const MEASUREMENT_DEBOUNCE_MS = 16; // ~1 frame at 60fps
