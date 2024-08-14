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
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Radio, Text, Title} from '@redshank/native';
import {NavigationControl} from '@components/atoms/NavigationControl';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}

export const CreateCategory = ({navigation, route}: FormScreenProps) => {
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
        <View
          style={{
            flexDirection: 'row',
            padding: 30,
            paddingLeft: 15,
            paddingBottom: 0,
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={() => {
              console.log('back');
            }}>
            <FontAwesomeIcon
              icon="chevron-left"
              color={colors[gray][1]}
              size={30}
              style={{marginRight: 10, marginTop: 5}}
            />
          </TouchableOpacity>
          <Title level={1}>Create Category</Title>
        </View>
        <Text style={{paddingHorizontal: 5}}>
          You can register all your categories through this form
        </Text>
        <Spacer space={20} />

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
          }}
          headingSize="H6"
          color={colors[secondary][0]}>
          {error}
        </Headings>
        <Spacer space={20} />
        <View
          style={{
            width: '100%',
            paddingHorizontal: 20,
          }}>
          <Radio.Group
            defaultValue="2"
            size="middle"
            activeColor={colors[accent][1]}>
            <Radio label="Gastos" value="yes" />
            <Radio label="Ingresos" value="no" />
          </Radio.Group>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Headings
            headingSize={'H3'}
            color={colors[gray][1]}
            fontWeight="600"
            containerStyle={{
              width: 160,
              paddingLeft: 0,
              alignItems: 'flex-start',
            }}>
            Choose an icon
          </Headings>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors[accent][1],
            }}>
            <FontAwesomeIcon
              style={{}}
              icon="ellipsis"
              size={25}
              color={colors[accent][0]}
            />
          </TouchableOpacity>
        </View>
        <Spacer space={15} />
        <View style={listStyles.listContainer}>
          {icons.map(({id, icon}: iconType, index) => {
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.5}
                style={listStyles.listItemContainer}
                onPress={() => handlePressItem(id, icon)}>
                <View
                  style={{
                    backgroundColor:
                      selectedIcon?.id === id
                        ? colors[accent][1]
                        : 'transparent',
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 15,
                  }}>
                  <Icon
                    name={icon}
                    size={30}
                    color={
                      selectedIcon?.id === id
                        ? colors[accent][0]
                        : colors[gray][1]
                    }
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Spacer space={20} />
        <View style={GlobalStyles.row}>
          <TouchableOpacity
            disabled
            onPress={createCategory}
            style={buttonStyles.save}>
            <Headings
              headingSize="H4"
              color={colors[accent][0]}
              fontWeight="500">
              Save
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
    backgroundColor: colors[accent][2],
    width: '70%',
    height: 50,
    paddingVertical: 10,
    borderRadius: 15,
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