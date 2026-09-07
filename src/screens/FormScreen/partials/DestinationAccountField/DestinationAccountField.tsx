import {FC} from 'react';
import VectorIcon from 'react-native-vector-icons/FontAwesome';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from '@components/atoms/text/Text';
import {Money} from '@components/atoms/text/Money';
import {IAccountWithBalance} from '@db/queries';
import {colors, gray, primary, white} from '@constants/colors/colors';
import {getKindLabel} from '@screens/AccountsScreen/CreateAccount/partials/KindField/KindField';
import {useTranslation} from 'react-i18next';

export interface DestinationAccountFieldProps {
  /** Todas menos la de origen — el filtrado lo hace `useFormScreen`. */
  accounts: IAccountWithBalance[];
  selected?: IAccountWithBalance;
  onSelect: (id: number) => void;
}

/**
 * "Hacia la cuenta": el selector que SUSTITUYE a la rejilla de
 * categorias cuando el movimiento es una transferencia.
 *
 * Sustituye, no acompana. Una transferencia no tiene categoria porque el
 * dinero no sale del patrimonio, solo cambia de sitio; dejar la rejilla
 * visible —aunque fuera deshabilitada— invitaria a buscar una categoria
 * que no debe existir, que es exactamente el error semantico que esta
 * funcion viene a impedir (inventarse una categoria "Tarjeta de
 * credito" para pagar la tarjeta, contando el gasto dos veces).
 *
 * Muestra el saldo de cada cuenta junto al nombre porque al transferir
 * la pregunta real es "¿cuanto debo aqui?" — sobre todo pagando una
 * tarjeta, donde el saldo negativo ES la cantidad a cubrir.
 */
export const DestinationAccountField: FC<DestinationAccountFieldProps> = ({
  accounts,
  selected,
  onSelect,
}) => {
  const {t} = useTranslation();

  if (accounts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text color={colors[gray][0]} align="center">
          {t('form.needsSecondAccountForTransfer')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text size={13} color={colors[gray][0]} style={styles.label}>
        {t('form.transferDestinationLabel')}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {accounts.map(account => {
          const isSelected = selected?.id === account.id;
          return (
            <TouchableOpacity
              key={account.id}
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={t('form.destinationAccountAccessibilityLabel', {
                name: account.name,
                kind: getKindLabel(account.kind),
              })}
              onPress={() => onSelect(account.id)}
              style={[styles.row, isSelected && styles.rowSelected]}>
              <View style={[styles.icon, isSelected && styles.iconSelected]}>
                <VectorIcon
                  name={account.icon}
                  color={isSelected ? colors[white][0] : colors[primary][0]}
                  size={15}
                />
              </View>

              <View style={styles.textColumn}>
                <Text size={14} lines={1} fontWeight={isSelected ? '700' : '400'}>
                  {account.name}
                </Text>
                <Text color={colors[gray][0]} size={12} lines={1}>
                  {getKindLabel(account.kind)}
                </Text>
              </View>

              {/* Un saldo negativo se pinta en rojo igual que en el resto
                  de la app: pagando una tarjeta, ese numero es
                  exactamente lo que falta por cubrir. */}
              <Text
                size={14}
                color={account.balance < 0 ? colors.error[0] : undefined}
                fontWeight="600">
                <Money cents={account.balance} fontSize={14} />
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  // Alto acotado y con su propio scroll: la lista vive dentro del
  // scroll del formulario, y sin tope una lista larga de cuentas
  // empujaria el boton de guardar fuera de la pantalla.
  list: {
    maxHeight: 260,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors[white][0],
    marginBottom: 8,
    gap: 12,
  },
  rowSelected: {
    borderWidth: 2,
    borderColor: colors[primary][0],
    // Compensa el borde para que la fila no crezque 4px al elegirla y
    // la lista no de un salto.
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.inactive[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSelected: {
    backgroundColor: colors[primary][0],
  },
  textColumn: {
    flex: 1,
  },
  empty: {
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
});

export default DestinationAccountField;
