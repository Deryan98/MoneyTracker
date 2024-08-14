import {accent, colors} from '@constants/colors/colors';
import {Radio} from '@redshank/native';
import React from 'react';
import {View} from 'react-native';

type Props = {};

const RadioField = (props: Props) => {
  return (
    <View
      style={{
        width: '100%',
        paddingHorizontal: 20,
      }}>
      <Radio.Group
        defaultValue="2"
        size="middle"
        activeColor={colors[accent][1]}>
        <Radio label="Expenses" value="yes" />
        <Radio label="Incomes" value="no" />
      </Radio.Group>
    </View>
  );
};

export default RadioField;
