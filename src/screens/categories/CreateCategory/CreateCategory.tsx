import {StackNavParams} from '@navigation/StackNav/types';
import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {ScreenContainer, KeyboardContainer, Spacer} from '@components/atoms';
import {useFormCategory} from './useFormCategory';
import {
  Header,
  InputField,
  SymbolList,
  SaveAction,
  RadioField,
} from './partials';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}
//TODO: adjust input fontSize
//TODO: Fix Input missing value when changing selected icon
//TODO: Add navigation to more icons
//TODO: posibility to implement formik if needed
//TODO: Implement goback navigation
export const CreateCategory = ({navigation, route}: FormScreenProps) => {
  const {
    inputText,
    onChangeInputText,
    selectedIcon,
    error,
    setError,
    createCategory,
    handlePressItem,
  } = useFormCategory();

  return (
    <KeyboardContainer>
      <ScreenContainer>
        <Header />
        <InputField
          inputText={inputText}
          onChangeInputText={onChangeInputText}
          error={error}
        />
        <Spacer space={20} />
        <RadioField />
        <SymbolList selectedIcon={selectedIcon} onPressItem={handlePressItem} />
        <Spacer space={20} />
        <SaveAction onSave={createCategory} />
      </ScreenContainer>
    </KeyboardContainer>
  );
};
