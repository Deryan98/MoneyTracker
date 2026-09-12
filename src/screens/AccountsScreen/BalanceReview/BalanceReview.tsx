import {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Money} from '@components/atoms/text/Money';
import {Text} from '@components/atoms/text/Text';
import {ScreenContainer} from '@components/atoms';
import {ConfirmDialog} from '@components/organisms/feedback';
import Header from '@screens/[categories]/components/Header/Header';
import {accent, colors, gray, primary, secondary, white} from '@constants/colors/colors';
import {formatCentsToCurrency} from '@utils/currency';
import {IAccountWithBalance} from '@db/queries';
import {getKindLabel} from '../CreateAccount/partials/KindField/KindField';
import {useAccountBalanceReview} from '@hooks/useAccountBalanceReview';

/**
 * S3/T11-T12 — revision guiada de las cuentas de deuda que nacieron con
 * el cupo cargado como saldo positivo (ver la pitch). Recorte explicito
 * que la propia pitch autoriza: una lista PLANA con dos acciones por
 * fila, en vez de un asistente paso a paso — mismo resultado observable
 * en cada AC, menos coreografia de UI.
 *
 * Cada fila expande su propio campo de monto adeudado inline
 * (`expandedAccountId`, estado puramente de UI de esta pantalla, no del
 * hook) en vez de navegar a una pantalla aparte por cuenta — no hay
 * nada que justifique el salto de pantalla para un solo input numerico.
 *
 * El dialogo de cambio de patrimonio neto (T12) vive aqui, leyendo
 * `netWorthChange` del hook: se dispara solo, una vez, cuando la ULTIMA
 * cuenta pendiente de esta sesion se resuelve — ver el doc comment de
 * `useAccountBalanceReview`.
 */
export const BalanceReview = () => {
  const {t} = useTranslation();
  const {
    status,
    errorMessage,
    reload,
    pending,
    savingAccountId,
    amountErrorByAccountId,
    clearAmountErrorFor,
    confirmBalanceCorrect,
    submitRealDebt,
    netWorthChange,
    dismissNetWorthChange,
  } = useAccountBalanceReview();

  const [expandedAccountId, setExpandedAccountId] = useState<number | null>(
    null,
  );
  const [amountTextByAccountId, setAmountTextByAccountId] = useState<
    Record<number, string>
  >({});

  const onPressWasLimit = (accountId: number) => {
    setExpandedAccountId(prev => (prev === accountId ? null : accountId));
  };

  const onChangeAmountText = (accountId: number, text: string) => {
    clearAmountErrorFor(accountId);
    setAmountTextByAccountId(prev => ({...prev, [accountId]: text}));
  };

  const onConfirmWasLimit = async (accountId: number) => {
    const amountText = amountTextByAccountId[accountId] ?? '';
    const success = await submitRealDebt(accountId, amountText);
    if (success) {
      setExpandedAccountId(null);
    }
  };

  const onConfirmBalanceCorrect = async (accountId: number) => {
    await confirmBalanceCorrect(accountId);
  };

  const renderItem = ({item}: {item: IAccountWithBalance}) => {
    const isExpanded = expandedAccountId === item.id;
    const isSaving = savingAccountId === item.id;
    const amountText = amountTextByAccountId[item.id] ?? '';
    const amountError = amountErrorByAccountId[item.id] ?? '';
    // `parseAmountToCents` en el hook es la fuente de verdad; aqui solo
    // se deshabilita el boton mientras el campo este vacio para evitar
    // un guardado obligatoriamente vacio (AC de T11) — el hook sigue
    // rechazando cualquier otro valor invalido al confirmar.
    const canConfirmAmount = amountText.trim() !== '' && !isSaving;

    return (
      <View style={styles.card}>
        <Text numberOfLines={1}>{item.name}</Text>
        <Text size={12} color={colors[gray][0]} style={styles.rowSubtitle}>
          {getKindLabel(item.kind)} ·{' '}
          <Money cents={item.initialBalance} fontSize={12} />
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('accounts.reviewWasLimitAction')}
            accessibilityState={{expanded: isExpanded}}
            disabled={isSaving}
            onPress={() => onPressWasLimit(item.id)}
            style={styles.actionButtonPrimary}>
            <Text size={13} color={colors[white][0]} fontWeight="600" align="center">
              {t('accounts.reviewWasLimitAction')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('accounts.reviewConfirmCorrectAction')}
            disabled={isSaving}
            onPress={() => onConfirmBalanceCorrect(item.id)}
            style={styles.actionButtonSecondary}>
            <Text size={13} color={colors[primary][0]} fontWeight="600" align="center">
              {t('accounts.reviewConfirmCorrectAction')}
            </Text>
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.amountRow}>
            <TextInput
              value={amountText}
              onChangeText={text => onChangeAmountText(item.id, text)}
              placeholder={t('accounts.reviewAmountOwedLabel')}
              placeholderTextColor={colors[gray][0]}
              keyboardType="decimal-pad"
              accessibilityLabel={t('accounts.reviewAmountOwedLabel')}
              style={styles.amountInput}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('accounts.reviewConfirmAmountAction')}
              disabled={!canConfirmAmount}
              onPress={() => onConfirmWasLimit(item.id)}
              style={[
                styles.confirmAmountButton,
                !canConfirmAmount && styles.confirmAmountButtonDisabled,
              ]}>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors[white][0]} />
              ) : (
                <Text size={13} color={colors[white][0]} fontWeight="600">
                  {t('accounts.reviewConfirmAmountAction')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        {amountError !== '' && (
          <Text
            size={12}
            color={colors[secondary][0]}
            style={styles.amountError}
            accessibilityLiveRegion="polite">
            {amountError}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <ScreenContainer>
        <Header
          title={t('accounts.reviewScreenTitle')}
          message={t('accounts.reviewScreenMessage')}
        />

        {status === 'loading' && (
          <View style={styles.centered}>
            <ActivityIndicator
              size="large"
              color={colors[accent][2]}
              accessibilityLabel={t('accounts.reviewLoading')}
            />
          </View>
        )}

        {status === 'error' && (
          <View style={styles.centered}>
            <Text color={colors[secondary][0]} style={styles.message}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('common.retry')}
              onPress={reload}
              style={styles.retryButton}>
              <Text color={colors[white][0]}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'success' && pending.length === 0 && (
          <View style={styles.centered}>
            <Text color={colors[gray][0]} style={styles.message}>
              {t('accounts.reviewEmptyState')}
            </Text>
          </View>
        )}

        {status === 'success' && pending.length > 0 && (
          <FlatList
            data={pending}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScreenContainer>

      <ConfirmDialog
        visible={netWorthChange !== null}
        tone="info"
        title={t('accounts.netWorthChangedTitle')}
        message={
          netWorthChange
            ? t('accounts.netWorthChangedMessage', {
                before: formatCentsToCurrency(netWorthChange.before),
                after: formatCentsToCurrency(netWorthChange.after),
              })
            : ''
        }
        onRequestClose={dismissNetWorthChange}
        primaryLabel={t('common.ok')}
        onPrimaryPress={dismissNetWorthChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  centered: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  message: {
    paddingHorizontal: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    height: 44,
    minWidth: 120,
    borderRadius: 10,
    backgroundColor: colors[secondary][0],
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    width: '100%',
    paddingBottom: 30,
  },
  card: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: colors[white][0],
    padding: 14,
    marginBottom: 12,
  },
  rowSubtitle: {
    marginTop: 2,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonPrimary: {
    flex: 1,
    // `minHeight`, no `height`: "This balance in my favor is correct"
    // envuelve a 3 lineas en ingles y en pantallas angostas — un alto
    // fijo de 44 recortaba la tercera linea (medido en el emulador).
    // 44 sigue siendo el SUELO del objetivo tactil, no un techo.
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors[primary][0],
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  actionButtonSecondary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors[primary][0],
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  amountInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors[gray][0],
    fontSize: 15,
    color: colors[accent][2],
  },
  confirmAmountButton: {
    height: 44,
    minWidth: 90,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors[primary][0],
    paddingHorizontal: 12,
  },
  confirmAmountButtonDisabled: {
    backgroundColor: colors[gray][0],
  },
  amountError: {
    marginTop: 6,
  },
});

export default BalanceReview;
