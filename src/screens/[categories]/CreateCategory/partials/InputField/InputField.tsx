import {Spacer} from '@components/atoms';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {
  accent,
  black,
  colors,
  gray,
  primary,
  secondary,
  white,
} from '@constants/colors/colors';
import {Text} from '@redshank/native';
import React from 'react';
import {StyleSheet, TextInput} from 'react-native';

type Props = {
  inputText: string;
  onChangeInputText: any;
  error: string;
};

const InputField = ({inputText, onChangeInputText, error}: Props) => {
  return (
    <>
      <TextInput
        value={inputText}
        style={inputStyles.textInput}
        onChangeText={onChangeInputText}
        placeholder="Add category name"
        placeholderTextColor={colors[gray][0]}
        keyboardType="default"
      />
      <Headings
        containerStyle={inputStyles.errorMessage}
        headingSize="H6"
        color={colors[secondary][0]}>
        {error}
      </Headings>
    </>
  );
};

const inputStyles = StyleSheet.create({
  textInput: {
    height: 50,
    width: '100%',
    paddingHorizontal: 20,
    // paddingLeft: 15,
    textAlign: 'left',
    color: colors[accent][2],
    backgroundColor: colors[white][0],
    borderColor: colors[black][0],
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  errorMessage: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
});

export default InputField;
