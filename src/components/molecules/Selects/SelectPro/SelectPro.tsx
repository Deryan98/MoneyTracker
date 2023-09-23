import {
  Select,
  SelectProps,
  SelectProvider,
} from '@mobile-reality/react-native-select-pro';
import {FC} from 'react';
import {View} from 'react-native';
import {selectStyles} from './styles';
import {useTheme} from '@redshank/native';

const SelectPro: FC<SelectProps> = props => {
  const {colors} = useTheme();

  console.log(props);
  return (
    <SelectProvider>
      <View style={{marginBottom: 30, width: 200}}>
        <Select {...props} styles={{...selectStyles(colors)}} />
      </View>
    </SelectProvider>
  );
};

export default SelectPro;
