import {Animated, View, TouchableOpacity} from 'react-native';

import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import {categoriesTopTabsRouter} from './router';
import {colors, primary} from '@constants/colors/colors';
import {useTheme} from '@redshank/native';
import Header from '@screens/[categories]/components/Header/Header';
import {CategoriesScreen} from '@screens/[categories]';

export type CategoriesTopTabsNavigatorParams = {
  Expenses: {
    financeType: 'expenses';
  };
  Incomes: {
    financeType: 'incomes';
  };
};

const Tab = createMaterialTopTabNavigator<CategoriesTopTabsNavigatorParams>();

export const CategoriesTopTabsNavigator = () => {
  const {colors: colorTheme} = useTheme();
  return (
    <>
      <View style={{paddingHorizontal: 15}}>
        <Header title="List Categories" />
      </View>
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={{
          tabBarActiveTintColor: colorTheme.accent,
          tabBarInactiveTintColor: colorTheme.secondary,
          //   tabBarActiveBackgroundColor: `${colors.secondary}33`,
          //   tabBarPressColor: `${colorTheme.secondary}33`,
          tabBarLabelStyle: {fontSize: 12, fontWeight: '900'},
          //   tabBarItemStyle: {width: 100},

          tabBarStyle: {
            position: 'relative',
            justifyContent: 'center',
            alignSelf: 'center',
            backgroundColor: colors[primary][0],
            elevation: 0,
            width: '100%',
            height: 50,
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
          },
          tabBarItemStyle: {
            // backgroundColor: 'red',
            // borderRadius: 15,
          },
          tabBarContentContainerStyle: {
            // backgroundColor: 'red',
          },
          tabBarIndicatorStyle: {
            backgroundColor: `${colorTheme.secondary}33`,
            height: 50,
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            // opacity: 0.3,
            // display: 'none',
          },
        }}>
        <Tab.Screen
          name="Expenses"
          component={CategoriesScreen}
          initialParams={{financeType: 'expenses'}}
          options={{
            tabBarLabel: 'Expenses',
          }}
        />
        <Tab.Screen
          name="Incomes"
          component={CategoriesScreen}
          initialParams={{financeType: 'incomes'}}
          options={{
            tabBarLabel: 'Incomes',
          }}
        />
      </Tab.Navigator>
    </>
  );
};
