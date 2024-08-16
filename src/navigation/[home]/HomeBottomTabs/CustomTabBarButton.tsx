import {accent, colors} from '@constants/colors/colors';
import React, {FC, ReactNode} from 'react';
import {View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface CustomTabBarButtonProps {
  children?: ReactNode;
  onPress?: any;
}
/* @deprecated */
const CustomTabBarButton: FC<CustomTabBarButtonProps> = ({
  children,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={{
        bottom: 30,
        width: 70,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}>
      <View
        style={{
          backgroundColor: colors[accent][0],
          width: 70,
          height: 70,
          borderRadius: 50,
          zIndex: 0,
        }}></View>
      {children}
    </TouchableOpacity>
  );
};

export default CustomTabBarButton;
