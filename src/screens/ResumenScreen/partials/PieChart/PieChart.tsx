import React, {FC} from 'react';
import {Text, View} from 'react-native';
import {PieChart as PieChartGifted} from 'react-native-gifted-charts';
import {RenderLegend} from './partials/RenderLend';
import {Select} from '@redshank/native';

export const PieChart: FC<PieChartProps> = ({
  data,
  radius,
  onPress,
  balanceGnrl,
  balanceLbl,
}) => {
  const items = [
    {
      label: 'One option',
      value: 'one',
    },
    {
      label: 'Two option',
      value: 'two',
    },
  ];
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginVertical: 15,
        }}>
        <RenderLegend text="Ingresos" color="#177AD5" onPress={() => {}} />
        <RenderLegend text="Ahorros" color="#79D2DE" onPress={() => {}} />
        <RenderLegend text="Gastos" color="red" onPress={() => {}} />
      </View>
      <Select items={items} />
      <PieChartGifted
        data={data}
        showText
        textColor="black"
        radius={radius}
        textSize={20}
        focusOnPress
        toggleFocusOnPress={false}
        sectionAutoFocus={true}
        showValuesAsLabels
        showTextBackground
        textBackgroundRadius={26}
        donut
        onPress={onPress}
        centerLabelComponent={() => {
          return (
            <View>
              <Text style={{color: 'black', fontSize: 36}}>${balanceGnrl}</Text>
              <Text style={{color: 'black', fontSize: 18, textAlign: 'center'}}>
                {balanceLbl}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};
