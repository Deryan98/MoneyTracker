import {NavigationControl} from '@components/atoms/NavigationControl';
import {black, colors, white} from '@constants/colors/colors';
import {StackNavParams} from '@navigation/NativeStack/types';
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
import {ScreenContainer} from '@components/atoms/containers/ScreenContainer';
import {KeyboardContainer} from '@components/atoms/containers/KeyboardContainer';
import {useFormScreen} from '@hooks/useFormScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import {categories, categoryType} from '@data/categories';
import {ScrollContainer} from '@components/atoms/containers/ScrollContainer';
import { Spacer } from '@components/atoms/containers/Spacer';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}

export const FormScreen = ({navigation}: FormScreenProps) => {
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
      <ScrollContainer>
        <ScreenContainer
          containerStyle={{
            // backgroundColor: 'red',
            //  paddingVertical: 10
          }}>
          <NavigationControl
            firstActionPress={() => navigation.navigate('Dashboard')}
            secondActionPress={() => navigation.navigate('Form')}
          />

          {visibleInputText ? (
            <TextInput
              value={inputText}
              style={inputStyles.textInput}
              onChangeText={onChangeInputText}
              placeholder="$0.00"
              keyboardType="decimal-pad"
            />
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
                height: '85%'
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
                      backgroundColor: selectedCategory?.id === id ? colors[black] : 'transparent',
                      borderRadius: 15
                    }}
                    onPress={() => {
                      setVisibleInputText(true);
                      onChangeInputText('')
                      onChangeSelectedCategory({id, icon, name});
                    }}>
                    <Icon name={icon} size={30} color={ selectedCategory?.id === id ? colors[white] : colors[black] } />
                    <Text style={{fontSize: 12, color: selectedCategory?.id === id ? colors[white] : colors[black] }}>{name}</Text>
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
    backgroundColor: colors[white],
    borderColor: colors[black],
    borderRadius: 10,
    borderWidth: 1,
  },
});
