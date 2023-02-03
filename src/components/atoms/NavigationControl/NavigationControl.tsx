import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NavigationControlProps} from './types';

export const NavigationControl = ({
  firstActionPress,
  secondActionPress,
}: NavigationControlProps) => {
  return (
    <View
      style={[
        styles.alignItemsCenter,
        {
          flexDirection: 'row',
          height: '10%',
          // backgroundColor: 'black',
        },
      ]}>
      <Pressable
        //   onPress={() => navigation.navigate('Dashboard')}
        onPress={firstActionPress}
        style={[
          styles.justifyContentCenter,
          styles.alignItemsCenter,
          {
            backgroundColor: 'blue',
            width: '30%',
            height: '70%',
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          },
        ]}>
        <Text
          style={{
            backgroundColor: 'green',
            color: 'white',
          }}>
          Dashboard
        </Text>
      </Pressable>
      <Pressable
        //   onPress={() => navigation.navigate('Form')}
        onPress={secondActionPress}
        style={[
          styles.justifyContentCenter,
          styles.alignItemsCenter,
          {
            width: '30%',
            height: '70%',
            backgroundColor: 'green',
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
          },
        ]}>
        <Text
          style={{
            backgroundColor: 'blue',
            color: 'white',
          }}>
          Registros
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
});
