import React from 'react';
import {View} from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {accent, colors} from '@constants/colors/colors';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text as RSText} from '@components/atoms/text/Text';
import {LanguageSwitch} from '@components/atoms/LanguageSwitch';
import {Logo} from '@components/atoms/Logo';

const CustomDrawer = (props: DrawerContentComponentProps) => {
  const {t} = useTranslation();
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: 'transparent'}}>
        <Logo />
        <View style={{flex: 1, backgroundColor: 'transparent', paddingTop: 10}}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
        <View style={drawerStyles.languageBlock}>
          <RSText size={12} color={colors[accent][0]} style={drawerStyles.languageLabel}>
            {t('drawer.language')}
          </RSText>
          <LanguageSwitch onDark />
        </View>
        {/* Aqui vivia un "Cerrar sesion" con `onPress={() => {}}`: se
            veia, se podia pulsar y no hacia absolutamente nada desde que
            se escribio. Se retira entero en vez de darle una accion,
            porque la accion no existe — esta app no tiene backend, ni
            autenticacion, ni sesion que cerrar (ver la primera seccion
            del CLAUDE.md). Un control que promete algo inexistente es
            peor que su ausencia. */}
      </View>
    </View>
  );
};

const drawerStyles = StyleSheet.create({
  languageBlock: {
    paddingBottom: 14,
  },
  languageLabel: {
    marginBottom: 7,
  },
});

export default CustomDrawer;
