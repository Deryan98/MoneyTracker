import {SafeAreaView, Text} from 'react-native';
import {ScreenContainer} from '@components/atoms/containers/ScreenContainer';
import {heightDP} from '@utils/responsive';
import {PieChart} from './partials/PieChart';
import {data, items} from './data';

const ResumenScreen = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
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
        <PieChart items={items} data={data} radius={heightDP(20)} />
      </ScreenContainer>
    </SafeAreaView>
  );
};

export default ResumenScreen;
