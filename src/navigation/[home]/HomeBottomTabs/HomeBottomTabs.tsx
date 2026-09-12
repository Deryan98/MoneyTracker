import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useBottomTabsRoutes} from './router';
import {bottomTabNavScreenOptions} from './navOptions';

const Tab = createBottomTabNavigator();

export const HomeBottomTabs = () => {
  const bottomTabsRoutes = useBottomTabsRoutes();

  return (
    <Tab.Navigator screenOptions={bottomTabNavScreenOptions()}>
      {bottomTabsRoutes.map(
        ({name, component, initialParams, options, listeners}, index) => (
          <Tab.Screen
            key={name + index}
            name={name}
            component={component}
            initialParams={initialParams}
            options={options}
            listeners={listeners}
          />
        ),
      )}
    </Tab.Navigator>
  );
};
