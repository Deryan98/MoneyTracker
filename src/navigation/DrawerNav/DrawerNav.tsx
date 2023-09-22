import {createDrawerNavigator} from '@react-navigation/drawer';
import {drawerRouter} from './router';
import CustomDrawer from './CustomDrawer';
import {drawerNavScreenOptions} from './navOptions';
import {useTheme} from '@redshank/native';

const Drawer = createDrawerNavigator();

export const DrawerNav = () => {
  const {colors} = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={drawerNavScreenOptions(colors)}>
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
