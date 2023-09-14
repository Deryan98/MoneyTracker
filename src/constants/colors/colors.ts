export const colors = {
  white: ['white'],
  gray: ['#7B7B7B'],
  primary: ['#010062'],
  secondary: ['#CF0A0A'],
  tertiary: ['#DC5F00'],
  accent: ['#C7FF70', '#8CC63F', '#5CA41B'],
  success: ['#50B700'],
  info: ['#969696'],
  warning: ['#E6BF5C'],
  error: ['#BC2424'],
  inactive: ['#EEEEEE'],
  surface: ['#FAFAFA'],
  black: ['black'],
};

export const black: ColorType = 'black';
export const white: ColorType = 'white';
export const primary: ColorType = 'primary';
export const secondary: ColorType = 'secondary';
export const tertiary: ColorType = 'tertiary';
export const accent: ColorType = 'accent';
export const gray: ColorType = 'gray';

export type ColorType = keyof typeof colors;
