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
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {ScreenContainer, KeyboardContainer, ScrollContainer, Spacer} from '@components/atoms';
import Icon from 'react-native-vector-icons/FontAwesome';
import {icons} from '@data/icons';
import {iconType} from '@data/iconType';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {GlobalStyles} from '@constants/styles/global.styles';
import {useFormCategory} from './useFormCategory';
import { ScreenTemplate } from '@components/templates/ScreenTemplate';

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
      <ScreenTemplate headerTitle="Categories">
          <Spacer space={10} />
          <Headings
            headingSize={selectedIcon ? 'H5' : 'H4'}
            color={colors[gray][0]}>
            {selectedIcon
              ? 'Elige un nombre para tu categoría'
              : 'Selecciona un icono'}
          </Headings>
          <Spacer space={10} />
          {visibleInputText ? (
            <>
              <TextInput
                value={inputText}
                style={inputStyles.textInput}
                onChangeText={onChangeInputText}
                placeholder="Categoría"
                placeholderTextColor={colors[gray][0]}
                keyboardType="default"
              />
              <Headings headingSize="H6" color={colors[secondary][0]}>
                {error}
              </Headings>
              <View style={GlobalStyles.row}>
                <TouchableOpacity
                  onPress={createCategory}
                  style={buttonStyles.save}>
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
            </>
          ) : (
            <Spacer space={0} />
          )}
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
                      selectedIcon?.id === id ? colors[primary][0] : colors[black][0]
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScreenTemplate>
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
    width: '60%',
    textAlign: 'center',
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
    width: '25%',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  cancel: {
    backgroundColor: colors[secondary][0],
    width: '25%',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
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
    minWidth: 100,
    maxWidth: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
});
