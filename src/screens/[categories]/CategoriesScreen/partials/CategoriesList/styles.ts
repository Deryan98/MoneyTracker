import {accent, colors, gray, white} from '@constants/colors/colors';
import {StyleSheet} from 'react-native';
import {widthPercentageToDP} from 'react-native-responsive-screen';

export const listTitle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    width: widthPercentageToDP(50),
    paddingLeft: 0,
    alignItems: 'flex-start',
  },
  action: {
    width: 75,
    height: 75,
    // borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const listStyles = StyleSheet.create({
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 2,
    // backgroundColor: colors[white][0],
    marginHorizontal: 'auto',
    borderRadius: 15,
    gap: 3,
  },
  listItemContainer: {
    // backgroundColor: 'red',
    flex: 1,
    minWidth: 85,
    // maxWidth: 90,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeItemContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 5,
  },
});

export const selectedIconColor = (id: number, selectedIconId: number) =>
  selectedIconId === id ? colors[accent][0] : colors[gray][1];

export const activeItemContainerStyle = (id: number, selectedIconId: number) =>
  StyleSheet.flatten([
    listStyles.activeItemContainer,
    {
      backgroundColor:
        selectedIconId === id ? colors[accent][1] : 'transparent',
    },
  ]);

export const activeItemLabelStyle = (id: number, selectedIconId: number) =>
  StyleSheet.flatten([
    listStyles.label,
    {color: selectedIconId === id ? colors[accent][0] : colors[gray][2]},
  ]);
