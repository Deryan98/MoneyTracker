import React from 'react';
import {ScrollView} from 'react-native-virtualized-view';
import {ScrollContainerProps} from './types';

export const ScrollContainer = ({children, style}: ScrollContainerProps) => {
  return (
    <ScrollView style={style} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
};
