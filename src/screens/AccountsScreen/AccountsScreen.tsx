import {ScreenTemplate} from '@components/templates/ScreenTemplate';
import {Text, View} from 'react-native';

type Props = {};

const AccountsScreen = (props: Props) => {
  return (
    <ScreenTemplate headerTitle="Cuentas">
      <Text>AccountsScreen</Text>
    </ScreenTemplate>
  );
};

export default AccountsScreen;
