import { NavigationControl } from '@components/atoms/NavigationControl'
import React from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native'

export const DashboardScreen = ({navigation}) => {
  return (
    <View style={{
      width: '100%',
      height: '100%',
      // backgroundColor: 'red',
      justifyContent: 'flex-start',
      alignItems: 'center'
    }}>
      <NavigationControl 
        firstActionPress={() => navigation.navigate('Dashboard')} 
        secondActionPress={() => navigation.navigate('Form')} />
      
      <Text>Dashboard Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  justifyContentCenter: {
    justifyContent: 'center'
  },
  alignItemsCenter: {
    alignItems: 'center'
  }
})
