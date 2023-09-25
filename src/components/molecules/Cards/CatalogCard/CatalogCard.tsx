import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Card, Text, Title} from '@redshank/native';
import {FC} from 'react';
import {StyleSheet, View} from 'react-native';

const CatalogCard: FC<CatalogCard> = ({
  id,
  icon,
  iconColor,
  field,
  balance,
  onPress,
  iconBackground,
}) => {
  return (
    <Card style={styles.card} isPressable onPress={onPress}>
      <Card.Body style={styles.cardBody}>
        <View style={styles.cardBodyContnr}>
          <View
            style={{...styles.iconContainer, backgroundColor: iconBackground}}>
            <FontAwesomeIcon icon={icon} color={iconColor} size={25} />
          </View>
          <Text color="#373737" size={12} style={{}}>
            {field}
          </Text>
          <Title level={2}>${balance}</Title>
        </View>
      </Card.Body>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 25,
    elevation: 10,
    marginVertical: 20,
    marginLeft: 20,
  },
  cardBody: {},
  cardBodyContnr: {
    width: 150,
    height: 150,
    justifyContent: 'space-around',
    paddingLeft: 20,
    paddingTop: 20,
  },
  iconContainer: {
    height: 40,
    width: 40,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
});

export default CatalogCard;
