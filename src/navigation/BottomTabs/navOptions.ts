import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {accent, colors, primary} from '@constants/colors/colors';

export const bottomTabNavScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarHideOnKeyboard: true,
  tabBarStyle: {
    backgroundColor: colors[primary][0],
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    height: '7%',
  },
  tabBarActiveTintColor: colors[accent][1],
  tabBarInactiveTintColor: colors[accent][2],
  tabBarActiveBackgroundColor: `${colors[accent][1]}33`,
  tabBarItemStyle: {
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 5,
    marginVertical: 5,
    marginHorizontal: 15,
  },
};
