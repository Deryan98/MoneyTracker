import {Text, TouchableOpacity, View} from 'react-native';

interface RenderLegendProps {
  text: string;
  color: string;
  onPress: () => void;
}

export const RenderLegend = ({text, color, onPress}: RenderLegendProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{flexDirection: 'row', marginBottom: 12}}>
      <View
        style={{
          height: 18,
          width: 18,
          marginRight: 10,
          borderRadius: 4,
          backgroundColor: color || 'black',
        }}
      />
      <Text style={{color: 'black', fontSize: 16}}>{text || ''}</Text>
    </TouchableOpacity>
  );
};
