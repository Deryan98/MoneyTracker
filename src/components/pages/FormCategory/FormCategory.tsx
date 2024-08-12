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
      <ScrollContainer
        style={
          {
            // backgroundColor: 'blue'
          }
        }>
        <ScreenContainer
          containerStyle={{
            backgroundColor: colors[accent],
          }}>
          <Headings
            headingSize="H4"
            color={colors[white]}
            containerStyle={titleStyles.titleContainer}>
            Categories
          </Headings>
          <Spacer space={10} />
          <Headings
            headingSize={selectedIcon ? 'H5' : 'H4'}
            color={colors[gray]}>
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
                placeholderTextColor={colors[gray]}
                keyboardType="default"
              />
              <Headings headingSize="H6" color={colors[secondary]}>
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
                          ? colors[tertiary]
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handlePressItem(id, icon)}>
                  <Icon
                    name={icon}
                    size={30}
                    color={
                      selectedIcon?.id === id ? colors[primary] : colors[black]
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScreenContainer>
      </ScrollContainer>
    </KeyboardContainer>
  );
};

const titleStyles = StyleSheet.create({
  titleContainer: {
    height: 40,
    width: '50%',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: 'center',
    backgroundColor: colors[black],
  },
});

const inputStyles = StyleSheet.create({
  textInput: {
    height: 40,
    width: '60%',
    textAlign: 'center',
    color: colors[primary],
    backgroundColor: colors[white],
    borderColor: colors[black],
    borderRadius: 10,
    borderWidth: 1,
  },
});

const buttonStyles = StyleSheet.create({
  save: {
    backgroundColor: colors[primary],
    width: '25%',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  cancel: {
    backgroundColor: colors[secondary],
    width: '25%',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
  },
});

const listStyles = StyleSheet.create({
  listContainer: {
    backgroundColor: colors[white],
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
