import React from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';
import styles from './styles';
import {KeyboardContainerTypes} from './types';

export const KeyboardContainer = ({
  children,
  containerStyle,
}: KeyboardContainerTypes) => {
  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingViewContainer, containerStyle]}
      keyboardVerticalOffset={Platform.select({ios: 0, android: 500})}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled>
      {children}
    </KeyboardAvoidingView>
  );
};
