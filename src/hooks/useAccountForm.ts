import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getDbConnection} from '@db/db';
import {AccountKind, getAccountById, insertAccount, updateAccount} from '@db/queries';
import {formatCentsToCurrency, parseInitialBalanceToCents} from '@utils/currency';
import {isDebtAccountKind} from '@db/queries';
import {toIcon} from '@data/iconCatalog';
import {useNoticeDialog} from '@hooks/useNoticeDialog';

const DEFAULT_ACCOUNT_KIND: AccountKind = 'cash';

export type AccountFormMode = 'create' | 'edit';
export type AccountFormLoadStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * A que campo pertenece el error que se esta mostrando. `form` es para
 * los que no cuelgan de ningun input —falta de icono, fallo al
 * guardar— y la pantalla los pinta junto al boton de guardar.
 */
export type AccountFormErrorField = 'name' | 'amount' | 'creditLimit' | 'form';
type AccountFormError = {field: AccountFormErrorField; message: string};

/**
 * Strips `formatCentsToCurrency`'s display decoration ("$", thousands
 * commas) so its output can seed the same editable `decimal-pad` text
 * field that `parseInitialBalanceToCents` later re-parses on save —
 * reuses both existing money utilities instead of writing a new
 * cents<->string conversion.
 *
 * Devuelve la MAGNITUD, sin signo: el signo no vive en este campo sino
 * en `balanceSign`, un control aparte que solo aparece en las cuentas
 * de tipo deuda. El teclado `decimal-pad` de Android no tiene tecla
 * `-`, asi que pedirlo escrito no era viable; y separarlo obliga a
 * declarar la intencion ("debo" / "a favor") en vez de depender de que
 * el usuario se acuerde de un guion.
 */
const centsToEditableAmountText = (cents: number): string =>
  formatCentsToCurrency(Math.abs(cents)).replace(/[$,]/g, '');

/**
 * Form state for creating OR editing an account — same shape/spirit as
 * `useCategoryForm`, adapted to `accounts`' fields (`kind`,
 * `initialBalance`) instead of `categories`' (`type`).
 *
 * Pass an `accountId` to switch into edit mode: the hook loads that
 * account (`getAccountById`) and prefills every field before the form
 * is usable, and `saveAccount` calls `updateAccount` instead of
 * `insertAccount`. This is the SAME hook/form `CreateAccount` always
 * used — editing an account is not different enough from creating one
 * to justify a second hook (same fields, same validation, same
 * icon/kind pickers), only the load-then-prefill step and which write
 * query runs on save differ.
 */
export const useAccountForm = (accountId?: number) => {
  const {t} = useTranslation();
  const mode: AccountFormMode = accountId !== undefined ? 'edit' : 'create';

  // See this hook's file-level doc note in this slice's HANDOFF: a hook
  // can't render JSX, so a save success/failure notice (an
  // `Alert.alert` before) is exposed as `notice`/`dismissNotice` state
  // instead — `CreateAccount` (the only screen that calls this hook)
  // owns the actual `<ConfirmDialog>` element reading it.
  const {notice, showNotice, dismissNotice} = useNoticeDialog();

  const [inputText, setInputText] = useState<string>('');

  const [selectedIcon, onChangeSelectedIcon] = useState<IIcon>();

  const [selectedKind, setSelectedKind] =
    useState<AccountKind>(DEFAULT_ACCOUNT_KIND);

  const [initialBalanceText, setInitialBalanceText] = useState<string>('');
  /** Signo del saldo inicial. Solo se puede elegir en cuentas de tipo
   * deuda; en las demas se fuerza a positivo. */
  const [balanceSign, setBalanceSign] = useState<'positive' | 'negative'>(
    'positive',
  );

  /** El CUPO de una tarjeta de credito — solo visible/editable cuando
   * `selectedKind === 'credit_card'` (S2/T8). Vacio = "no capturado" =
   * `null` al guardar, NUNCA 0: el usuario que no anota su limite no
   * debe ver un 0% de uso inventado (ver `computeCreditUsage`). Es una
   * MAGNITUD sin signo, igual que `initialBalanceText` — un cupo nunca
   * es negativo, asi que se parsea siempre con `allowNegative: false`. */
  const [creditLimitText, setCreditLimitText] = useState<string>('');

  // Un solo error a la vez, ETIQUETADO con el campo al que pertenece.
  // Antes era un `string` suelto que la pantalla pintaba siempre bajo el
  // input del nombre, asi que "Saldo inicial no valido" aparecia debajo
  // de un nombre correcto. Mismo arreglo que `useEnvelopeForm`.
  const [formError, setFormError] = useState<AccountFormError | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Only meaningful in edit mode: prefilling the fields above requires
  // an async DB read before the form has anything real to show.
  // `CreateAccount` gates its full-form render on this being 'success'
  // (or the hook being in 'create' mode, where it just stays 'idle').
  const [loadStatus, setLoadStatus] = useState<AccountFormLoadStatus>(
    mode === 'edit' ? 'loading' : 'idle',
  );
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  const loadAccount = useCallback(async () => {
    if (accountId === undefined) {
      return;
    }
    setLoadStatus('loading');
    setLoadErrorMessage('');
    try {
      const db = await getDbConnection();
      const account = await getAccountById(db, accountId);
      if (!account) {
        setLoadErrorMessage(t('accounts.form.notFound'));
        setLoadStatus('error');
        return;
      }
      setInputText(account.name);
      // `toIcon` resuelve el id contra el catalogo COMPLETO. Antes se
      // buscaba solo entre los 16 fijos y cualquier otro icono entraba
      // con id -1, asi que al editar no aparecia marcado en la rejilla.
      onChangeSelectedIcon(toIcon(account.icon));
      setSelectedKind(account.kind);
      setInitialBalanceText(centsToEditableAmountText(account.initialBalance));
      setBalanceSign(account.initialBalance < 0 ? 'negative' : 'positive');
      // `creditLimit` es siempre una magnitud positiva (o `null`) — no
      // reutiliza `centsToEditableAmountText`'s `Math.abs` por
      // necesidad (nunca es negativo), solo por consistencia de
      // formato con el resto de campos monetarios editables.
      setCreditLimitText(
        account.creditLimit === null
          ? ''
          : centsToEditableAmountText(account.creditLimit),
      );
      setLoadStatus('success');
    } catch (e: any) {
      setLoadErrorMessage(
        t('accounts.form.loadError', {message: e?.message ?? t('common.unknownError')}),
      );
      setLoadStatus('error');
    }
  }, [accountId, t]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  // Cada error se borra en cuanto el usuario toca el campo del que
  // hablaba: dejarlo puesto mientras se corrige el valor hace que la
  // pantalla contradiga lo que se esta escribiendo.
  const clearErrorFor = (field: AccountFormErrorField) =>
    setFormError(current => (current?.field === field ? null : current));

  const onChangeInputText = (text: string) => {
    clearErrorFor('name');
    setInputText(text);
  };

  const onChangeSelectedKind = (kind: AccountKind) => {
    setSelectedKind(kind);
    // El campo de cupo solo aplica a `credit_card` (no-go de la pitch:
    // no se generaliza a `loan`/etc). Al salir de ese tipo se limpia el
    // texto para que un valor tecleado y luego abandonado no se cuele
    // en el guardado de una cuenta de otro tipo — mismo criterio que ya
    // aplica esta funcion al signo del saldo.
    if (kind !== 'credit_card') {
      clearErrorFor('creditLimit');
      setCreditLimitText('');
    }
    // Al pasar a un tipo que no admite deuda, el signo vuelve a
    // positivo: dejarlo en negativo guardaria un saldo negativo en una
    // cuenta de efectivo por un control que ya no esta a la vista.
    if (!isDebtAccountKind(kind)) {
      setBalanceSign('positive');
      return;
    }
    // Causa raiz del bug real (ver
    // docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md):
    // este default nacia en 'positive' incluso para un tipo de deuda, y
    // el usuario tenia que darse cuenta de que debia tocar un control
    // que la mayoria no toca. Solo en modo ALTA — en edicion,
    // `loadAccount` ya fijo `balanceSign` a partir del signo REAL del
    // `initialBalance` guardado, y reescribirlo aqui borraria esa
    // lectura la primera vez que alguien abre para editar una de las
    // cuentas ya mal cargadas (ids 6, 7, 8 del dueno) y toca el
    // selector de tipo sin querer cambiar nada mas.
    if (mode === 'create') {
      setBalanceSign('negative');
    }
  };

  const onChangeBalanceSign = (sign: 'positive' | 'negative') => {
    clearErrorFor('amount');
    setBalanceSign(sign);
  };

  /** Si este tipo de cuenta ofrece elegir el signo del saldo. */
  const allowsNegativeBalance = isDebtAccountKind(selectedKind);

  /** Si el campo de cupo de credito (S2) debe mostrarse — solo
   * `credit_card`, ver el no-go de la pitch. */
  const showsCreditLimitField = selectedKind === 'credit_card';

  const onChangeInitialBalanceText = (text: string) => {
    clearErrorFor('amount');
    setInitialBalanceText(text);
  };

  const onChangeCreditLimitText = (text: string) => {
    clearErrorFor('creditLimit');
    setCreditLimitText(text);
  };

  const handlePressItem = (id: number, icon: string) => {
    clearErrorFor('form');
    onChangeSelectedIcon({id, icon});
  };

  // Drives `SaveAction`'s `disabled` state: a name and an icon are both
  // required (kind always has a default, initial balance defaults to
  // $0.00 when left blank), and a save already in flight blocks
  // re-submitting.
  const canSave = inputText.trim() !== '' && !!selectedIcon && !isSaving;

  /** Returns `true` on success, `false` on a validation/save failure —
   * lets the screen decide what to do next (e.g. navigate back)
   * without this hook reaching into navigation itself. */
  const saveAccount = async (): Promise<boolean> => {
    if (inputText.trim() === '') {
      setFormError({field: 'name', message: t('accounts.form.nameRequired')});
      return false;
    }
    if (!selectedIcon) {
      setFormError({field: 'form', message: t('accounts.form.iconRequired')});
      return false;
    }
    const magnitude = parseInitialBalanceToCents(initialBalanceText, {
      // Se acepta tambien un `-` escrito a mano, no solo el control de
      // signo: un valor pegado desde fuera o escrito con un teclado
      // fisico no deberia rechazarse por la forma en que llego.
      allowNegative: allowsNegativeBalance,
    });
    const initialBalance =
      magnitude === null
        ? null
        : allowsNegativeBalance && balanceSign === 'negative'
          ? -Math.abs(magnitude)
          : magnitude;
    if (initialBalance === null) {
      setFormError({field: 'amount', message: t('accounts.form.invalidInitialBalance')});
      return false;
    }
    // El cupo solo se envia para `credit_card` — para cualquier otro
    // tipo siempre viaja `null`, aunque el campo tuviera texto de un
    // tipo anterior (defensa en profundidad; `onChangeSelectedKind` ya
    // lo limpia al cambiar de tipo). Vacio tambien es `null`: un cupo no
    // capturado nunca es 0 (ver el doc comment de `creditLimitText`).
    const creditLimitTrimmed = creditLimitText.trim();
    let creditLimit: number | null = null;
    if (showsCreditLimitField && creditLimitTrimmed !== '') {
      const parsedCreditLimit = parseInitialBalanceToCents(creditLimitTrimmed, {
        allowNegative: false,
      });
      if (parsedCreditLimit === null) {
        setFormError({
          field: 'creditLimit',
          message: t('accounts.creditLimitInvalid'),
        });
        return false;
      }
      creditLimit = parsedCreditLimit;
    }
    setIsSaving(true);
    try {
      const db = await getDbConnection();
      if (mode === 'edit' && accountId !== undefined) {
        await updateAccount(db, accountId, {
          name: inputText.trim(),
          icon: selectedIcon.icon,
          kind: selectedKind,
          initialBalance,
          creditLimit,
        });
        setFormError(null);
        showNotice('info', t('common.success'), t('accounts.form.updated'));
        return true;
      }
      await insertAccount(db, {
        name: inputText.trim(),
        icon: selectedIcon.icon,
        kind: selectedKind,
        initialBalance,
        creditLimit,
      });
      setFormError(null);
      setInputText('');
      onChangeSelectedIcon(undefined);
      setSelectedKind(DEFAULT_ACCOUNT_KIND);
      setInitialBalanceText('');
      setBalanceSign('positive');
      setCreditLimitText('');
      showNotice('info', t('common.success'), t('accounts.form.created'));
      return true;
    } catch (e: any) {
      setFormError({field: 'form', message: t('accounts.form.saveError', {message: e.message})});
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    mode,
    inputText,
    onChangeInputText,
    selectedIcon,
    handlePressItem,
    selectedKind,
    onChangeSelectedKind,
    initialBalanceText,
    balanceSign,
    onChangeBalanceSign,
    allowsNegativeBalance,
    onChangeInitialBalanceText,
    creditLimitText,
    onChangeCreditLimitText,
    showsCreditLimitField,
    nameError: formError?.field === 'name' ? formError.message : '',
    amountError: formError?.field === 'amount' ? formError.message : '',
    creditLimitError: formError?.field === 'creditLimit' ? formError.message : '',
    formError: formError?.field === 'form' ? formError.message : '',
    isSaving,
    canSave,
    saveAccount,
    loadStatus,
    loadErrorMessage,
    reloadAccount: loadAccount,
    notice,
    dismissNotice,
  };
};
