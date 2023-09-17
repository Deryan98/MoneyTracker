import { useContext } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { ThemeContext } from "../../context/ThemeContext"


export const ChangeThemeScreen = () => {

    const {setDarkTheme, setLightTheme, theme: {colors}} = useContext(ThemeContext)

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={{fontSize: 32, fontWeight:'bold'}}>Theme</Text>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity activeOpacity={0.8}
                    onPress={setLightTheme}
                    style={{
                        width: 150,
                        height: 50,
                        borderRadius: 20,
                        backgroundColor: colors.primary,
                        justifyContent: 'center',
                    }} >
                    <Text style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 22
                    }}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8}
                    onPress={setDarkTheme}
                    style={{
                        width: 150,
                        height: 50,
                        borderRadius: 20,
                        backgroundColor: colors.primary,
                        justifyContent: 'center',
                    }} >
                    <Text style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 22
                    }}>Dark</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
