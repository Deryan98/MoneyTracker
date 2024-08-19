import {Spacer} from '@components/atoms';
import {StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {accent, colors} from '@constants/colors/colors';
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
import {Text} from '@redshank/native';
import {useNavigation} from '@react-navigation/native';
import {CategoriesListNavigationProp} from '@navigation/[categories]/CategoriesNavigator/CategoriesNavigator';

type SymbolListProps = {
  selectedIcon: any;
  onPressItem: any;
};

type AddCategoryProps = {
  onPress: any;
};

const AddCategory = ({onPress}: AddCategoryProps) => {
  return (
    <TouchableOpacity style={listTitle.action} onPress={onPress}>
      <View style={listStyles.addCategoryButton}>
        <FontAwesomeIcon icon="ellipsis" size={25} color={colors[accent][0]} />
      </View>
    </TouchableOpacity>
  );
};

const CategoriesList = ({selectedIcon, onPressItem}: SymbolListProps) => {
  const navigation = useNavigation<CategoriesListNavigationProp>();
  const addCategoryHadler = () => {
    console.log('que');
    navigation.navigate('CreateCategory');
  };
  return (
    <ScrollView contentContainerStyle={listStyles.scrollContainer}>
      <View style={listStyles.listContainer}>
        <AddCategory onPress={addCategoryHadler} />
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
  );
};

export default CategoriesList;
