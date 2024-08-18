import {useEffect, useState} from 'react';

export const useFormScreen = () => {
  const [inputText, onChangeInputText] = useState<string>('');

  const [visibleInputText, setVisibleInputText] = useState<boolean>(false);

  const [selectedCategory, onChangeSelectedCategory] = useState<ICategory>();

  console.log({selectedCategory});

  return {
    inputText,
    onChangeInputText,
    visibleInputText,
    setVisibleInputText,
    selectedCategory,
    onChangeSelectedCategory,
  };
};
