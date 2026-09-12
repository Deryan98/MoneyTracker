/**
 * Categorias que se crean solas en la primera entrada a la app, para que
 * nadie tenga que inventarse sus basicas antes de poder registrar el
 * primer gasto. El CTA "Mas categorias" queda entonces para lo propio de
 * cada uno, no para lo que todo el mundo necesita igual.
 *
 * Cada entrada guarda una CLAVE de traduccion, no un nombre: el nombre
 * se resuelve al sembrar con el idioma activo (ver
 * `seedDefaultCategoriesOnce`). Ojo con lo que eso implica: el nombre se
 * guarda como DATO en `categories.category`, asi que cambiar el idioma
 * de la app despues NO renombra las que ya existen.
 *
 * Los nombres de icono son de FontAwesome 4.7 —el juego que trae
 * `react-native-vector-icons`— y los 22 estan verificados contra su
 * tabla de glifos. Un nombre inexistente no falla: se dibuja un cuadro
 * vacio y nadie se entera.
 *
 * Lo que NO esta aqui, a proposito: `Credit card`, que sembraba la
 * migracion 003 (una vez como gasto, una vez como ingreso). Desde la
 * migracion 006 es un TIPO DE CUENTA (`credit_card`), y pagar la
 * tarjeta es una transferencia entre cuentas, no un gasto — tenerla
 * tambien como categoria hacia contar el mismo dinero dos veces. El
 * interes si es gasto real y lo recoge `feesInterest`. La migracion 10
 * (`src/db/migrations/010_retireLegacyCategoriesAndSeedKeys.ts`) retira
 * ambas filas de `Credit card` con `retiredAt` — ver ADR 0005.
 *
 * `Loan` (misma migracion 003, mismo tipo de cuenta desde la 006, mismo
 * razonamiento) NO sigue esa regla: el dueno revisó las categorías en
 * el dispositivo y pidio explicitamente CONSERVARLA traducida en vez de
 * retirarla. Es la MISMA inconsistencia arquitectonica que `Credit
 * card` — sigue sin resolverse a proposito, por decision expresa del
 * dueno, no del equipo tecnico. Ver el reparo completo en
 * `docs/architecture/tech-debt.md` ("`Loan` sigue siendo categoria Y
 * tipo de cuenta...") y en la ADR 0005.
 */
export type DefaultCategory = {
  /** Clave bajo `defaultCategories.` en los JSON de i18n. */
  key: string;
  /** Nombre de icono de FontAwesome 4.7. */
  icon: string;
  type: 'expense' | 'income';
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // --- Gastos: el nucleo diario ---
  {key: 'groceries', icon: 'shopping-cart', type: 'expense'},
  // Separado del supermercado a proposito: es el gasto que mas se
  // descontrola y mezclarlo con la compra del mes lo esconde.
  {key: 'diningOut', icon: 'cutlery', type: 'expense'},
  {key: 'housing', icon: 'home', type: 'expense'},
  {key: 'utilities', icon: 'lightbulb-o', type: 'expense'},
  {key: 'internetPhone', icon: 'wifi', type: 'expense'},
  {key: 'transport', icon: 'bus', type: 'expense'},
  // Aparte de `transport`: quien tiene coche mira el combustible solo.
  {key: 'fuel', icon: 'car', type: 'expense'},
  {key: 'health', icon: 'heartbeat', type: 'expense'},
  {key: 'pharmacy', icon: 'medkit', type: 'expense'},
  {key: 'education', icon: 'graduation-cap', type: 'expense'},
  {key: 'clothing', icon: 'shopping-bag', type: 'expense'},
  {key: 'leisure', icon: 'film', type: 'expense'},

  // --- Gastos: muy frecuentes ---
  {key: 'subscriptions', icon: 'tv', type: 'expense'},
  {key: 'personalCare', icon: 'scissors', type: 'expense'},
  {key: 'pets', icon: 'paw', type: 'expense'},
  {key: 'gifts', icon: 'gift', type: 'expense'},
  // Sustituye al `Interests` en ingles que sembraba la migracion 006 —
  // ver `LEGACY_INTERESTS_NAME` en `seedQueries.ts`.
  {key: 'feesInterest', icon: 'percent', type: 'expense'},

  // --- Gastos: heredadas de la migracion 003, traducidas y conservadas ---
  // El dueno las reviso en el dispositivo (2026-09-11) y pidio
  // traducirlas en vez de retirarlas, a diferencia de `House`/`Credit
  // card`/`Rent`/`Interests`(ingreso) — ver ADR 0005 y la migracion 10,
  // que les asigna esta clave en las filas que YA existen (backfill,
  // igual que hizo la migracion 9 con las 22 originales).
  {key: 'bills', icon: 'tags', type: 'expense'},
  {key: 'children', icon: 'child', type: 'expense'},
  // Concepto DISTINTO de `groceries` (Supermercado: la compra grande),
  // no un renombrado — el dueno usa "Despensa" para reponer cosas
  // sueltas de cocina/casa entre una compra grande y otra, y en su base
  // real ya conviven ambas por separado. OJO: se confirmo en
  // `/tmp/mt-backup.db` que, en al menos una instalacion, existe ADEMAS
  // una categoria "Despensa" creada A MANO (icono compartido
  // `shopping-cart` con `groceries`) — si esa MISMA instalacion todavia
  // conserva la fila `Food` de la migracion 003 sin borrar, traducirla
  // a "Despensa" mostraria dos filas con el mismo nombre. La migracion
  // 10 guarda expresamente contra ese caso (ver su comentario) en vez
  // de ignorarlo.
  {key: 'pantry', icon: 'shopping-cart', type: 'expense'},
  // 'Loan' aparece DOS veces en la migracion 003 (gasto e ingreso, ver
  // el segundo `{key: 'loan', ...}` en la seccion de Ingresos). Ambas
  // entradas comparten la MISMA clave: el texto es identico en los dos
  // idiomas ("Prestamo"/"Loan") y el `type` de cada entrada ya las
  // distingue para la siembra/backfill — una segunda clave solo
  // duplicaria el mismo string sin anadir significado.

  // --- Ingresos ---
  {key: 'salary', icon: 'money', type: 'income'},
  {key: 'freelance', icon: 'briefcase', type: 'income'},
  {key: 'rentalIncome', icon: 'key', type: 'income'},
  {key: 'investments', icon: 'line-chart', type: 'income'},
  // Devoluciones y reintegros: sin esto se registran como ingreso y
  // inflan lo que de verdad se gana.
  {key: 'refunds', icon: 'exchange', type: 'income'},
  // Contraparte de ingreso de 'loan' arriba — ver ese comentario.
  // Categoria nueva pedida por el dueno tras revisar el dispositivo.
  // Icono 'building' (FontAwesome 4.7, verificado contra su glyphmap):
  // no reutiliza 'briefcase', que ya es `freelance` — un negocio propio
  // es distinto de trabajar por cuenta propia sin local/empresa.
  {key: 'business', icon: 'building', type: 'income'},
];

export default DEFAULT_CATEGORIES;
