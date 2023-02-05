
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '@screens/DashboardScreen';
import { FormScreen } from '@screens/FormScreen';
import { StackNavParams } from './types';

const Stack = createStackNavigator<StackNavParams>();

export const StackNav = () => {


  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{
        title: '',
        animationEnabled: false,
      }} />
      <Stack.Screen name="Form" component={FormScreen} options={{
        title: '',
        animationEnabled: false,
      }} />
    </Stack.Navigator>
  );
}