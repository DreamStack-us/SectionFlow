import type { ViewStyle, StyleProp } from 'react-native';

export interface Section<TItem> {
  key: string;
  title?: string;
  data: TItem[];
}

export interface SectionFlowProps<TItem> {
  sections: Section<TItem>[];
  renderItem: (info: { item: TItem; index: number; section: Section<TItem> }) => React.ReactElement;
  renderSectionHeader?: (info: { section: Section<TItem> }) => React.ReactElement;
  keyExtractor?: (item: TItem, index: number) => string;
  getItemType?: (item: TItem, index: number, section: Section<TItem>) => string;
  estimatedItemSize?: number;
  stickyHeaders?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: string[];
  onSectionToggle?: (sectionKey: string, collapsed: boolean) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export interface SectionFlowRef {
  scrollToSection: (sectionKey: string, animated?: boolean) => void;
  scrollToItem: (params: { sectionKey: string; itemIndex: number; animated?: boolean }) => void;
  toggleSection: (sectionKey: string) => void;
}
