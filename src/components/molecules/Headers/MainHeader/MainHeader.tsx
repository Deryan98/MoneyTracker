import {StyleSheet, Text, View} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBarsStaggered} from '@fortawesome/free-solid-svg-icons/faBarsStaggered';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@redshank/native';

type Props = {
  title: string;
};

const MainHeader = ({title}: Props) => {
  const [title1, title2] = title.split(' ');

  const navigation = useNavigation();
  const {colors} = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 30,
      }}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <FontAwesomeIcon
          icon={faBarsStaggered}
          color={'green'}
          size={30}
          style={{marginRight: 30, marginTop: 10}}
        />
      </TouchableOpacity>
      <View>
        <Text style={styles.title1}>
          {title1}
          {'\n'}
          <Text style={styles.title2}>{title2}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title1: {
    color: '#373737',
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'left',
  },
  title2: {
    color: '#373737',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});

export default MainHeader;
