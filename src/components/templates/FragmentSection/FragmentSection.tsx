import {FC} from 'react';
import CatalogList from '@components/organisms/Lists/CatalogList/CatalogList';
import {TransactList} from '@components/organisms/Lists/TransactList';

interface FragmentSectionProps extends CatalogList {
  transactData: SectionTransactItem[];
}

const FragmentSection: FC<FragmentSectionProps> = ({
  data,
  selectedId,
  onPressItem,
  transactData,
}) => {
  return (
    <>
      <CatalogList
        data={data}
        selectedId={selectedId}
        onPressItem={onPressItem}
      />
      <TransactList sectionData={transactData} />
    </>
  );
};

export default FragmentSection;
