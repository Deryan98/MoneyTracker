import CatalogList from '@components/organisms/Lists/CatalogList/CatalogList';
import {ScreenTemplate} from '@components/templates/ScreenTemplate';

import {useTheme} from '@redshank/native';
import {getAccounts} from './partials/accountsData';
import {TransactList} from '@components/organisms/Lists/TransactList';
import {transactSections} from './partials/transactData';
import {useState} from 'react';
import {Spacer} from '@components/atoms/containers/Spacer';

type Props = {};

const AccountsScreen = (props: Props) => {
  const {colors} = useTheme();
  const [transactData, setTransactData] = useState(transactSections[0].data);
  const accounts = getAccounts(colors);

  const onPresCatalogListItem = (id: number) => {
    setTransactData(
      transactSections.find(tsection => tsection.id === id)!?.data,
    );
  };

  return (
    <ScreenTemplate headerTitle="Cuentas">
      <CatalogList data={accounts} onPressItem={onPresCatalogListItem} />
      <TransactList sectionData={transactData} />
      <Spacer space={50} />
    </ScreenTemplate>
  );
};

export default AccountsScreen;
