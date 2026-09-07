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


