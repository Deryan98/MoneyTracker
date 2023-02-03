import { BottomTabs } from '@navigation/BottomTabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      // headerShown: false
    }}>
      <Stack.Screen name="RootNav" component={BottomTabs} options={{
        title: 'Money Tracker'
      }} />
    </Stack.Navigator>
  );
}