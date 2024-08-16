import {Headings} from '@components/atoms/text/Headings/Headings';
import {accent, colors} from '@constants/colors/colors';
import {GlobalStyles} from '@constants/styles/global.styles';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

type Props = {
  onSave: any;
};

const SaveAction = ({onSave}: Props) => {
  return (
    <View style={GlobalStyles.row}>
      <TouchableOpacity disabled onPress={onSave} style={buttonStyles.save}>
        <Headings headingSize="H4" color={colors[accent][0]} fontWeight="500">
          Save
        </Headings>
      </TouchableOpacity>
    </View>
  );
};

export default SaveAction;

const buttonStyles = StyleSheet.create({
  save: {
    backgroundColor: colors[accent][2],
    width: '70%',
    height: 50,
    paddingVertical: 10,
    borderRadius: 15,
    marginVertical: 10,
    justifyContent: 'center',
  },
});
