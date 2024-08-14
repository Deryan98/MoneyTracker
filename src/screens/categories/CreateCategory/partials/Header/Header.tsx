import {black, colors, gray} from '@constants/colors/colors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Title} from '@redshank/native';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

type Props = {};

const Header = (props: Props) => {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity
        onPress={() => {
          console.log('back');
        }}>
        <FontAwesomeIcon
          icon="chevron-left"
          color={colors[gray][1]}
          size={30}
          style={{marginRight: 10, marginTop: 5}}
        />
      </TouchableOpacity>
      <Title level={1}>Create Category</Title>
    </View>
  );
};

export default Header;

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 30,
    paddingLeft: 15,
    paddingBottom: 0,
    width: '100%',
  },
});
