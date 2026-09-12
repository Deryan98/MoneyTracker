/**
 * Migration `user_version` 10.
 *
 * El dueno reviso las categorias en su dispositivo real y dio
 * instrucciones concretas sobre las filas heredadas de la migracion 003
 * (y una, `Interests`/gasto, de la 006) que la migracion 9 dejo
 * deliberadamente sin `seedKey` por ser un caso ambiguo de producto —
 * ver ADR 0005 (`docs/architecture/adr/0005-migracion-010-retiro-y-
 * traduccion-de-categorias-heredadas.md`) para el porque completo,
 * incluida la reconciliacion con las ADR 0001/0002 (que reservaban este
 * numero para otro trabajo, ver mas abajo).
 *
 * --- Que hace, en una frase ---
 *
 * Anade `categories.retiredAt`; TRADUCE (backfill de `seedKey`, sin
 * borrar ni renombrar el texto crudo) cinco filas que el dueno pidio
 * CONSERVAR; RETIRA (marca `retiredAt`, sin borrar la fila) otras cinco
 * que pidio quitar de los selectores de movimientos nuevos; inserta
 * `Business`/ingreso para las instalaciones que ya sembraron sus 22
 * (ahora 27) categorias curadas y por tanto nunca la recibirian de otra
 * forma.
 *
 * --- Por que la 10, no la 12 (otra vez) ---
 *
 * La ADR 0001 habia numerado su trabajo (cupo/confirmacion de tarjetas)
 * como 010/011, y la ADR 0002 (retiro de `Loan`/`Credit card`) como 012
 * — ninguna de las dos tenia una sola linea de codigo escrita a la
 * fecha de esta migracion. El encargo de esta sesion (revision de
 * categorias en el dispositivo) necesita el mecanismo `retiredAt` YA, no
 * despues de esas dos, asi que ADR 0005 se lo queda: toma el 10 (el
 * siguiente hueco libre), y ADR 0001 se renumera a 011/012. El trabajo
 * que la ADR 0002 describia (retirar `Loan`/`Credit card` con
 * `retiredAt`) queda ABSORBIDO por esta migracion — no se le reserva un
 * numero propio, porque el mecanismo y buena parte del alcance (retirar
 * `Credit card`) son literalmente lo mismo que esta migracion ya hace.
 * ADR 0002 queda `superseded by 0005` — ver esa nota en el propio
 * documento.
 *
 * --- Columna `retiredAt`: exactamente el diseno de la ADR 0002 ---
 *
 * `ALTER TABLE categories ADD COLUMN retiredAt TEXT`, aditiva, sin
 * `CHECK`, sin `requiresForeignKeysOff` (no reconstruye tabla) — mismo
 * patron que `seedKey` en la migracion 9. `NULL` = fila activa (del
 * usuario o sembrada, no importa); con valor = "el sistema decidio no
 * volver a OFRECER esto en un selector de movimiento/presupuesto
 * NUEVO" — una decision de producto/arquitectura, no un archivado del
 * usuario (por eso no es `archivedAt`, nombre que `accounts`/`envelopes`
 * ya usan con otro significado). Ninguna fila se borra nunca por esta
 * migracion: `finances.idCategory` y `category_budgets.idCategory`
 * siguen apuntando exactamente donde apuntaban.
 *
 * --- Las CINCO filas que se TRADUCEN (backfill de `seedKey`, se
 * conservan) ---
 *
 * `Bills`(gasto/`tags`) → clave `bills`; `Children`(gasto/`child`) →
 * clave `children`; `Food`(gasto/`shopping-cart`) → clave `pantry`
 * (NO `groceries`: son dos conceptos distintos que el dueno usa por
 * separado, ver `defaultCategories.ts`); `Loan` en AMBOS tipos
 * (gasto e ingreso, icono `university`) → clave `loan` compartida (el
 * texto es identico en los dos idiomas, el `type` de cada fila ya las
 * distingue). Cada `UPDATE` sigue el patron EXACTO de la migracion 9:
 * emparejamiento por nombre+tipo+icono, guarda de cardinalidad
 * `COUNT(*) = 1`, `seedKey IS NULL` en el `WHERE` para idempotencia.
 *
 * Estas son EXACTAMENTE los literales en ingles que sembro la migracion
 * 003 — no hay traduccion equivalente en espanol que emparejar aqui
 * (a diferencia de la migracion 9, que comprobaba las DOS traducciones
 * de cada clave): estas 6 filas NUNCA se resembraron traducidas por
 * `seedDefaultCategoriesOnce`, porque hasta esta migracion no existian
 * en `DEFAULT_CATEGORIES` en absoluto. El caso simetrico — una
 * instalacion NUEVA que reciba la fila en ingles de la migracion 003 Y
 * esta misma migracion en el MISMO arranque — se resuelve por el
 * ORDEN: la migracion 003 siembra el literal ingles, y esta migracion
 * (que corre despues, en la misma pasada de arranque) lo encuentra y le
 * pone `seedKey` sin que haga falta comprobar ninguna otra grafia.
 *
 * `Food`→`pantry` NO lleva aqui ninguna guarda adicional contra la
 * "Despensa" creada a mano que se confirmo en una base real
 * (`/tmp/mt-backup.db`) — ese candado (`avoidIfNameExists`) vive en
 * `seedQueries.ts`, en el renombrado equivalente que corre para
 * instalaciones NUEVAS. Aqui, para una instalacion VIEJA, el mismo
 * candado se expresa como una condicion extra en el propio `UPDATE` de
 * abajo — ver esa sentencia.
 *
 * --- Las CINCO filas que se RETIRAN ---
 *
 * `House`(gasto/`home`) — duplica `Vivienda`(`housing`). `Credit
 * card` en AMBOS tipos (gasto e ingreso, `credit-card-alt`) — desde la
 * migracion 6 es un TIPO DE CUENTA (`credit_card`); tenerla tambien
 * como categoria cuenta el mismo dinero dos veces. `Interests`
 * (ingreso, `line-chart`) — duplica `Intereses e inversiones`
 * (`investments`). `Rent`(ingreso, `home`) — duplica `Alquileres`
 * (`rentalIncome`). Fecha literal fija (no `new Date()`), mismo
 * criterio que ya explican las migraciones 3/4/6/9.
 *
 * --- La inconsistencia que esto NO resuelve, a proposito ---
 *
 * `Loan` es, por diseno de cuentas (migracion 6), EXACTAMENTE el mismo
 * caso que `Credit card`: un tipo de cuenta que tambien existe como
 * categoria, contando el mismo dinero dos veces si se usa para ambas
 * cosas. El dueno pidio retirar `Credit card` pero CONSERVAR y traducir
 * `Loan`. Se ejecuta tal cual lo pidio — no es a esta migracion ni a
 * `senior-dba` a quien le toca re-interpretar esa decision — pero el
 * reparo queda escrito en `docs/architecture/tech-debt.md` y en la ADR
 * 0005 para que sea visible y reversible.
 *
 * --- `Business`/ingreso ---
 *
 * Categoria NUEVA, sin fila heredada equivalente. Se INSERTA aqui SOLO
 * si `app_meta.defaultCategoriesSeeded` ya existe — es decir, solo para
 * instalaciones donde `seedDefaultCategoriesOnce` YA corrio una vez y
 * por tanto JAMAS volvera a sembrar nada (su guarda es "si el flag
 * existe, no hagas nada"; ver `seedQueries.ts`). Sin este `INSERT` esas
 * instalaciones —el dueno incluido— no verian esta categoria nunca. Una
 * instalacion NUEVA no cumple esa condicion todavia (las migraciones
 * corren SIEMPRE antes de que la app pueda sembrar nada), asi que no la
 * recibe aqui — la recibe, ya en el idioma activo, del bucle normal de
 * `seedDefaultCategoriesOnce` sobre `DEFAULT_CATEGORIES`. Insertar
 * incondicionalmente en la migracion Y dejarla en `DEFAULT_CATEGORIES`
 * habria repetido, para esta fila nueva, el mismo bug de duplicado que
 * el resto de este archivo evita para las heredadas — ver el
 * comentario de `LEGACY_TRANSLATED_CATEGORIES` en `seedQueries.ts`.
 *
 * Icono `building` (FontAwesome 4.7, verificado contra el glyphmap real
 * de `react-native-vector-icons`) — no reutiliza `briefcase`, que ya es
 * `freelance`.
 *
 * --- Indice ---
 *
 * `idx_categories_active`, igual que sugeria la ADR 0002 — el volumen de
 * `categories` no lo necesita por rendimiento, pero es consistente con
 * `idx_accounts_active`/`idx_envelopes_active` y nada mas lo crea si no
 * se hace aqui.
 */
export const migration010Statements: string[] = [
  'ALTER TABLE categories ADD COLUMN retiredAt TEXT',

  // --- Traducidas y conservadas ---
  `UPDATE categories
      SET seedKey = 'bills'
    WHERE seedKey IS NULL
      AND category = 'Bills' AND type = 'expense' AND icon = 'tags'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Bills' AND type = 'expense' AND icon = 'tags') = 1;`,

  `UPDATE categories
      SET seedKey = 'children'
    WHERE seedKey IS NULL
      AND category = 'Children' AND type = 'expense' AND icon = 'child'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Children' AND type = 'expense' AND icon = 'child') = 1;`,

  // Candado extra (ver el comentario de cabecera): si YA existe una
  // categoria "Despensa"/"Pantry" de gasto (creada a mano, o sembrada
  // por una version futura de este mismo backfill), no se traduce
  // "Food" a ese mismo nombre — se queda sin `seedKey`, tratada como si
  // fuera del usuario, en vez de mostrarse duplicada.
  `UPDATE categories
      SET seedKey = 'pantry'
    WHERE seedKey IS NULL
      AND category = 'Food' AND type = 'expense' AND icon = 'shopping-cart'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Food' AND type = 'expense' AND icon = 'shopping-cart') = 1
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE type = 'expense' AND category IN ('Despensa', 'Pantry')
      );`,



  // --- Retiradas ---
  `UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND category = 'House' AND type = 'expense' AND icon = 'home'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'House' AND type = 'expense' AND icon = 'home') = 1;`,

  `UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND category = 'Credit card' AND type = 'expense' AND icon = 'credit-card-alt'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Credit card' AND type = 'expense' AND icon = 'credit-card-alt') = 1;`,

  `UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND category = 'Credit card' AND type = 'income' AND icon = 'credit-card-alt'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Credit card' AND type = 'income' AND icon = 'credit-card-alt') = 1;`,

  // `Loan` se retira por el MISMO motivo que `Credit card`: desde la
  // migracion 6 es un TIPO DE CUENTA (`loan`), y tener ademas la categoria
  // hace contar el mismo dinero dos veces. En una primera vuelta el dueno
  // pidio traducirla y conservarla; al senalarle la inconsistencia con
  // `Credit card` decidio retirar las dos. Sin `seedKey`, igual que el
  // resto de retiradas: conserva su literal en la pantalla de categorias.
  `UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND category = 'Loan' AND type = 'expense' AND icon = 'university'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Loan' AND type = 'expense' AND icon = 'university') = 1;`,

  // `Loan` se retira por el MISMO motivo que `Credit card`: desde la
  // migracion 6 es un TIPO DE CUENTA (`loan`), y tener ademas la categoria
  // hace contar el mismo dinero dos veces. En una primera vuelta el dueno
  // pidio traducirla y conservarla; al senalarle la inconsistencia con
  // `Credit card` decidio retirar las dos. Sin `seedKey`, igual que el
  // resto de retiradas: conserva su literal en la pantalla de categorias.
  `UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND category = 'Loan' AND type = 'income' AND icon = 'university'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Loan' AND type = 'income' AND icon = 'university') = 1;`,

  `UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND category = 'Interests' AND type = 'income' AND icon = 'line-chart'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Interests' AND type = 'income' AND icon = 'line-chart') = 1;`,

  `UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND category = 'Rent' AND type = 'income' AND icon = 'home'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Rent' AND type = 'income' AND icon = 'home') = 1;`,

  // --- Categoria nueva, solo para instalaciones ya sembradas ---
  `INSERT INTO categories (category, icon, type, seedKey)
    SELECT 'Business', 'building', 'income', 'business'
     WHERE EXISTS (SELECT 1 FROM app_meta WHERE key = 'defaultCategoriesSeeded')
       AND NOT EXISTS (SELECT 1 FROM categories WHERE category = 'Business' AND type = 'income');`,

  `CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(retiredAt) WHERE retiredAt IS NULL;`,
];

export default migration010Statements;
