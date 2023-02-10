import {NavigationControl} from '@components/atoms/NavigationControl';
import {
  accent,
  black,
  colors,
  gray,
  primary,
  secondary,
  tertiary,
  white,
} from '@constants/colors/colors';
import {StackNavParams} from '@navigation/StackNav/types';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {ScreenContainer} from '@components/atoms/containers/ScreenContainer';
import {KeyboardContainer} from '@components/atoms/containers/KeyboardContainer';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ScrollContainer} from '@components/atoms/containers/ScrollContainer';
import {Spacer} from '@components/atoms/containers/Spacer';
import {icons} from '@data/icons';
import {iconType} from '@data/iconType';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {GlobalStyles} from '@constants/styles/global.styles';
import {getDbConnection, insertCategory} from '@db/db';

interface FormScreenProps extends StackScreenProps<StackNavParams, 'Form'> {}

export const FormCategory = ({navigation, route}: FormScreenProps) => {
  const [inputText, onChangeInputText] = useState<string>('');

  const [visibleInputText, setVisibleInputText] = useState<boolean>(false);

  const [selectedIcon, onChangeSelectedIcon] = useState<iconType>();

  const [error, setError] = useState<string>('');

  const createCategory = async () => {
    if (inputText === '') {
      setError('A category name is required before submitting');
      return;
    }
    try {
      const db = await getDbConnection();
      await insertCategory(db, inputText, selectedIcon?.icon!);
      setError('')
      onChangeInputText('')
      Alert.alert(
        'Success',
        'Task created',
        [
          {
            text: 'Ok',
            onPress: () => console.log('navega al listado de categorias'),
          },
        ],
        {cancelable: false},
      );
      db.close();
    } catch (e: any) {
      console.log(e.message)
      setError(`An error occurred saving the task: ${e.message}`);
    }
  };

  return (
    <KeyboardContainer>
      <ScrollContainer
        style={
          {
            // backgroundColor: 'blue'
          }
        }>
        <ScreenContainer
          containerStyle={{
            backgroundColor: colors[accent],
          }}>
          <Spacer space={10} />
          <Headings
            headingSize={selectedIcon ? 'H4' : 'H3'}
            color={colors[gray]}>
            {selectedIcon
              ? 'Elige un nombre para tu categoría'
              : 'Selecciona un icono'}
          </Headings>
          <Spacer space={10} />
          {visibleInputText ? (
            <>
              <TextInput
                value={inputText}
                style={inputStyles.textInput}
                onChangeText={onChangeInputText}
                placeholder="Categoría"
                placeholderTextColor={colors[gray]}
                keyboardType="default"
              />
              <Headings headingSize="H6" color={colors[secondary]}>{error}</Headings>
              <View style={GlobalStyles.row}>
                <TouchableOpacity
                  onPress={createCategory}
                  style={{
                    backgroundColor: colors[primary],
                    width: '25%',
                    paddingVertical: 10,
                    borderRadius: 10,
                    marginVertical: 10,
                    marginHorizontal: 5,
                  }}>
                  <Headings headingSize="H5" color={white}>
                    Guardar
                  </Headings>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors[secondary],
                    width: '25%',
                    paddingVertical: 10,
                    borderRadius: 10,
                    marginVertical: 10,
                    marginHorizontal: 5,
                  }}>
                  <Headings headingSize="H5" color={white}>
                    Cancelar
                  </Headings>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Spacer space={0} />
          )}
          <Spacer space={15} />

          <View
            style={{
              backgroundColor: colors[white],
              // width: '85%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginHorizontal: 'auto',
              borderRadius: 15,
            }}>
            {icons.map(({id, icon}: iconType, index) => {
              return (
                <TouchableOpacity
                  key={id}
                  style={{
                    // backgroundColor: 'red',
                    flex: 1,
                    minWidth: 100,
                    maxWidth: 100,
                    height: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:
                      selectedIcon?.id === id
                        ? colors[tertiary]
                        : 'transparent',
                    borderRadius: 15,
                  }}
                  onPress={() => {
                    setVisibleInputText(true);
                    onChangeInputText('');
                    onChangeSelectedIcon({id, icon});
                  }}>
                  <Icon
                    name={icon}
                    size={30}
                    color={
                      selectedIcon?.id === id ? colors[primary] : colors[black]
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScreenContainer>
      </ScrollContainer>
    </KeyboardContainer>
  );
};

const inputStyles = StyleSheet.create({
  textInput: {
    height: 40,
    width: '60%',
    textAlign: 'center',
    color: colors[primary],
    backgroundColor: colors[white],
    borderColor: colors[black],
    borderRadius: 10,
    borderWidth: 1,
  },
});
