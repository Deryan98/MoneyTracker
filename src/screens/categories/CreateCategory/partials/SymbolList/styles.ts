import {accent, colors, gray, white} from '@constants/colors/colors';
import {StyleSheet} from 'react-native';

export const listTitle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    width: 160,
    paddingLeft: 0,
    alignItems: 'flex-start',
  },
  action: {
    width: 40,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors[accent][1],
  },
});

export const listStyles = StyleSheet.create({
  listContainer: {
    backgroundColor: colors[white][0],
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 'auto',
    borderRadius: 15,
  },
  listItemContainer: {
    // backgroundColor: 'red',
    flex: 1,
    minWidth: 75,
    maxWidth: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  activeItemContainer: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
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
