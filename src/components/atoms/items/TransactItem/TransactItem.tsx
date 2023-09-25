import {Card, Title, Text} from '@redshank/native';
import {StyleSheet, View} from 'react-native';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowDownLong} from '@fortawesome/free-solid-svg-icons/faArrowDownLong';
import {faArrowUpLong} from '@fortawesome/free-solid-svg-icons/faArrowUpLong';

function TransactItem(transactItem: TransactItem) {
  const {category, color, date, icon, amount} = transactItem;
  const positive = amount > 0;
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: `${color}33`,
            padding: 10,
          }}>
          <FontAwesomeIcon icon={icon} color={color} size={40} />
        </View>
      </View>
      <View style={styles.center}>
        <Title level={3}>{category}</Title>
        <Text color="#C2C3CD" style={{marginTop: -5}}>
          {date}
        </Text>
      </View>
      <View style={styles.right}>
        <Title level={3} color={positive ? 'green' : 'red'}>
          {positive && '+'}
          {amount}
        </Title>
        <FontAwesomeIcon
          icon={positive ? faArrowUpLong : faArrowDownLong}
          color={positive ? 'green' : 'red'}
          size={25}
          style={{marginTop: -10}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    // padding: 10,
  },
  left: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {flex: 4},
  right: {
    flex: 1.5,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactItem;
