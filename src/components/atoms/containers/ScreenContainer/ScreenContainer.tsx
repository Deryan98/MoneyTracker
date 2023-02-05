import React from 'react';
import {View, KeyboardAvoidingView, Platform} from 'react-native';
import styles from './styles';
import { ScreenContainerTypes } from './types';

export const ScreenContainer = ({
  children,
  containerStyle,
}: ScreenContainerTypes) => {
  return (
    <View style={[styles.screenContainer, containerStyle]}>
      {children}
    </View>
  );
};
