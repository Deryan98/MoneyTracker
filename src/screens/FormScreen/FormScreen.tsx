import {NavigationControl} from '@components/atoms/NavigationControl';
import {black, colors, white} from '@constants/colors/colors';
import {StackNavParams} from '@navigation/StackNav/types';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {
  ScreenContainer,
  KeyboardContainer,
  ScrollContainer,
  Spacer,
} from '@components/atoms';
import {useFormScreen} from '@hooks/useFormScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}

export const FormScreen = ({navigation, route}: FormScreenProps) => {
  const categories = Object.values(route?.params);

  const {
    inputText,
    onChangeInputText,
    visibleInputText,
    setVisibleInputText,
    selectedCategory,
    onChangeSelectedCategory,
  } = useFormScreen();

  const isNameValid = Icon.hasIcon('facebook');
  console.log({isNameValid});

  return (
    <KeyboardContainer>
      <ScrollContainer
        style={
          {
            // backgroundColor: 'blue'
          }
        }>
        <ScreenContainer
          containerStyle={
            {
              // backgroundColor: 'red',
            }
          }>
          <NavigationControl
            firstActionPress={() => navigation.navigate('Dashboard')}
            secondActionPress={() => navigation.navigate('Form')}
          />

          {visibleInputText ? (
            <>
              <TextInput
                value={inputText}
                style={inputStyles.textInput}
                onChangeText={onChangeInputText}
                placeholder="$0.00"
                keyboardType="decimal-pad"
              />
              <Pressable>
                <Text>Guardar</Text>
              </Pressable>
            </>
          ) : (
            <></>
          )}
          <Spacer space={15} />

          <View
            style={{
              backgroundColor: 'white',
              // width: '85%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginHorizontal: 'auto',
              borderRadius: 15,
            }}>
            {categories.map(({id, icon, name}: categoryType, index) => {
              return (
                <TouchableOpacity
                  key={id}
                  style={{
                    // backgroundColor: 'red',
                    flex: 1,
                    minWidth: 100,
                    maxWidth: 100,
                    height: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:
                      selectedCategory?.id === id
                        ? colors[black][0]
                        : 'transparent',
                    borderRadius: 15,
                  }}
                  onPress={() => {
                    setVisibleInputText(true);
                    onChangeInputText('');
                    onChangeSelectedCategory({id, icon, name});
                  }}>
                  <Icon
                    name={icon}
                    size={30}
                    color={
                      selectedCategory?.id === id
                        ? colors[white][0]
                        : colors[black][0]
                    }
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        selectedCategory?.id === id
                          ? colors[white][0]
                          : colors[black][0],
                    }}>
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScreenContainer>
      </ScrollContainer>
    </KeyboardContainer>
  );
};

const inputStyles = StyleSheet.create({
  textInput: {
    height: 40,
    width: '60%',
    textAlign: 'center',
    backgroundColor: colors[white][0],
    borderColor: colors[black][0],
    borderRadius: 10,
    borderWidth: 1,
  },
});
