import {DrawerNavigationOptions} from '@react-navigation/drawer';
import {accent, colors, primary} from '@constants/colors/colors';

export const drawerNavScreenOptions: DrawerNavigationOptions = {
  title: 'Money Tracker',
  drawerType: 'slide',
  drawerActiveTintColor: colors[accent][0],
  drawerInactiveTintColor: colors[accent][2],
  headerTintColor: colors[accent][0],
  headerStyle: {
    backgroundColor: colors[primary][0],
  },
  drawerStyle: {
    backgroundColor: colors[primary][0],
    width: '50%',
  },
  drawerItemStyle: {
    borderBottomColor: colors[primary][0],
    borderBottomWidth: 2,
  },
};
