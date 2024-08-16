import {Card, Title} from '@redshank/native';
import React, {FC, Fragment} from 'react';
import {StyleSheet, View} from 'react-native';
import {TransactItem} from '@components/atoms/items/TransactItem';

type TransactCardProps = {
  transactions: TransactItem[];
};

const TransactCard: FC<TransactCardProps> = ({transactions}) => {
  return (
    <View style={{width: '100%', height: 350}}>
      <Title level={2}>Transactions</Title>
      <Card
        isPressable
        style={{
          height: '100%',
        }}>
        <Card.Body>
          <View style={{height: '100%'}}>
            {transactions.map((transaction, index) => (
              <Fragment key={index}>
                {index > 0 && <View style={styles.divider}></View>}
                <TransactItem {...transaction} />
              </Fragment>
            ))}
          </View>
        </Card.Body>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '90%',
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5FA',
    alignSelf: 'center',
  },
});

export default TransactCard;
