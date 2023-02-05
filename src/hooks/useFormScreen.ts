import { useEffect, useState } from "react";

export const useFormScreen = () => {

  const [inputText, onChangeInputText] = useState<string>('');
  


  return {
    inputText,
    onChangeInputText,
  }
}
