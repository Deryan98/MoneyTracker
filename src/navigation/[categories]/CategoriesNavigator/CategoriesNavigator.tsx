import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import {CategoriesTopTabs} from '../CategoriesTopTabs';
import {CreateCategory} from '@screens/[categories]';

export type CategoriesNavParams = {
  CategoriesList: undefined;
  CreateCategory: undefined;
};

export type CategoriesListNavigationProp = NativeStackNavigationProp<
  CategoriesNavParams,
  'CategoriesList'
>;

const Stack = createNativeStackNavigator<CategoriesNavParams>();

export const CategoriesNavigator = () => {
  console.log('render');
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CategoriesList"
        component={CategoriesTopTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateCategory"
        component={CreateCategory}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
