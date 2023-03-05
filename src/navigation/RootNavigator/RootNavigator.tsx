import { colors, primary, white } from '@constants/colors/colors';
import { BottomTabs } from '@navigation/BottomTabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  console.log('render')
  return (
    <Stack.Navigator >
      <Stack.Screen name="RootNav" component={BottomTabs} options={{
        headerShown: false
      }} />
    </Stack.Navigator>
  );
}