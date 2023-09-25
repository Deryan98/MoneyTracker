import {FC} from 'react';
import {CatalogCard} from '@components/molecules/Cards/CatalogCard';
import {FlatList, View} from 'react-native';

const CatalogList: FC<CatalogList> = ({data, selectedId, onPressItem}) => {
  return (
    <FlatList
      keyExtractor={item => item.field}
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({item, index}) => (
        <CatalogCard
          id={item.id}
          icon={item.icon}
          iconColor={item.iconColor}
          iconBackground={item.iconBackground}
          field={item.field}
          balance={item.balance}
          selectedId={selectedId}
          onPress={() => onPressItem(item.id)}
        />
      )}
      ListFooterComponent={<View style={{marginLeft: 20}}></View>}
    />
  );
};

export default CatalogList;
