import {FC, useRef, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {BarChart, LineChart, PieChart} from 'react-native-gifted-charts';

interface ChartItem {
  value: number;
  color: string;
  text?: string;
  focused?: boolean;
}

const data: ChartItem[] = [
  {value: 100, color: '#79D2DE', text: '10', focused: true},
  {value: 400, color: 'red', text: '40'},
  {value: 500, color: '#177AD5', text: '50'},
];

interface RenderLegendProps {
  text: string;
  color: string;
  onPress: () => void;
}

const RenderLegend = ({text, color, onPress}: RenderLegendProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{flexDirection: 'row', marginBottom: 12}}>
      <View
        style={{
          height: 18,
          width: 18,
          marginRight: 10,
          borderRadius: 4,
          backgroundColor: color || 'black',
        }}
      />
      <Text style={{color: 'black', fontSize: 16}}>{text || ''}</Text>
    </TouchableOpacity>
  );
};

const Resumen = () => {
  const [balanceGnrl, setBalanceGnrl] = useState<number>(100);
  const [balanceLbl, setBalanceLbl] = useState<string>('Ahorros');

  return (
    <ScrollView style={{padding: 30}}>
      <Text
        style={{
          color: 'black',
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 12,
          textAlign: 'left',
        }}>
        Balance General
      </Text>
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
        <PieChart
          data={data}
          showText
          textColor="black"
          radius={170}
          textSize={20}
          focusOnPress
          toggleFocusOnPress={false}
          sectionAutoFocus={true}
          showValuesAsLabels
          showTextBackground
          textBackgroundRadius={26}
          donut
          onPress={({value, color, text}: ChartItem, index: number) => {
            setBalanceGnrl(value);
            setBalanceLbl(
              index === 0 ? 'Ahorros' : index === 1 ? 'Gastos' : 'Ingresos',
            );
          }}
          centerLabelComponent={() => {
            return (
              <View>
                <Text style={{color: 'black', fontSize: 36}}>
                  ${balanceGnrl}
                </Text>
                <Text
                  style={{color: 'black', fontSize: 18, textAlign: 'center'}}>
                  {balanceLbl}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </ScrollView>
  );
};

export default Resumen;
