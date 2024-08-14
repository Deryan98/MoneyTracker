import {faSave} from '@fortawesome/free-solid-svg-icons/faSave';
type AccountParams = (colors: any) => CatalogCard[];
export const getAccounts: AccountParams = colors => [
  {
    id: 1,
    icon: faSave,
    iconColor: colors.white,
    iconBackground: colors.primary,
    field: 'AHORROS',
    balance: 9876,
  },
  {
    id: 2,
    icon: faSave,
    iconColor: colors.white,
    iconBackground: colors.primary,
    field: 'BALANCE',
    balance: 6789,
  },
  {
    id: 3,
    icon: faSave,
    iconColor: colors.white,
    iconBackground: colors.primary,
    field: 'EFECTIVO',
    balance: 9876,
  },
];
