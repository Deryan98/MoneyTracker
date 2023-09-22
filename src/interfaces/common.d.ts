import React from 'react';
import {DrawerNavigationOptions} from '@react-navigation/drawer';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';

declare global {
  interface ScreenInterface {
    name: string;
    component: ScreenComponentType<ParamListBase, string>;
    initialParams?: Object;
  }
  interface INativeStack extends ScreenInterface {
    options?: NativeStackNavigationOptions;
  }
  interface IDrawer extends ScreenInterface {
    options?: DrawerNavigationOptions;
  }
  interface IBottomTab extends ScreenInterface {
    options?: BottomTabNavigationOptions;
  }
  interface ChartItem {
    value: number;
    color: string;
    text?: string;
    focused?: boolean;
  }
}
