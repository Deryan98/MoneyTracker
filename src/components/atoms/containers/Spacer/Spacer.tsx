import {View} from 'react-native'

export const Spacer = ({space}: {space: number}) => {
  return (
    <View style={{
      marginTop: space
    }}></View>
  )
}
