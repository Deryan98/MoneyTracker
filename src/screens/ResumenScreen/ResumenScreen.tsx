import {SafeAreaView, Text} from 'react-native';
import {ScreenContainer} from '@components/atoms/containers/ScreenContainer';
import {heightDP} from '@utils/responsive';
import {PieChart} from '@components/organisms/Charts/PieChart';
import {data, items} from './partials/chartData';
import {TransactCard} from '@components/molecules/Cards/TransactCard';
import {ScrollContainer} from '@components/atoms/containers/ScrollContainer';
import {transactData} from './partials/transactData';
import {MainHeader} from '@components/molecules/Headers/MainHeader';

const ResumenScreen = () => {
  return (
    <ScrollContainer style={{flex: 1}}>
      <ScreenContainer
        containerStyle={{alignItems: 'flex-start', paddingBottom: 100}}>
        <MainHeader title="Balance General" />
        <PieChart items={items} data={data} radius={heightDP(20)} />
        <TransactCard transactions={transactData} />
      </ScreenContainer>
    </ScrollContainer>
  );
};

export default ResumenScreen;
