import { NavigationControl } from '@components/atoms/NavigationControl'
import { ScreenContainer } from '@components/atoms/containers/ScreenContainer';
import { StackNavParams } from '@navigation/NativeStack/types';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native';

interface DashboardScreenProps extends StackScreenProps<StackNavParams, 'Dashboard'> {}

export const DashboardScreen = ({navigation}: DashboardScreenProps) => {
  return (
    <ScreenContainer>
      <NavigationControl 
        firstActionPress={() => navigation.navigate('Dashboard')} 
        secondActionPress={() => navigation.navigate('Form')} 
        firstActive
        />
      <Text>Dashboard Screen</Text>
   </ScreenContainer>
  )
}
