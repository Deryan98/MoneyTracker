import {colors} from '@constants/colors/colors';
import {SegmentedControl} from '@components/atoms/SegmentedControl';
import {useTranslation} from 'react-i18next';

// El tipo vive en `useFormScreen`, que es quien lo usa como estado; aqui
// solo se re-exporta para no romper a quien ya lo importaba desde este
// componente.
import type {TransactionType} from '@hooks/useFormScreen';
export type {TransactionType};

type Props = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

/**
 * The Gasto/Ingreso segmented control from the approved prototype — now
 * a thin wrapper over the shared `SegmentedControl` atom (see that
 * component's doc comment), keeping only what's specific to THIS
 * control: the expense-is-red/income-is-green tint pairing, which is
 * NOT a one-off — it's the exact same pairing already used everywhere
 * money is signed (`TransactItem`, the Cuentas/Categorías/Resumen
 * mappers). The prototype only drew the "Gasto" state active; reusing
 * this app's existing color language for "Ingreso" active keeps it
 * consistent rather than inventing a new meaning for green/red on this
 * one screen.
 */
export const TypeSegment = ({value, onChange}: Props) => {
  const {t} = useTranslation();

  return (
    <SegmentedControl<TransactionType>
      value={value}
      onChange={onChange}
      // `layout="even"`: con tres opciones la regla automatica del atomo
      // las reparte en una rejilla al 47% —pensada para los cuatro tipos
      // de cuenta— y dejaria "Transferencia" sola en una segunda fila.
      // Tres etiquetas cortas caben en una.
      layout="even"
      options={[
        {value: 'expense', label: t('form.segmentExpense'), activeColor: colors.error[0]},
        {value: 'income', label: t('form.segmentIncome'), activeColor: colors.success[0]},
        // Ni rojo ni verde: esos dos YA significan "sale" y "entra" en
        // toda la app, y una transferencia no es ninguna de las dos — el
        // dinero no abandona tu patrimonio, solo cambia de sitio. Darle
        // uno de esos colores diria justo lo contrario de lo que esta
        // funcion existe para ensenar.
        {value: 'transfer', label: t('form.segmentTransfer'), activeColor: colors.primary[0]},
      ]}
    />
  );
};

export default TypeSegment;
