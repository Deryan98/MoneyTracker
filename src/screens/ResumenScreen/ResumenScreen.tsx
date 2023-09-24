import {heightDP} from '@utils/responsive';
import {PieChart} from '@components/organisms/Charts/PieChart';
import {data, items} from './partials/chartData';
import {TransactCard} from '@components/molecules/Cards/TransactCard';
import {transactData} from './partials/transactData';
import {ScreenTemplate} from '@components/templates/ScreenTemplate';

const ResumenScreen = () => {
  return (
    <ScreenTemplate headerTitle="Balance General">
      <PieChart items={items} data={data} radius={heightDP(20)} />
      <TransactCard transactions={transactData} />
    </ScreenTemplate>
  );
};

export default ResumenScreen;
