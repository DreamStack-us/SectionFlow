import React, { forwardRef } from 'react';
import { View, Text } from 'react-native';
import type { SectionFlowProps, SectionFlowRef } from './types';

function SectionFlowInner<TItem>(
  props: SectionFlowProps<TItem>,
  ref: React.ForwardedRef<SectionFlowRef>
) {
  // TODO: Implement cell recycling engine
  return (
    <View style={props.style}>
      <Text>SectionFlow - Implementation in progress</Text>
    </View>
  );
}

export const SectionFlow = forwardRef(SectionFlowInner) as <TItem>(
  props: SectionFlowProps<TItem> & { ref?: React.ForwardedRef<SectionFlowRef> }
) => React.ReactElement;
