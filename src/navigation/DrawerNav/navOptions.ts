import {DrawerNavigationOptions} from '@react-navigation/drawer';

type DrawerNavOptionsType = (colors: any) => DrawerNavigationOptions;

export const drawerNavScreenOptions: DrawerNavOptionsType = colors => ({
  headerShown: false,
  drawerType: 'slide',
  drawerActiveTintColor: colors.accent,
  drawerInactiveTintColor: colors.secondary,
  headerTintColor: colors.accent,
  headerStyle: {
    backgroundColor: colors.primary,
  },
  drawerStyle: {
    backgroundColor: colors.primary,
    width: '50%',
  },
  drawerItemStyle: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
  },
});
