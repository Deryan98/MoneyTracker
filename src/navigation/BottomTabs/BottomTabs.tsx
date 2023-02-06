import { StackNav } from '@navigation/NativeStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FirstRun from '@screens/FirstRun';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#e91e63'
      }}
    >
      <Tab.Screen name="Incomes" component={StackNav} options={{
        title: 'Ingresos',
        tabBarIcon: ({color, size}) => (
          <FontAwesome name="money" color={color} size={size} />
        ),
      }}  />
      <Tab.Screen name="OutcomeFix" component={StackNav} options={{
        title: 'Gastos Fijos',
        tabBarIcon: ({color, size}) => (
          <FontAwesome name="anchor" color={color} size={size} />
        ),
      }} />
      <Tab.Screen name="Home" component={FirstRun} options={{
        title: 'Inicio',
        tabBarIcon: ({color, size}) => (
          <FontAwesome name="pie-chart" color={color} size={size} />
        ),
      }} />
      <Tab.Screen name="OutcomeVar" component={StackNav} options={{
        title: 'Gastos Varios',
        tabBarIcon: ({color, size}) => (
          <FontAwesome name="credit-card-alt" color={color} size={size} />
        ),
      }} />
      <Tab.Screen name="Settings" component={FirstRun} options={{
        title: 'Cuenta',
        tabBarIcon: ({color, size}) => (
          <FontAwesome name="user-circle" color={color} size={size} />
        ),
      }} />
    </Tab.Navigator>
  );
}
