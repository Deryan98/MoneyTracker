import { NavigationControl } from '@components/atoms/NavigationControl'
import { black, colors, white } from '@constants/colors/colors';
import { StackNavParams } from '@navigation/NativeStack/types';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react'
import {Pressable, StyleSheet, Text, View, TextInput, Keyboard} from 'react-native';
import { ScreenContainer } from '@components/atoms/containers/ScreenContainer';
import { KeyboardContainer } from '@components/atoms/containers/KeyboardContainer';
import { useFormScreen } from '@hooks/useFormScreen';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}

export const FormScreen = ({navigation}: FormScreenProps) => {

  const { inputText, onChangeInputText,  } = useFormScreen();


  return (
    <KeyboardContainer>
      <ScreenContainer>
        <NavigationControl 
          firstActionPress={() => navigation.navigate('Dashboard')} 
          secondActionPress={() => navigation.navigate('Form')} />

        <TextInput
          value={inputText}
          style={inputStyles.textInput}
          onChangeText={onChangeInputText}
          placeholder='$0.00'
          keyboardType='decimal-pad'
          />
      </ScreenContainer>
      
      <Text>Form Screen</Text>
    </KeyboardContainer>
  )
}

const inputStyles = StyleSheet.create({
  textInput: {
    height: 40,
    width: '60%',
    textAlign: 'center',
    backgroundColor: colors[white],
    borderColor: colors[black],
    borderRadius: 10,
    borderWidth: 1
  }
})


