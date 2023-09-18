import {accent, colors} from '@constants/colors/colors';
import React, {FC, ReactNode} from 'react';
import {View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface CustomTabBarButtonProps {
  children?: ReactNode;
  onPress?: any;
}

const CustomTabBarButton: FC<CustomTabBarButtonProps> = ({
  children,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={{
        bottom: 30,
        width: 65,
        height: 70,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}>
      <View
        style={{
          backgroundColor: colors[accent][0],
          width: 35,
          height: 35,
          borderRadius: 50,
        }}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default CustomTabBarButton;
