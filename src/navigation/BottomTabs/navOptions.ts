import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {accent, colors, primary} from '@constants/colors/colors';

export const bottomTabNavScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarHideOnKeyboard: true,
  tabBarStyle: {
    backgroundColor: colors[primary][0],
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    height: '10%',
  },
  tabBarActiveTintColor: colors[accent][1],
  tabBarInactiveTintColor: colors[accent][2],
  tabBarActiveBackgroundColor: `${colors[accent][1]}33`,
  tabBarItemStyle: {
    borderRadius: 50,
    marginVertical: 5,
    height: 50,
    width: 50,
    marginTop: 10,
    bottom: -27,

    // marginHorizontal: 15,
  },
  tabBarIconStyle: {
    marginTop: 0,
  },
};
