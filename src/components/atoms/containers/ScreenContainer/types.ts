import {PropsWithChildren} from 'react';
import {ViewStyle} from 'react-native/types';

export interface ScreenContainerTypes extends PropsWithChildren {
  containerStyle?: ViewStyle;
}
