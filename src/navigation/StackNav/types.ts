export type StackNavParams = {
  Dashboard: undefined;
  Form: undefined;
  /**
   * Misma pantalla que `Form`, en modo edicion. Es una RUTA APARTE y no
   * un parametro opcional de `Form` a proposito: `Form` es la ruta
   * inicial de este stack y el destino del boton flotante, asi que un
   * `financeId` guardado en sus parametros se quedaria pegado y el
   * siguiente toque al boton abriria la edicion del movimiento
   * anterior en vez de un movimiento nuevo.
   */
  EditTransaction: {financeId: number};
  /**
   * Misma pantalla que `Form`, abierta ya en modo Transferencia — la usa
   * el boton "Transferir" de Cuentas.
   *
   * Es una RUTA APARTE y no un `Form: {initialType?}` por el MISMO motivo
   * que `EditTransaction` justo arriba: un parametro guardado en `Form`
   * se queda pegado, y el siguiente toque al boton flotante abriria el
   * formulario en transferencia sin que nadie lo pidiera. Ya paso con
   * `financeId`; no se repite.
   */
  NewTransfer: undefined;
  /**
   * Alta de categoria, empujada desde la grilla del formulario: su
   * boton de volver devuelve al formulario, que es de donde se vino.
   */
  CreateCategory: undefined;
};
