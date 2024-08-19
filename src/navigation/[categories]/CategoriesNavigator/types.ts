import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type CategoriesNavParams = {
  CategoriesTopTabsNavigation: undefined;
  CreateCategory: undefined;
};

export type CreateCategoryNavigationProp = NativeStackNavigationProp<
  CategoriesNavParams,
  'CreateCategory'
>;
