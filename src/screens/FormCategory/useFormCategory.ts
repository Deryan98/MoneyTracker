import React, {useState} from 'react';
import {getDbConnection, insertCategory} from '@db/db';
import {Alert} from 'react-native';
import {iconType} from '@data/iconType';

export const useFormCategory = () => {
  const [inputText, onChangeInputText] = useState<string>('');

  const [visibleInputText, setVisibleInputText] = useState<boolean>(false);

  const [selectedIcon, onChangeSelectedIcon] = useState<iconType>();

  const [error, setError] = useState<string>('');

  const handlePressItem = (id: number, icon: string) => {
    setVisibleInputText(true);
    onChangeInputText('');
    onChangeSelectedIcon({id, icon});
  }

  const createCategory = async () => {
    if (inputText === '') {
      setError('A category name is required before submitting');
      return;
    }
    try {
      const db = await getDbConnection();
      await insertCategory(db, inputText, selectedIcon?.icon!);
      setError('');
      onChangeInputText('');
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
      console.log(e.message);
      setError(`An error occurred saving the task: ${e.message}`);
    }
  };

  return {
    inputText,
    onChangeInputText,
    visibleInputText,
    setVisibleInputText,
    selectedIcon,
    onChangeSelectedIcon,
    error,
    setError,
    handlePressItem,
    createCategory,
  };
};