/**
 * Migration `user_version` 9.
 *
 * Anade `categories.seedKey` / `accounts.seedKey` y marca ("backfillea")
 * las filas ya sembradas que existen HOY en cualquier instalacion, para
 * que la app pueda traducir en VIVO los nombres de las filas que ella
 * misma sembro, siguiendo el idioma activo en cada lectura — ver ADR
 * 0004 (`docs/architecture/adr/0004-seedkey-y-traduccion-en-vivo-de-la-siembra.md`)
 * para el porque completo, incluida la revision de la ADR 0003 (ahora
 * `superseded by 0004`) que este cambio sustituye.
 *
 * --- Por que esta es la migracion 9, no la 12 ---
 *
 * Las ADR 0001 y 0002 (cupo/confirmacion de tarjetas y retiro de
 * `Loan`/`Credit card`) habian reservado 9/10/11 para un trabajo
 * DISTINTO que a fecha de esta migracion no tiene ni una linea de
 * codigo escrita — ningun archivo `00N_*.ts` para ellas existe todavia
 * en este directorio. `SCHEMA_VERSION` en `src/db/db.ts` se calcula como
 * la version de la ULTIMA entrada del array `migrations`; dejar un
 * hueco (por ejemplo, numerar esta como "12" y dejar 9-11 sin usar)
 * habria significado que, el dia que ese otro trabajo por fin se
 * escriba con los numeros 9-11, ninguna instalacion que ya hubiera
 * llegado a la version 12 los volveria a ejecutar jamas —
 * `createTables` solo corre migraciones cuya `version` sea MAYOR que el
 * `user_version` actual. Esta migracion toma el 9 (el siguiente hueco
 * real y libre) y las ADR 0001/0002 se renumeran a 10/11/12 para dejar
 * la secuencia sin huecos — ver esos documentos.
 *
 * --- Las dos columnas ---
 *
 * `ALTER TABLE ... ADD COLUMN seedKey TEXT` en ambas tablas, aditivo,
 * sin `CHECK`, sin `requiresForeignKeysOff` (no reconstruye ninguna
 * tabla) — mismo patron que `envelopes.completedAt`/`closingMovementId`
 * en la migracion 8. `NULL` (el valor por defecto de una columna nueva
 * sin `DEFAULT` explicito, para toda fila existente Y para toda fila
 * futura que no la mencione en su `INSERT`) significa "esta fila es del
 * usuario"; con valor, "esta fila sigue siendo la semilla identificada
 * por esa clave de `defaultCategories.`/`defaultAccounts.` en los JSON
 * de i18n" — ver `src/db/queries/seedName.ts`.
 *
 * Sin indice nuevo: nada filtra ni ordena por `seedKey`, solo se lee
 * fila a fila para decidir si traducir o no — un indice aqui seria
 * ruido, igual que el propio ADR 0002 senala para `retiredAt`.
 *
 * --- El backfill: por que UPDATE, no un INSERT/MERGE ---
 *
 * Las filas ya existen (sembradas por la migracion 003/006 en ingles
 * fijo, o por `seedDefaultCategoriesOnce` ya en el idioma activo de
 * turno) — esto NO inserta nada nuevo, solo marca cuales de las que YA
 * estan son, con certeza razonable, la semilla original.
 *
 * Emparejamiento por NOMBRE EXACTO + TIPO + ICONO contra:
 * (a) las DOS traducciones (ES y EN) de cada una de las 22 claves de
 *     `src/data/defaultCategories.ts` — cubre tanto una fila sembrada
 *     hoy mismo por `seedDefaultCategoriesOnce` (en el idioma activo en
 *     ese momento) como una instalacion que sembro en el otro idioma;
 * (b) el unico literal de cuenta que la migracion 004 siembra
 *     ('Efectivo', fijo, sin importar el idioma de la app en ese
 *     momento) y su traduccion inglesa 'Cash', por si un re-seed futuro
 *     alguna vez lo escribiera asi.
 *
 * Los literales EN INGLES de la migracion 003 (`House`, `Food`,
 * `Bills`, `Children`, `Salary`, `Rent`, el `Interests` de INGRESO) NO
 * se listan aparte: si su texto CRUDO coincide EXACTO con alguna de las
 * 44 cadenas de (a) — que es el caso de `Salary`/income/`money`, igual
 * caracter por caracter a la traduccion inglesa de `salary` — la propia
 * `UPDATE` de esa clave ya la encuentra y la marca, sin necesitar una
 * sentencia especial. Las demas (`House`, `Food`, `Bills`, `Children`,
 * `Rent`, `Interests` de ingreso) NO coinciden exactas con ninguna
 * traduccion — siguen siendo el caso AMBIGUO que la ADR 0003 (ahora
 * superseded) ya identifico y que esta migracion NO resuelve por
 * decision expresa: fusionar/traducir esas filas es una decision de
 * PRODUCTO (a que categoria de las 22 corresponde "Food": groceries o
 * diningOut) que le toca al dueno, no al esquema. Quedan como estan,
 * sin `seedKey`, tratadas como si fueran del usuario.
 *
 * `Loan` y `Credit card` (ambos tipos, migracion 003) se EXCLUYEN a
 * proposito — no aparecen en ninguna sentencia de abajo. Estan en vias
 * de retiro por la ADR 0002 (migracion 12 con la numeracion nueva):
 * marcarlas con `seedKey` las traduciria en vivo justo antes de que esa
 * migracion las jubile, trabajo que se tira a la basura de inmediato.
 *
 * --- La guarda de cardinalidad, no negociable ---
 *
 * Cada `UPDATE` lleva `AND (SELECT COUNT(*) FROM categories WHERE
 * <mismo name+type+icon>) = 1` — si CUALQUIER usuario creo a mano una
 * categoria homonima exacta (mismo nombre, tipo E icono — no solo
 * nombre), la cuenta da 2 o mas y la sentencia NO TOCA NINGUNA FILA. Es
 * deliberadamente todo-o-nada: no hay forma de saber CUAL de las dos es
 * "la de verdad" sin un dato que esta tabla no tiene (no existe
 * `createdAt` en `categories`), asi que ante la duda no se adivina.
 *
 * Caso real verificado en la base del dueno: existen a la vez
 * "Despensa" (creada a mano, expense, icono `shopping-cart`) y
 * "Supermercado" (sembrada, clave `groceries`, expense, mismo icono
 * `shopping-cart`). Como los NOMBRES son distintos, ninguna cuenta esta
 * inflada por la otra — cada `UPDATE` cuenta solo las filas con su
 * propio `category` exacto. "Supermercado"/expense/`shopping-cart`
 * cuenta 1 (ella misma) y se marca; "Despensa" no calza con ningun
 * literal de esta lista y se queda sin tocar, en `NULL`, exactamente
 * como debe.
 *
 * `seedKey IS NULL` en el `WHERE` de cada sentencia (ademas de en la
 * guarda) es puro idempotencia/defensa en profundidad: esta migracion
 * corre UNA vez por instalacion (como todas), pero si alguna vez se
 * reejecutara sobre una base ya marcada no reescribiria nada.
 */
export const migration009Statements: string[] = [
  'ALTER TABLE categories ADD COLUMN seedKey TEXT',
  'ALTER TABLE accounts ADD COLUMN seedKey TEXT',

  `UPDATE categories
      SET seedKey = 'groceries'
    WHERE seedKey IS NULL
      AND category = 'Supermercado' AND type = 'expense' AND icon = 'shopping-cart'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Supermercado' AND type = 'expense' AND icon = 'shopping-cart') = 1;`,
  `UPDATE categories
      SET seedKey = 'groceries'
    WHERE seedKey IS NULL
      AND category = 'Groceries' AND type = 'expense' AND icon = 'shopping-cart'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Groceries' AND type = 'expense' AND icon = 'shopping-cart') = 1;`,
  `UPDATE categories
      SET seedKey = 'diningOut'
    WHERE seedKey IS NULL
      AND category = 'Restaurantes y cafés' AND type = 'expense' AND icon = 'cutlery'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Restaurantes y cafés' AND type = 'expense' AND icon = 'cutlery') = 1;`,
  `UPDATE categories
      SET seedKey = 'diningOut'
    WHERE seedKey IS NULL
      AND category = 'Restaurants & cafés' AND type = 'expense' AND icon = 'cutlery'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Restaurants & cafés' AND type = 'expense' AND icon = 'cutlery') = 1;`,
  `UPDATE categories
      SET seedKey = 'housing'
    WHERE seedKey IS NULL
      AND category = 'Vivienda' AND type = 'expense' AND icon = 'home'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Vivienda' AND type = 'expense' AND icon = 'home') = 1;`,
  `UPDATE categories
      SET seedKey = 'housing'
    WHERE seedKey IS NULL
      AND category = 'Housing' AND type = 'expense' AND icon = 'home'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Housing' AND type = 'expense' AND icon = 'home') = 1;`,
  `UPDATE categories
      SET seedKey = 'utilities'
    WHERE seedKey IS NULL
      AND category = 'Servicios del hogar' AND type = 'expense' AND icon = 'lightbulb-o'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Servicios del hogar' AND type = 'expense' AND icon = 'lightbulb-o') = 1;`,
  `UPDATE categories
      SET seedKey = 'utilities'
    WHERE seedKey IS NULL
      AND category = 'Utilities' AND type = 'expense' AND icon = 'lightbulb-o'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Utilities' AND type = 'expense' AND icon = 'lightbulb-o') = 1;`,
  `UPDATE categories
      SET seedKey = 'internetPhone'
    WHERE seedKey IS NULL
      AND category = 'Internet y teléfono' AND type = 'expense' AND icon = 'wifi'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Internet y teléfono' AND type = 'expense' AND icon = 'wifi') = 1;`,
  `UPDATE categories
      SET seedKey = 'internetPhone'
    WHERE seedKey IS NULL
      AND category = 'Internet & phone' AND type = 'expense' AND icon = 'wifi'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Internet & phone' AND type = 'expense' AND icon = 'wifi') = 1;`,
  `UPDATE categories
      SET seedKey = 'transport'
    WHERE seedKey IS NULL
      AND category = 'Transporte' AND type = 'expense' AND icon = 'bus'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Transporte' AND type = 'expense' AND icon = 'bus') = 1;`,
  `UPDATE categories
      SET seedKey = 'transport'
    WHERE seedKey IS NULL
      AND category = 'Transport' AND type = 'expense' AND icon = 'bus'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Transport' AND type = 'expense' AND icon = 'bus') = 1;`,
  `UPDATE categories
      SET seedKey = 'fuel'
    WHERE seedKey IS NULL
      AND category = 'Combustible' AND type = 'expense' AND icon = 'car'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Combustible' AND type = 'expense' AND icon = 'car') = 1;`,
  `UPDATE categories
      SET seedKey = 'fuel'
    WHERE seedKey IS NULL
      AND category = 'Fuel' AND type = 'expense' AND icon = 'car'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Fuel' AND type = 'expense' AND icon = 'car') = 1;`,
  `UPDATE categories
      SET seedKey = 'health'
    WHERE seedKey IS NULL
      AND category = 'Salud' AND type = 'expense' AND icon = 'heartbeat'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Salud' AND type = 'expense' AND icon = 'heartbeat') = 1;`,
  `UPDATE categories
      SET seedKey = 'health'
    WHERE seedKey IS NULL
      AND category = 'Health' AND type = 'expense' AND icon = 'heartbeat'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Health' AND type = 'expense' AND icon = 'heartbeat') = 1;`,
  `UPDATE categories
      SET seedKey = 'pharmacy'
    WHERE seedKey IS NULL
      AND category = 'Farmacia' AND type = 'expense' AND icon = 'medkit'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Farmacia' AND type = 'expense' AND icon = 'medkit') = 1;`,
  `UPDATE categories
      SET seedKey = 'pharmacy'
    WHERE seedKey IS NULL
      AND category = 'Pharmacy' AND type = 'expense' AND icon = 'medkit'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Pharmacy' AND type = 'expense' AND icon = 'medkit') = 1;`,
  `UPDATE categories
      SET seedKey = 'education'
    WHERE seedKey IS NULL
      AND category = 'Educación' AND type = 'expense' AND icon = 'graduation-cap'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Educación' AND type = 'expense' AND icon = 'graduation-cap') = 1;`,
  `UPDATE categories
      SET seedKey = 'education'
    WHERE seedKey IS NULL
      AND category = 'Education' AND type = 'expense' AND icon = 'graduation-cap'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Education' AND type = 'expense' AND icon = 'graduation-cap') = 1;`,
  `UPDATE categories
      SET seedKey = 'clothing'
    WHERE seedKey IS NULL
      AND category = 'Ropa y calzado' AND type = 'expense' AND icon = 'shopping-bag'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Ropa y calzado' AND type = 'expense' AND icon = 'shopping-bag') = 1;`,
  `UPDATE categories
      SET seedKey = 'clothing'
    WHERE seedKey IS NULL
      AND category = 'Clothing & shoes' AND type = 'expense' AND icon = 'shopping-bag'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Clothing & shoes' AND type = 'expense' AND icon = 'shopping-bag') = 1;`,
  `UPDATE categories
      SET seedKey = 'leisure'
    WHERE seedKey IS NULL
      AND category = 'Ocio' AND type = 'expense' AND icon = 'film'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Ocio' AND type = 'expense' AND icon = 'film') = 1;`,
  `UPDATE categories
      SET seedKey = 'leisure'
    WHERE seedKey IS NULL
      AND category = 'Leisure' AND type = 'expense' AND icon = 'film'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Leisure' AND type = 'expense' AND icon = 'film') = 1;`,
  `UPDATE categories
      SET seedKey = 'subscriptions'
    WHERE seedKey IS NULL
      AND category = 'Suscripciones' AND type = 'expense' AND icon = 'tv'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Suscripciones' AND type = 'expense' AND icon = 'tv') = 1;`,
  `UPDATE categories
      SET seedKey = 'subscriptions'
    WHERE seedKey IS NULL
      AND category = 'Subscriptions' AND type = 'expense' AND icon = 'tv'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Subscriptions' AND type = 'expense' AND icon = 'tv') = 1;`,
  `UPDATE categories
      SET seedKey = 'personalCare'
    WHERE seedKey IS NULL
      AND category = 'Cuidado personal' AND type = 'expense' AND icon = 'scissors'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Cuidado personal' AND type = 'expense' AND icon = 'scissors') = 1;`,
  `UPDATE categories
      SET seedKey = 'personalCare'
    WHERE seedKey IS NULL
      AND category = 'Personal care' AND type = 'expense' AND icon = 'scissors'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Personal care' AND type = 'expense' AND icon = 'scissors') = 1;`,
  `UPDATE categories
      SET seedKey = 'pets'
    WHERE seedKey IS NULL
      AND category = 'Mascotas' AND type = 'expense' AND icon = 'paw'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Mascotas' AND type = 'expense' AND icon = 'paw') = 1;`,
  `UPDATE categories
      SET seedKey = 'pets'
    WHERE seedKey IS NULL
      AND category = 'Pets' AND type = 'expense' AND icon = 'paw'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Pets' AND type = 'expense' AND icon = 'paw') = 1;`,
  `UPDATE categories
      SET seedKey = 'gifts'
    WHERE seedKey IS NULL
      AND category = 'Regalos' AND type = 'expense' AND icon = 'gift'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Regalos' AND type = 'expense' AND icon = 'gift') = 1;`,
  `UPDATE categories
      SET seedKey = 'gifts'
    WHERE seedKey IS NULL
      AND category = 'Gifts' AND type = 'expense' AND icon = 'gift'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Gifts' AND type = 'expense' AND icon = 'gift') = 1;`,
  `UPDATE categories
      SET seedKey = 'feesInterest'
    WHERE seedKey IS NULL
      AND category = 'Comisiones e intereses' AND type = 'expense' AND icon = 'percent'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Comisiones e intereses' AND type = 'expense' AND icon = 'percent') = 1;`,
  `UPDATE categories
      SET seedKey = 'feesInterest'
    WHERE seedKey IS NULL
      AND category = 'Fees & interest' AND type = 'expense' AND icon = 'percent'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Fees & interest' AND type = 'expense' AND icon = 'percent') = 1;`,
  `UPDATE categories
      SET seedKey = 'salary'
    WHERE seedKey IS NULL
      AND category = 'Salario' AND type = 'income' AND icon = 'money'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Salario' AND type = 'income' AND icon = 'money') = 1;`,
  `UPDATE categories
      SET seedKey = 'salary'
    WHERE seedKey IS NULL
      AND category = 'Salary' AND type = 'income' AND icon = 'money'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Salary' AND type = 'income' AND icon = 'money') = 1;`,
  `UPDATE categories
      SET seedKey = 'freelance'
    WHERE seedKey IS NULL
      AND category = 'Trabajo independiente' AND type = 'income' AND icon = 'briefcase'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Trabajo independiente' AND type = 'income' AND icon = 'briefcase') = 1;`,
  `UPDATE categories
      SET seedKey = 'freelance'
    WHERE seedKey IS NULL
      AND category = 'Freelance' AND type = 'income' AND icon = 'briefcase'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Freelance' AND type = 'income' AND icon = 'briefcase') = 1;`,
  `UPDATE categories
      SET seedKey = 'rentalIncome'
    WHERE seedKey IS NULL
      AND category = 'Alquileres' AND type = 'income' AND icon = 'key'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Alquileres' AND type = 'income' AND icon = 'key') = 1;`,
  `UPDATE categories
      SET seedKey = 'rentalIncome'
    WHERE seedKey IS NULL
      AND category = 'Rental income' AND type = 'income' AND icon = 'key'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Rental income' AND type = 'income' AND icon = 'key') = 1;`,
  `UPDATE categories
      SET seedKey = 'investments'
    WHERE seedKey IS NULL
      AND category = 'Intereses e inversiones' AND type = 'income' AND icon = 'line-chart'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Intereses e inversiones' AND type = 'income' AND icon = 'line-chart') = 1;`,
  `UPDATE categories
      SET seedKey = 'investments'
    WHERE seedKey IS NULL
      AND category = 'Interest & investments' AND type = 'income' AND icon = 'line-chart'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Interest & investments' AND type = 'income' AND icon = 'line-chart') = 1;`,
  `UPDATE categories
      SET seedKey = 'refunds'
    WHERE seedKey IS NULL
      AND category = 'Reembolsos' AND type = 'income' AND icon = 'exchange'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Reembolsos' AND type = 'income' AND icon = 'exchange') = 1;`,
  `UPDATE categories
      SET seedKey = 'refunds'
    WHERE seedKey IS NULL
      AND category = 'Refunds' AND type = 'income' AND icon = 'exchange'
      AND (SELECT COUNT(*) FROM categories WHERE category = 'Refunds' AND type = 'income' AND icon = 'exchange') = 1;`,

  `UPDATE accounts
      SET seedKey = 'cash'
    WHERE seedKey IS NULL
      AND name = 'Efectivo' AND kind = 'cash' AND icon = 'money'
      AND (SELECT COUNT(*) FROM accounts WHERE name = 'Efectivo' AND kind = 'cash' AND icon = 'money') = 1;`,
  `UPDATE accounts
      SET seedKey = 'cash'
    WHERE seedKey IS NULL
      AND name = 'Cash' AND kind = 'cash' AND icon = 'money'
      AND (SELECT COUNT(*) FROM accounts WHERE name = 'Cash' AND kind = 'cash' AND icon = 'money') = 1;`,
];

export default migration009Statements;
