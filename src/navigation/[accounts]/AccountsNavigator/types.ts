import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type AccountsNavParams = {
  /**
   * La raiz de este stack: las pestanas Cuentas|Categorias. NO puede
   * llamarse igual que la pestana que lo contiene ni que sus propias
   * pestanas — react-navigation avisa de pantallas homonimas anidadas y
   * hace ambiguo a que ruta apunta un `navigate(...)`. De ahi la cadena
   * `Movements > MovementsHome > AccountsTab`.
   */
  MovementsHome: undefined;
  CreateAccount: undefined;
  /** S3/T11 — revision guiada de las cuentas de deuda que nacieron con
   * el cupo cargado como saldo positivo. Empujada desde el banner de
   * `AccountsScreen`, la pestana ("Cuentas") de este stack — ver
   * `docs/product/slices/S3-revision-guiada-de-tarjetas-mal-cargadas.md`. */
  BalanceReview: undefined;
  /** Crear/editar categoria empujadas desde la pestana de categorias
   * — ver el comentario del navegador. */
  CreateCategory: undefined;
  EditCategory: {categoryId: number};
};

export type AccountsNavigationProp = NativeStackNavigationProp<
  AccountsNavParams,
  'MovementsHome'
>;

export type CreateAccountNavigationProp = NativeStackNavigationProp<
  AccountsNavParams,
  'CreateAccount'
>;


