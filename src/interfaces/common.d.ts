import React from 'react';
import {DrawerNavigationOptions} from '@react-navigation/drawer';

declare global {
  interface ScreenInterface {
    name: string;
    component: Element;
    options?: DrawerNavigationOptions;
  }
}
