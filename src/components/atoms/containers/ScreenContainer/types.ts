import { ViewStyle } from "react-native/types";

export interface ScreenContainerTypes {
    children: JSX.Element |  JSX.Element[];
    containerStyle?: ViewStyle;
}