import {useTheme} from '@redshank/native';
import {ScreenTemplate} from '@components/templates/ScreenTemplate';
import {getAccounts} from './partials/accountsData';
import {transactSections} from './partials/transactData';
import {useState} from 'react';
import {Spacer} from '@components/atoms/containers/Spacer';
import {FragmentSection} from '@components/templates/FragmentSection';

type Props = {};

const AccountsScreen = (props: Props) => {
  const {colors} = useTheme();
  const [transactData, setTransactData] = useState(transactSections[0].data);
  const accounts = getAccounts(colors);
  const [selectedFieldId, setSelectedFieldId] = useState<number>(1);

  const onPresCatalogListItem = (id: number) => {
    setSelectedFieldId(id);
    setTransactData(
      transactSections.find(tsection => tsection.id === id)!?.data,
    );
  };

  return (
    <ScreenTemplate headerTitle="Cuentas">
      <FragmentSection
        data={accounts}
        selectedId={selectedFieldId}
        onPressItem={onPresCatalogListItem}
        transactData={transactData}
      />
      <Spacer space={50} />
    </ScreenTemplate>
  );
};

export default AccountsScreen;
