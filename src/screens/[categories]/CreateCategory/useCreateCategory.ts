import React, {useState} from 'react';
import {getDbConnection} from '@db/db';
import {insertCategory} from '@db/queries';
import {Alert} from 'react-native';

export const useCreateCategory = () => {
  const [inputText, setInputText] = useState<string>('');

  const [selectedIcon, onChangeSelectedIcon] = useState<IIcon>();

  const [error, setError] = useState<string>('');

  const onChangeInputText = (text: string) => {
    setInputText(text);
  };

  const handlePressItem = (id: number, icon: string) => {
    onChangeSelectedIcon({id, icon});
  };

  const createCategory = async () => {
    if (inputText === '') {
      setError('A category name is required before submitting');
      return;
    }
    try {
      const db = await getDbConnection();
      await insertCategory(db, inputText, selectedIcon?.icon!);
      setError('');
      setInputText('');
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
    selectedIcon,
    onChangeSelectedIcon,
    error,
    setError,
    handlePressItem,
    createCategory,
  };
};
