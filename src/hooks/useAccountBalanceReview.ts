import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getDbConnection} from '@db/db';
import {
  confirmAccountBalanceCorrect,
  getAccountsPendingBalanceReview,
  getNetWorth,
  IAccountWithBalance,
  updateAccount,
} from '@db/queries';
import {parseAmountToCents} from '@utils/currency';

export type BalanceReviewStatus = 'loading' | 'success' | 'error';

/** El patrimonio neto de antes/despues de una sesion de revision
 * completa (S3/T12) — `null` mientras la sesion siga con cuentas
 * pendientes o ya se haya mostrado una vez. */
export interface NetWorthChange {
  before: number;
  after: number;
}

/**
 * Data + acciones de la pantalla de revision guiada (S3/T11, T12).
 *
 * Recorte explicito permitido por la pitch: una lista PLANA con accion
 * inline por cuenta, no un asistente paso a paso — el resultado que
 * pide cada AC es identico, con menos coreografia de UI.
 *
 * --- Por que esto no es una rama de `useAccountForm` ---
 *
 * `useAccountForm` edita UN campo a la vez con un formulario completo
 * (nombre, icono, tipo...). Esta pantalla resuelve MUCHAS cuentas con
 * dos acciones binarias cada una; comparte la validacion del monto
 * (`parseAmountToCents`) pero no el resto de la forma, asi que
 * duplicar solo esa validacion es mas simple que forzar ambos flujos a
 * compartir un hook con formas de estado incompatibles.
 *
 * --- Diseno de la sesion de patrimonio neto (T12) ---
 *
 * `netWorthBeforeRef` se captura UNA vez, la primera vez que este hook
 * carga la lista pendiente (sea porque la pantalla se acaba de montar,
 * o porque el usuario abandono a medias y volvio: cada montaje de este
 * hook es una sesion nueva, con su propio "antes"). `dialogShownRef`
 * evita que una segunda resolucion en la MISMA sesion (que ya no
 * debería ocurrir, porque la lista ya estaria vacia) dispare el dialogo
 * dos veces. Ninguno de los dos sobrevive a un desmontaje — abrir la
 * pantalla de nuevo despues de cerrarla es, a proposito, una sesion
 * distinta con su propio "antes" (ver el AC de T12 sobre resolver a
 * medias y volver despues).
 */
export const useAccountBalanceReview = () => {
  const {t} = useTranslation();
  const [status, setStatus] = useState<BalanceReviewStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [pending, setPending] = useState<IAccountWithBalance[]>([]);
  const [savingAccountId, setSavingAccountId] = useState<number | null>(null);
  const [amountErrorByAccountId, setAmountErrorByAccountId] = useState<
    Record<number, string>
  >({});
  const [netWorthChange, setNetWorthChange] = useState<NetWorthChange | null>(
    null,
  );

  const netWorthBeforeRef = useRef<number | null>(null);
  const dialogShownRef = useRef(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const db = await getDbConnection();
      const rows = await getAccountsPendingBalanceReview(db);
      if (netWorthBeforeRef.current === null) {
        netWorthBeforeRef.current = await getNetWorth(db);
      }
      setPending(rows);
      setStatus('success');
    } catch (e: any) {
      setErrorMessage(
        t('accounts.reviewLoadError', {
          message: e?.message ?? t('common.unknownError'),
        }),
      );
      setStatus('error');
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  /** Re-lee la lista pendiente tras resolver una cuenta y, si con eso
   * se vacio, cierra la sesion con el dialogo de T12 — una sola vez. */
  const afterResolvingOne = useCallback(async () => {
    const db = await getDbConnection();
    const rows = await getAccountsPendingBalanceReview(db);
    setPending(rows);
    if (rows.length === 0 && !dialogShownRef.current) {
      dialogShownRef.current = true;
      const after = await getNetWorth(db);
      setNetWorthChange({
        before: netWorthBeforeRef.current ?? after,
        after,
      });
    }
  }, []);

  /** "Este saldo a favor es correcto" — sin campos adicionales, no
   * cambia ningun monto. */
  const confirmBalanceCorrect = useCallback(
    async (accountId: number): Promise<boolean> => {
      setSavingAccountId(accountId);
      try {
        const db = await getDbConnection();
        await confirmAccountBalanceCorrect(db, accountId);
        await afterResolvingOne();
        return true;
      } catch (e: any) {
        console.warn(
          '[useAccountBalanceReview] confirmBalanceCorrect failed:',
          e?.message ?? e,
        );
        return false;
      } finally {
        setSavingAccountId(null);
      }
    },
    [afterResolvingOne],
  );

  /**
   * "Esto era mi limite de credito" — el valor viejo de `initialBalance`
   * se mueve a `creditLimit` (solo si esa cuenta no tenia uno ya
   * capturado) y `initialBalance` pasa a ser el monto REAL adeudado, en
   * negativo. `amountOwedText` es OBLIGATORIO y nunca acepta vacio ni
   * cero — `parseAmountToCents` (la misma validacion que un monto de
   * `finances`, no la de `initialBalance`) ya rechaza ambos casos.
   */
  const submitRealDebt = useCallback(
    async (accountId: number, amountOwedText: string): Promise<boolean> => {
      const parsed = parseAmountToCents(amountOwedText);
      if (parsed === null) {
        setAmountErrorByAccountId(prev => ({
          ...prev,
          [accountId]: t('accounts.reviewAmountOwedRequired'),
        }));
        return false;
      }
      const account = pending.find(a => a.id === accountId);
      if (!account) {
        return false;
      }
      setSavingAccountId(accountId);
      try {
        const db = await getDbConnection();
        await updateAccount(db, accountId, {
          // Solo se copia el valor viejo si la cuenta NO tenia ya un
          // cupo capturado por otro camino (S2) — no pisar un dato que
          // el usuario ya anoto a proposito.
          creditLimit: account.creditLimit ?? account.initialBalance,
          initialBalance: -parsed,
        });
        setAmountErrorByAccountId(prev => {
          const next = {...prev};
          delete next[accountId];
          return next;
        });
        await afterResolvingOne();
        return true;
      } catch (e: any) {
        console.warn(
          '[useAccountBalanceReview] submitRealDebt failed:',
          e?.message ?? e,
        );
        return false;
      } finally {
        setSavingAccountId(null);
      }
    },
    [pending, afterResolvingOne, t],
  );

  const clearAmountErrorFor = useCallback((accountId: number) => {
    setAmountErrorByAccountId(prev => {
      if (!(accountId in prev)) {
        return prev;
      }
      const next = {...prev};
      delete next[accountId];
      return next;
    });
  }, []);

  const dismissNetWorthChange = useCallback(() => setNetWorthChange(null), []);

  return {
    status,
    errorMessage,
    reload: load,
    pending,
    savingAccountId,
    amountErrorByAccountId,
    clearAmountErrorFor,
    confirmBalanceCorrect,
    submitRealDebt,
    netWorthChange,
    dismissNetWorthChange,
  };
};
