import { NativeStack } from '@navigation/NativeStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FirstRun from '@screens/FirstRun';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  return (
    <Tab.Navigator screenOptions={{
        headerShown: false
    }}>
      <Tab.Screen name="Incomes" component={NativeStack} options={{
        title: 'Ingresos'
      }}  />
      <Tab.Screen name="OutcomeFix" component={NativeStack} options={{
        title: 'Gastos Fijos'
      }} />
      <Tab.Screen name="Home" component={FirstRun} options={{
        title: 'Inicio'
      }} />
      <Tab.Screen name="OutcomeVar" component={NativeStack} options={{
        title: 'Gastos Varios'
      }} />
      <Tab.Screen name="Settings" component={FirstRun} options={{
        title: 'Cuenta'
      }} />
    </Tab.Navigator>
  );
}
