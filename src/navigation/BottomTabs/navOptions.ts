import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {heightDP} from '@utils/responsive';

type BottomTabNavType = (colors: any) => BottomTabNavigationOptions;

export const bottomTabNavScreenOptions: BottomTabNavType = (colors: any) => ({
  headerShown: false,
  tabBarHideOnKeyboard: true,
  tabBarStyle: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    height: heightDP(12),
  },
  tabBarActiveTintColor: colors.secondary,
  tabBarInactiveTintColor: colors.inactive,
  tabBarActiveBackgroundColor: `${colors.secondary}33`,
  tabBarItemStyle: {
    borderRadius: 50,
    marginVertical: 5,
    height: 50,
    width: 50,
    marginTop: 10,
    bottom: -27,
  },
  tabBarIconStyle: {
    marginTop: 0,
  },
});
