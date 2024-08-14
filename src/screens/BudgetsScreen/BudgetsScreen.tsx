import {ScreenTemplate} from '@components/templates/ScreenTemplate';
import {Text, View} from 'react-native';

type Props = {};

const BudgetsScreen = (props: Props) => {
  return (
    <ScreenTemplate headerTitle="Presupuestos Mensuales">
      <Text>Presupuestos</Text>
    </ScreenTemplate>
  );
};

export default BudgetsScreen;
