import {Text, TouchableOpacity, View} from 'react-native';
import {ScrollContainer} from '@components/atoms/containers/ScrollContainer';
import {ScreenContainer} from '@components/atoms/containers/ScreenContainer';
import {heightDP} from '@utils/responsive';
import {useState} from 'react';

import {Select} from '@redshank/native';
import {PieChart} from './partials/PieChart';

const data: ChartItem[] = [
  {value: 100, color: '#79D2DE', text: '10', focused: true},
  {value: 400, color: 'red', text: '40'},
  {value: 500, color: '#177AD5', text: '50'},
];

const ResumenScreen = () => {
  const [balanceGnrl, setBalanceGnrl] = useState<number>(100);
  const [balanceLbl, setBalanceLbl] = useState<string>('Ahorros');

  const onPressChartItem = ({value, color, text}: ChartItem, index: number) => {
    setBalanceGnrl(value);
    setBalanceLbl(
      index === 0 ? 'Ahorros' : index === 1 ? 'Gastos' : 'Ingresos',
    );
  };

  return (
    <ScrollContainer style={{padding: 3}}>
      <ScreenContainer containerStyle={{alignItems: 'flex-start'}}>
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
        <PieChart
          data={data}
          radius={heightDP(20)}
          balanceGnrl={balanceGnrl}
          balanceLbl={balanceLbl}
          onPress={onPressChartItem}
        />
      </ScreenContainer>
    </ScrollContainer>
  );
};

export default ResumenScreen;
