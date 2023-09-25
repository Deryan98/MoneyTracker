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

  interface SelectOptions {
    value: string;
    label: string;
  }
  interface ChartItem {
    value: number;
    color: string;
    text?: string;
    focused?: boolean;
  }
  interface TransactItem {
    icon: any;
    category: string;
    amount: number;
    date: string;
    color: string;
  }
  interface CatalogCard {
    id: number;
    icon: any;
    iconColor: string;
    iconBackground: string;
    field: string;
    balance: number;
    selectedId?: number;
    onPress?: () => void;
  }

  type SectionTransactItem = {
    date: string;
    data: TransactItem[];
  };
}
