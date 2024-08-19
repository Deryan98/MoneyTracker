import {StackNavParams} from '@navigation/StackNav/types';
// import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {ScreenContainer, KeyboardContainer, Spacer} from '@components/atoms';
import {useCategories} from './useCategories';
import {CategoriesList} from './partials';
import {ScrollView} from 'react-native-gesture-handler';
import {CategoriesNavParams} from '@navigation/[categories]/CategoriesNavigator/types';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';

interface CategoriesScreenProps
  extends MaterialTopTabScreenProps<
    CategoriesNavParams,
    'CategoriesTopTabsNavigation'
  > {}
export const CategoriesScreen = ({
  navigation,
  route,
}: CategoriesScreenProps) => {
  route.params;

  console.log(route.params.financeType);

  const {
    inputText,
    onChangeInputText,
    selectedIcon,
    error,
    setError,
    createCategory,
    handlePressItem,
  } = useCategories();

  return (
    <KeyboardContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContainer>
          <CategoriesList
            selectedIcon={selectedIcon}
            onPressItem={handlePressItem}
          />
        </ScreenContainer>
      </ScrollView>
    </KeyboardContainer>
  );
};
