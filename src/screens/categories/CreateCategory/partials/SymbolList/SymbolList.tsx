import {Spacer} from '@components/atoms';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {accent, colors, gray, white} from '@constants/colors/colors';
import {icons} from '@data/icons';
import {iconType} from '@data/iconType';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

type SymbolListProps = {
  selectedIcon: any;
  onPressItem: any;
};

const SymbolListHeader = () => (
  <View style={listTitle.container}>
    <Headings
      headingSize={'H3'}
      color={colors[gray][1]}
      fontWeight="600"
      containerStyle={listTitle.heading}>
      Choose an icon
    </Headings>
    <TouchableOpacity style={listTitle.action}>
      <FontAwesomeIcon icon="ellipsis" size={25} color={colors[accent][0]} />
    </TouchableOpacity>
  </View>
);

const SymbolList = ({selectedIcon, onPressItem}: SymbolListProps) => {
  const backgroundActiveItemContainer = (id: number) =>
    selectedIcon?.id === id ? colors[accent][1] : 'transparent';

  const getSelectedIconColor = (id: number) =>
    selectedIcon?.id === id ? colors[accent][0] : colors[gray][1];

  return (
    <>
      <SymbolListHeader />
      <Spacer space={15} />
      <View style={listStyles.listContainer}>
        {icons.map(({id, icon}: iconType, index) => {
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.5}
              style={listStyles.listItemContainer}
              onPress={() => onPressItem(id, icon)}>
              <View
                style={[
                  listStyles.activeItemContainer,
                  {
                    backgroundColor: backgroundActiveItemContainer(id),
                  },
                ]}>
                <Icon name={icon} size={30} color={getSelectedIconColor(id)} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

export default SymbolList;

const listTitle = StyleSheet.create({
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

const listStyles = StyleSheet.create({
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
