import {TransactItem} from '@components/atoms/items/TransactItem';
import {Title} from '@redshank/native';
import React, {FC} from 'react';
import {SectionList, StyleSheet} from 'react-native';

type TransactList = {
  sectionData: SectionTransactItem[];
};

const TransactList: FC<TransactList> = ({sectionData}) => {
  return (
    <SectionList
      sections={sectionData}
      keyExtractor={(item, index) => item.category + index}
      style={styles.section}
      renderItem={({item}) => <TransactItem {...item} />}
      ListHeaderComponent={
        <Title level={2} style={styles.header}>
          Transactions
        </Title>
      }
      renderSectionHeader={({section: {date}}) => (
        <Title level={3} style={styles.title}>
          {date}
        </Title>
      )}
    />
  );
};
const styles = StyleSheet.create({
  section: {width: '100%', padding: 20},
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    marginTop: 20,
  },
  title: {
    color: '#A09FAE',
    marginTop: 20,
  },
});

export default TransactList;
