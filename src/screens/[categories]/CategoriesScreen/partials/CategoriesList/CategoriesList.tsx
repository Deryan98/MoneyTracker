import {Spacer} from '@components/atoms';
import {StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {accent, colors, gray, white} from '@constants/colors/colors';
import {icons} from '@data/icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  activeItemContainerStyle,
  activeItemLabelStyle,
  listStyles,
  listTitle,
  selectedIconColor,
} from './styles';
import {InputScrollView, Text} from '@redshank/native';
import {heightDP} from '@utils/responsive';
import {heightPercentageToDP} from 'react-native-responsive-screen';

type SymbolListProps = {
  selectedIcon: any;
  onPressItem: any;
};

const SymbolListHeader = () => (
  <View style={listTitle.container}>
    <TouchableOpacity style={listTitle.action}>
      <FontAwesomeIcon icon="ellipsis" size={25} color={colors[accent][0]} />
    </TouchableOpacity>
  </View>
);

const CategoriesList = ({selectedIcon, onPressItem}: SymbolListProps) => {
  return (
    <>
      {/* <SymbolListHeader /> */}
      <Spacer space={15} />
      <ScrollView
        contentContainerStyle={{
          padding: 0,
          width: '100%',
          backgroundColor: colors[white][0],
          borderRadius: 15,
          // height: ,
          maxHeight: heightPercentageToDP(70),
        }}>
        <View style={listStyles.listContainer}>
          <TouchableOpacity style={listTitle.action}>
            <View
              style={{
                backgroundColor: colors[accent][2],
                width: 50,
                height: 50,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <FontAwesomeIcon
                icon="ellipsis"
                size={25}
                color={colors[accent][0]}
              />
            </View>
          </TouchableOpacity>
          {icons.map(({id, icon}: IIcon, index) => {
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.5}
                style={listStyles.listItemContainer}
                onPress={() => onPressItem(id, icon)}>
                <View style={activeItemContainerStyle(id, selectedIcon?.id)}>
                  <Icon
                    name={icon}
                    size={25}
                    color={selectedIconColor(id, selectedIcon?.id)}
                  />
                  <View style={{width: '100%', height: 35}}>
                    <Text
                      numberOfLines={1}
                      style={activeItemLabelStyle(id, selectedIcon?.id)}>
                      Tarjeta credisiman
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

export default CategoriesList;
