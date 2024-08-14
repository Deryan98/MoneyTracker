import {black} from '@constants/colors/colors';
import {GlobalStyles} from '@constants/styles/global.styles';
import React from 'react';
import {Text, View} from 'react-native';
import styles from './styles';
import {HeadingsProps} from './types';

export const Headings = ({
  children,
  headingSize,
  color = black,
  fontWeight = 'normal',
  containerStyle = {},
}: HeadingsProps) => {
  let fontSize;

  switch (headingSize) {
    case 'H1':
      fontSize = 32;
      break;
    case 'H2':
      fontSize = 26;
      break;
    case 'H3':
      fontSize = 22;
      break;
    case 'H4':
      fontSize = 20;
      break;
    case 'H5':
      fontSize = 14;
      break;
    case 'H6':
      fontSize = 12;
      break;
    default:
      break;
  }

  return (
    <View
      style={[
        GlobalStyles.alignItemsCenter,
        GlobalStyles.width100percent,
        styles.container,
        containerStyle,
      ]}>
      <Text style={{fontSize, color, fontWeight}}>{children}</Text>
    </View>
  );
};
