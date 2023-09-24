import React from 'react';
import {ScrollView} from 'react-native';
import {ScrollContainerProps} from './types';

export const ScrollContainer = ({children, style}: ScrollContainerProps) => {
  return (
    <ScrollView style={style} nestedScrollEnabled>
      {children}
    </ScrollView>
  );
};
