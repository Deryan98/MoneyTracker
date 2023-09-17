import {accent, colors, primary} from '@constants/colors/colors';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {drawerRouter} from './router';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();

export const DrawerNav = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
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
      }}>
      {drawerRouter.map(({name, component, options}, index) => (
        <Drawer.Screen
          key={name + index}
          name={name}
          component={component}
          options={options}
        />
      ))}
    </Drawer.Navigator>
  );
};
