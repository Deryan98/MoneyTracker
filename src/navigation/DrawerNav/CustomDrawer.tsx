import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {accent, colors} from '@constants/colors/colors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowRightFromBracket} from '@fortawesome/free-solid-svg-icons/faArrowRightFromBracket';
import {faCoins} from '@fortawesome/free-solid-svg-icons/faCoins';

const CustomDrawer = props => {
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: 'transparent'}}>
        <Image
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/apphive-inc.appspot.com/o/usersmedia%2Fv3cF2tYZaJtYVXGZfJAjTp?alt=media&token=5b4ce29c-e5f8-4444-b07b-3866cfe2a96a',
          }}
          style={{height: 175, width: 230, borderRadius: 40, marginBottom: 10}}
        />
        {/* <ImageBackground
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/apphive-inc.appspot.com/o/usersmedia%2Fv3cF2tYZaJtYVXGZfJAjTp?alt=media&token=5b4ce29c-e5f8-4444-b07b-3866cfe2a96a',
          }}
          style={{padding: 20}}>
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/apphive-inc.appspot.com/o/usersmedia%2FwpiwVh1sgg2yfKJ4nV3xZg?alt=media&token=29fa0300-ebe3-4659-89a9-ed4d769d7c79',
            }}
            style={{height: 80, width: 80, borderRadius: 40, marginBottom: 10}}
          />
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontFamily: 'Roboto-Medium',
              marginBottom: 5,
            }}>
            John Doe
          </Text>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              280 Coins
            </Text>
            <FontAwesomeIcon icon={faCoins} size={14} color="#fff" />
          </View>
        </ImageBackground> */}
        <View style={{flex: 1, backgroundColor: 'transparent', paddingTop: 10}}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
        <TouchableOpacity onPress={() => {}} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              size={22}
              color={colors[accent][0]}
            />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Roboto-Medium',
                marginLeft: 5,
                color: colors[accent][0],
              }}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
