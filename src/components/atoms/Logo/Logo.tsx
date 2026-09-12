import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Rect} from 'react-native-svg';
import {accent, colors, primary} from '@constants/colors/colors';
import {Text} from '@components/atoms/text/Text';

/**
 * Marca de la app para la cabecera del drawer.
 *
 * Sustituye a un `<Image source={{uri: 'https://firebasestorage...'}}>`
 * que ademas de venir de fuera mostraba el nombre equivocado ("MONEY
 * FLOW"). Esa URL era la UNICA peticion de red de toda la app, y la
 * unica razon por la que el manifest pedia el permiso INTERNET: al
 * dibujar la marca en local, el permiso se pudo retirar del manifest de
 * `main` (sigue en el de `debug`, donde Metro si lo necesita).
 *
 * Se dibuja en SVG en vez de empaquetar un PNG por tres razones: no hay
 * ningun `src/assets` en el proyecto al que pertenecer, escala sin
 * densidades `@2x/@3x`, y toma los colores de `@constants/colors` en
 * lugar de hornearlos en pixeles — si la paleta cambia, la marca cambia
 * con ella.
 *
 * El tamano del lockup no es estetico: a 20px el wordmark se salia del
 * ancho del drawer y se leia "MoneyTracke", con la ultima letra cortada.
 * Medido en el emulador, no calculado.
 *
 * Las tres barras usan la escalera de tintes que el propio drawer ya
 * aplica a sus items (`drawerInactiveTintColor` -> `drawerActiveTintColor`).
 * La de abajo es `primary[1]`, que esta documentado como el unico tono
 * legible sobre el indigo `primary[0]` del fondo del drawer.
 */
const MARK_TOKENS = [
  // [x, y, ancho, color] sobre un viewBox de 48x48. Apiladas y
  // ascendentes: la de arriba es la mas corta y la mas clara.
  [9, 28, 30, colors[primary][1]],
  [11, 19, 26, colors[accent][1]],
  [14, 10, 20, colors[accent][0]],
] as const;

interface LogoProps {
  /** Lado del cuadrado de la marca, en px. El texto no escala con el:
   * es un lockup de cabecera, no un icono redimensionable. */
  markSize?: number;
}

export const Logo: FC<LogoProps> = ({markSize = 36}) => (
  <View style={styles.lockup}>
    <Svg width={markSize} height={markSize} viewBox="0 0 48 48">
      {MARK_TOKENS.map(([x, y, width, fill]) => (
        <Rect key={fill} x={x} y={y} width={width} height={8} rx={4} fill={fill} />
      ))}
    </Svg>
    <Text size="base" bold numberOfLines={1} color={colors.white[0]} style={styles.wordmark}>
      Money
      <Text size="base" bold color={colors[accent][0]}>
        Tracker
      </Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  wordmark: {
    marginLeft: 10,
    letterSpacing: -0.3,
  },
});
