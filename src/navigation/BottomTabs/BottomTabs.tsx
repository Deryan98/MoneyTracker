import { accent, black, colors, gray, primary, secondary, tertiary, white } from '@constants/colors/colors';
import { fixedOutcomes } from '@data/fixedOutcomes';
import { incomes } from '@data/incomes';
import { varOutcomes } from '@data/varOutcomes';
import { StackNav } from '@navigation/StackNav';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FirstRun from '@screens/FirstRun';
import { FormCategory } from '@screens/FormCategory';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors[black],
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10
        },
        tabBarActiveTintColor: colors[primary],
        tabBarInactiveTintColor: colors[gray],
        tabBarActiveBackgroundColor: colors[secondary],
        tabBarItemStyle: {
          borderRadius: 10
        }

      }}
    >
      <Tab.Screen 
        name="Incomes" 
        component={StackNav}
        initialParams={{category: incomes}} 
        options={{
          title: 'Ingresos',
          tabBarIcon: ({color, size}) => (
            <FontAwesome name="money" color={color} size={size} />
          ),
        }}  
      />
      <Tab.Screen 
        name="OutcomeFix" 
        component={StackNav} 
        initialParams={{category: fixedOutcomes}}
        options={{
          title: 'Gastos Fijos',
          tabBarIcon: ({color, size}) => (
            <FontAwesome name="anchor" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={FirstRun}
        options={{
          title: 'Inicio',
          tabBarIcon: ({color, size}) => (
            <FontAwesome name="pie-chart" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="OutcomeVar" 
        component={StackNav}
        initialParams={{category: varOutcomes}} 
        options={{
          title: 'Gastos Varios',
          tabBarIcon: ({color, size}) => (
            <FontAwesome name="credit-card-alt" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen name="FormCategory" component={FormCategory} options={{
        title: 'Categorias',
        tabBarIcon: ({color, size}) => (
          <FontAwesome name="tags" color={color} size={size} />
        ),
      }} />
    </Tab.Navigator>
  );
}
