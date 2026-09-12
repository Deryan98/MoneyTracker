import {FC} from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native';
import CatalogList from '@components/organisms/Lists/CatalogList/CatalogList';
import {TransactList} from '@components/organisms/Lists/TransactList';
import {Headings} from '@components/atoms/text/Headings/Headings';
import {accent, colors, gray, secondary, white} from '@constants/colors/colors';
import {useTranslation} from 'react-i18next';

export type FinancesStatus = 'loading' | 'error' | 'success';

interface FragmentSectionProps extends CatalogList {
  /** Pulsacion larga sobre un movimiento: administrarlo. */
  onLongPressFinance?: (financeId: number) => void;
  /** "Ver todos" en la cabecera de la lista de movimientos. */
  onPressSeeAllFinances?: () => void;
  transactSections: SectionTransactItem[];
  /** Passed straight through to `TransactList`'s own `headerTitle` —
   * see that component's doc comment (the selected account's name). */
  transactHeaderTitle: string;
  /** Passed straight through to `TransactList`'s own `headerSubtitle`
   * (the current month's name). */
  transactHeaderSubtitle: string;
  financesStatus: FinancesStatus;
  financesErrorMessage?: string;
  onRetryFinances: () => void;
  /**
   * Texto del vacio. Opcional: sin el se usa el generico de siempre.
   *
   * Lo calcula el llamador porque el mensaje honesto depende de dos
   * cosas que este componente no tiene: el periodo que se esta viendo y
   * si la cuenta tiene movimientos FUERA de el. Decir "aun no hay
   * transacciones para esta cuenta" cuando si las hay, solo que en otro
   * mes, es sencillamente falso.
   */
  emptyMessage?: string;
  isLoadingMoreFinances?: boolean;
  onEndReachedFinances?: () => void;
  refreshingFinances?: boolean;
  onRefreshFinances?: () => void;
}

const FragmentSection: FC<FragmentSectionProps> = ({
  data,
  onLongPressFinance,
  onPressSeeAllFinances,
  selectedId,
  onPressItem,
  onPressManageItem,
  transactSections,
  transactHeaderTitle,
  transactHeaderSubtitle,
  financesStatus,
  financesErrorMessage,
  onRetryFinances,
  emptyMessage,
  isLoadingMoreFinances,
  onEndReachedFinances,
  refreshingFinances,
  onRefreshFinances,
}) => {
  const {t} = useTranslation();
  return (
    <>
      <CatalogList
        data={data}
        selectedId={selectedId}
        onPressItem={onPressItem}
        onPressManageItem={onPressManageItem}
      />

      {financesStatus === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={colors[accent][2]}
            accessibilityLabel={t('accounts.loadingTransactions')}
          />
        </View>
      )}

      {financesStatus === 'error' && (
        <View style={styles.centered}>
          <Headings
            headingSize="H5"
            color={colors[secondary][0]}
            containerStyle={styles.message}>
            {financesErrorMessage ?? ''}
          </Headings>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('accounts.retryLoadingTransactions')}
            onPress={onRetryFinances}
            style={styles.retryButton}>
            <Headings headingSize="H5" color={colors[white][0]}>
              {t('common.retry')}
            </Headings>
          </TouchableOpacity>
        </View>
      )}

      {financesStatus === 'success' && transactSections.length === 0 && (
        <View style={styles.centered}>
          <Headings
            headingSize="H6"
            color={colors[gray][0]}
            containerStyle={styles.message}>
            {emptyMessage ?? t('accounts.noTransactionsYet')}
          </Headings>
        </View>
      )}

      {financesStatus === 'success' && transactSections.length > 0 && (
        <TransactList
          onLongPressItem={onLongPressFinance}
          onPressSeeAll={onPressSeeAllFinances}
          sectionData={transactSections}
          headerTitle={transactHeaderTitle}
          headerSubtitle={transactHeaderSubtitle}
          onEndReached={onEndReachedFinances}
          isLoadingMore={isLoadingMoreFinances}
          refreshing={refreshingFinances}
          onRefresh={onRefreshFinances}
        />
      )}
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
});

export default FragmentSection;
