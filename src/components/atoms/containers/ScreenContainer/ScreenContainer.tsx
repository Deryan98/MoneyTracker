import React, {FC} from 'react';
import {View} from 'react-native';
import styles from './styles';
import {ScreenContainerTypes} from './types';

export const ScreenContainer: FC<ScreenContainerTypes> = ({
  children,
  containerStyle,
}) => {
  return (
    <View style={[styles.screenContainer, containerStyle]}>{children}</View>
  );
};
