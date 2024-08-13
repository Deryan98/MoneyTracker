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
import {StackNavParams} from '@navigation/StackNav/types';
import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet, View, TextInput, TouchableOpacity} from 'react-native';
import {
  ScreenContainer,
  KeyboardContainer,
  ScrollContainer,
  Spacer,
} from '@components/atoms';
import Icon from 'react-native-vector-icons/FontAwesome';
import {icons} from '@data/icons';
import {iconType} from '@data/iconType';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {GlobalStyles} from '@constants/styles/global.styles';
import {useFormCategory} from './useFormCategory';
import {ScreenTemplate} from '@components/templates/ScreenTemplate';
import {MainHeader} from '@components/molecules/Headers/MainHeader';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}

export const FormCategory = ({navigation, route}: FormScreenProps) => {
  const {
    inputText,
    onChangeInputText,
    visibleInputText,
    selectedIcon,
    error,
    setError,
    createCategory,
    handlePressItem,
  } = useFormCategory();

  return (
    <KeyboardContainer>
      <ScreenContainer>
        <MainHeader title="Categories" />
        {/* <Spacer space={10} /> */}
        <Headings
          headingSize={'H5'}
          color={colors[black][0]}
          containerStyle={{paddingLeft: 20, alignItems: 'flex-start'}}>
          You can register all your categories through this form
        </Headings>
        <Spacer space={30} />

        <TextInput
          value={inputText}
          style={inputStyles.textInput}
          onChangeText={onChangeInputText}
          placeholder="Add category name"
          placeholderTextColor={colors[gray][0]}
          keyboardType="default"
        />
        <Headings
          containerStyle={{
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
          headingSize="H6"
          color={colors[secondary][0]}>
          {error}
        </Headings>

        <Headings
          headingSize={'H4'}
          color={colors[black][0]}
          containerStyle={{paddingLeft: 15, alignItems: 'flex-start'}}>
          Choose an icon
        </Headings>
        <Spacer space={15} />
        <View style={listStyles.listContainer}>
          {icons.map(({id, icon}: iconType, index) => {
            return (
              <TouchableOpacity
                key={id}
                style={[
                  listStyles.listItemContainer,
                  {
                    backgroundColor:
                      selectedIcon?.id === id
                        ? colors['tertiary'][0]
                        : 'transparent',
                  },
                ]}
                onPress={() => handlePressItem(id, icon)}>
                <Icon
                  name={icon}
                  size={30}
                  color={
                    selectedIcon?.id === id
                      ? colors[primary][0]
                      : colors[black][0]
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={GlobalStyles.row}>
          <TouchableOpacity onPress={createCategory} style={buttonStyles.save}>
            <Headings headingSize="H5" color={white}>
              Guardar
            </Headings>
          </TouchableOpacity>
          <TouchableOpacity style={buttonStyles.cancel}>
            <Headings headingSize="H5" color={white}>
              Cancelar
            </Headings>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </KeyboardContainer>
  );
};
//TODO: split the screeen into reusable components if needed
const titleStyles = StyleSheet.create({
  titleContainer: {
    height: 40,
    width: '50%',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: 'center',
    backgroundColor: colors[black][0],
  },
});

const inputStyles = StyleSheet.create({
  textInput: {
    height: 40,
    width: '90%',
    paddingHorizontal: 20,
    // paddingLeft: 15,
    textAlign: 'left',
    color: colors[primary][0],
    backgroundColor: colors[white][0],
    borderColor: colors[black][0],
    borderRadius: 10,
    borderWidth: 1,
  },
});

const buttonStyles = StyleSheet.create({
  save: {
    backgroundColor: colors[primary][0],
    width: '45%',
    height: 50,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: colors[secondary][0],
    width: '45%',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
});

const listStyles = StyleSheet.create({
  listContainer: {
    backgroundColor: colors[white][0],
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 'auto',
    borderRadius: 15,
  },
  listItemContainer: {
    // backgroundColor: 'red',
    flex: 1,
    minWidth: 75,
    maxWidth: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
});
