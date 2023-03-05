import {colors, primary, white} from '@constants/colors/colors';
import {RootNavigator} from '@navigation/RootNavigator';
import {createDrawerNavigator} from '@react-navigation/drawer';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { FormCategory } from '@screens/FormCategory';

const Drawer = createDrawerNavigator();

export const DrawerNav = () => {
  return (
    <Drawer.Navigator screenOptions={{
      drawerActiveTintColor: colors['tertiary'],
      drawerInactiveTintColor: colors['inactive'],
      // drawerInactiveBackgroundColor: 'red',
      // drawerActiveBackgroundColor: colors[primary],
      headerTintColor: colors[white],
      headerStyle: {
        backgroundColor: colors[primary],
      },
      drawerStyle: {
        backgroundColor: colors[primary],
        width: '50%'
      },
      title: 'Money Tracker',
      drawerType:'back'
    }}>
      <Drawer.Screen
        name="DrawerNav"
        component={RootNavigator}
        options={{
          drawerLabel: 'Inicio',
          drawerIcon: ({color, focused, size}) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="FormCategory"
        component={FormCategory}
        options={{
          drawerLabel: 'Categories',
          drawerIcon: ({color, focused, size}) => (
            <FontAwesome name="tags" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
