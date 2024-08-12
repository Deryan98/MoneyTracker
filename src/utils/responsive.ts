import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';

export const widthDP = (size: number) =>
  widthPercentageToDP('100%') * (size / 100);

export const heightDP = (size: number) => {
  const hpTDP = heightPercentageToDP('100%')
  const response = hpTDP * (size / 100);
  return response;
}
