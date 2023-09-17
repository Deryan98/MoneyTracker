import {
  accent,
  black,
  colors,
  gray,
  primary,
  secondary,
  tertiary,
  white,
} from '@constants/colors/colors';
import {fixedOutcomes} from '@data/fixedOutcomes';
import {incomes} from '@data/incomes';
import {varOutcomes} from '@data/varOutcomes';
import {StackNav} from '@navigation/StackNav';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FirstRun from '@screens/FirstRun';
import {FormCategory} from '@screens/FormCategory';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
import {faLayerGroup} from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import {faPiggyBank} from '@fortawesome/free-solid-svg-icons/faPiggyBank';
import {faChartPie} from '@fortawesome/free-solid-svg-icons/faChartPie';

import {faBookBookmark} from '@fortawesome/free-solid-svg-icons/faBookBookmark';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors[primary][0],
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          height: '10%',
        },
        tabBarActiveTintColor: colors[primary][0],
        tabBarInactiveTintColor: colors[accent][1],
        tabBarActiveBackgroundColor: colors[accent][1],
        tabBarItemStyle: {
          borderTopRightRadius: 50,
          borderTopLeftRadius: 50,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          paddingVertical: 15,
          marginVertical: 5,
          marginHorizontal: 15,
        },
      }}>
      <Tab.Screen
        name="Incomes"
        component={StackNav}
        initialParams={{category: incomes}}
        options={{
          title: 'Resumen',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faHome} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="OutcomeFix"
        component={StackNav}
        initialParams={{category: fixedOutcomes}}
        options={{
          title: 'Accounts',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faLayerGroup} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="OutcomeFix2"
        component={StackNav}
        initialParams={{category: fixedOutcomes}}
        options={{
          title: 'Categories',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faBookBookmark} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={FirstRun}
        options={{
          title: 'Budgets',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faPiggyBank} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="OutcomeVar"
        component={StackNav}
        initialParams={{category: varOutcomes}}
        options={{
          title: 'Analysis',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faChartPie} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
