import { accent, black, colors, primary, secondary, tertiary, white } from '@constants/colors/colors';
import { GlobalStyles } from '@constants/styles/global.styles';
import { BottomTabs } from '@navigation/BottomTabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  console.log('render')
  return (
    <Stack.Navigator >
      <Stack.Screen name="RootNav" component={BottomTabs} options={{
        title: 'Money Tracker',
        headerTintColor: colors[white],
        headerStyle: {
          backgroundColor: colors[primary]
        }
      }} />
    </Stack.Navigator>
  );
}