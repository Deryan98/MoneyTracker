import {StyleSheet, Text, View} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBarsStaggered} from '@fortawesome/free-solid-svg-icons/faBarsStaggered';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@redshank/native';

type MainHeaderProps = {
  title?: string;
};

const MainHeader = ({title = ''}: MainHeaderProps) => {
  const [title1, title2] = title.split(' ');

  const navigation = useNavigation();
  const {colors} = useTheme();


  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 30,
        width: '100%',
      }}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <FontAwesomeIcon
          icon={faBarsStaggered}
          color={'green'}
          size={30}
          style={{marginRight: 30, marginTop: 10}}
        />
      </TouchableOpacity>
      {title && (
        <View>
          <Text style={styles.title1}>
            {title1}
            {title2 && (
              <Text style={styles.title2}>
                {'\n'}
                {title2}
              </Text>
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title1: {
    color: '#373737',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  title2: {
    color: '#373737',
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'left',
  },
});

export default MainHeader;
