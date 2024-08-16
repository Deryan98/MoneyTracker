import {StackNavParams} from '@navigation/StackNav/types';
import {StackScreenProps} from '@react-navigation/stack';
import {ScreenContainer, KeyboardContainer, Spacer} from '@components/atoms';
import {useCreateCategory} from './useCreateCategory';
import {
  InputField,
  SymbolList,
  SaveAction,
  RadioField,
  Header,
} from './partials';
import {ScrollView} from 'react-native-gesture-handler';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}
//TODO: Add navigation to more icons
//TODO: Change the more icons location at the end of the icon list
//TODO: posibility to implement formik if needed
export const CreateCategory = ({navigation, route}: FormScreenProps) => {
  const {
    inputText,
    onChangeInputText,
    selectedIcon,
    error,
    setError,
    createCategory,
    handlePressItem,
  } = useCreateCategory();

  return (
    <KeyboardContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContainer>
          <Header
            title="Create Category"
            message="You can register all your categories through this form"
          />
          <InputField
            inputText={inputText}
            onChangeInputText={onChangeInputText}
            error={error}
          />
          <Spacer space={20} />
          <RadioField />
          <SymbolList
            selectedIcon={selectedIcon}
            onPressItem={handlePressItem}
          />
          <Spacer space={20} />
          <SaveAction onSave={createCategory} />
          <Spacer space={30} />
        </ScreenContainer>
      </ScrollView>
    </KeyboardContainer>
  );
};
