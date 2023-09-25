export const dataTotal: ChartItem[] = [
  {value: 100, color: '#79D2DE', text: '10', focused: true},
  {value: 400, color: 'red', text: '40'},
  {value: 500, color: '#177AD5', text: '50'},
];

export const dataEfectivo: ChartItem[] = [
  {value: 150, color: '#79D2DE', text: '10', focused: true},
  {value: 450, color: 'red', text: '40'},
  {value: 600, color: '#177AD5', text: '50'},
];

export const dataCAhorros: ChartItem[] = [
  {value: 200, color: '#79D2DE', text: '10', focused: true},
  {value: 500, color: 'red', text: '40'},
  {value: 700, color: '#177AD5', text: '50'},
];

export const items: SelectOptions[] = [
  {
    label: 'Total',
    value: 'total',
  },
  {
    label: 'Efectivo',
    value: 'efectivo',
  },
  {
    label: 'Cuenta de ahorro',
    value: 'cahorro',
  },
];

export const data = [
  {
    value: 'total',
    finances: dataTotal,
  },
  {
    value: 'efectivo',
    finances: dataEfectivo,
  },
  {
    value: 'cahorro',
    finances: dataCAhorros,
  },
];
