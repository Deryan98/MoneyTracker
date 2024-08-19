import {StackNavParams} from '@navigation/StackNav/types';
import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {ScreenContainer, KeyboardContainer, Spacer} from '@components/atoms';
import {useCategories} from './useCategories';
import {CategoriesList} from './partials';
import {ScrollView} from 'react-native-gesture-handler';
import {CategoriesNavParams} from '@navigation/[categories]/CategoriesNavigator/CategoriesNavigator';
interface CategoriesScreenProps
  extends StackScreenProps<CategoriesNavParams, 'CategoriesList'> {}
//TODO: Add navigation to more icons
//TODO: Change the more icons location at the end of the icon list
//TODO: posibility to implement formik if needed
export const CategoriesScreen = ({
  navigation,
  route,
}: CategoriesScreenProps) => {
  const {
    inputText,
    onChangeInputText,
    selectedIcon,
    error,
    setError,
    createCategory,
    handlePressItem,
  } = useCategories();

  navigation.navigate('CategoriesList');

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
