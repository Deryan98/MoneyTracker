# 0004 — `seedKey` y traducción en vivo de categorías y cuentas sembradas

Status: accepted
Date: 2026-09-11

## Contexto

El dueño pidió, textualmente: *"Si cambio la app a español, la data inyectada
por defecto para categorías y cuentas no se traducen, necesito que también la
información cambie."* Es decir: quiere que el nombre de una fila SEMBRADA siga
el idioma activo EN VIVO — al cambiar de idioma y volver a mirar la pantalla,
no solo en el instante en que la fila se creó.

Esta ADR **sustituye a la 0003** (`0003-siembra-traducida-fusion-de-categorias-heredadas-en-codigo.md`,
ahora `Status: superseded by 0004`), que había rechazado exactamente esta
misma columna `seedKey` con dos argumentos:

1. *"Contradice una decisión ya tomada y documentada"* — invalidado por el
   propio encargo: el dueño pide explícitamente cambiar esa decisión. Usarlo
   como argumento de peso era circular.
2. *El alcance real toca la capa de presentación, no solo el esquema* — este
   argumento **sí era correcto** y esta ADR no lo niega: lo incorpora al
   diseño en vez de usarlo para evitar el trabajo. Ver la sección de
   presentación más abajo para cómo se acotó ese alcance a UN solo punto de
   resolución en vez de a las ~25 pantallas/mappers/hooks que hoy leen
   `category.name`/`account.name`.

También coexiste con dos decisiones de numeración ya tomadas en paralelo por
otro encargo (tarjetas de crédito, ADR 0001 y 0002, ninguna con código escrito
todavía a la fecha de esta ADR): esta migración toma el **009** — el primer
hueco libre — y esas dos ADR se renumeran a 010/011/012. Ver la nota de
renumeración en cada una.

## Decisión

### 1. Columna `seedKey TEXT` nullable, en `categories` Y en `accounts`

Migración 009 (`src/db/migrations/009_seedKeyForCategoriesAndAccounts.ts`),
aditiva, sin `CHECK`, sin `requiresForeignKeysOff` — mismo patrón que
`envelopes.completedAt`/`closingMovementId` (migración 008):

```sql
ALTER TABLE categories ADD COLUMN seedKey TEXT;
ALTER TABLE accounts ADD COLUMN seedKey TEXT;
```

- `NULL` — la fila es del usuario: la creó a mano, o renombró una sembrada
  (ver más abajo). Se pinta el literal de la columna de texto (`category`/
  `name`) tal cual.
- Con valor — la fila sigue siendo la semilla original identificada por esa
  clave bajo `defaultCategories.`/`defaultAccounts.` en los JSON de i18n. Se
  pinta `i18n.t('<namespace>.<seedKey>')`, resuelto EN CADA LECTURA, no en el
  momento de sembrar.
- La columna de texto (`category`/`name`) **se sigue escribiendo siempre**,
  incluso para una fila con `seedKey`: es el fallback si esa clave alguna vez
  desapareciera de los JSON (`i18n.t` devuelve la clave sin traducir en ese
  caso, nunca lanza) — nunca queda vacía ni se convierte en una copia muda de
  la clave.

### 2. Backfill de las filas ya sembradas, en la misma migración

Toda instalación existente ya tiene filas sembradas SIN esta columna (por la
migración 003/006, en inglés fijo, o por `seedDefaultCategoriesOnce`, en el
idioma activo del momento en que corrió). La migración 009 las marca,
emparejando por **nombre exacto + tipo + icono** contra las 44 combinaciones
posibles (22 claves × 2 idiomas) de `src/data/defaultCategories.ts`, más el
único literal de cuenta que siembra la migración 004 (`'Efectivo'`) y su
traducción inglesa.

**Guarda de cardinalidad, no negociable:** cada `UPDATE` lleva
`AND (SELECT COUNT(*) FROM categories WHERE <mismo name+type+icon>) = 1`. Si
dos filas calzan el mismo nombre+tipo+icono (un usuario creó una categoría
homónima), NINGUNA se toca — no hay forma de saber cuál es "la de verdad" sin
un dato que esta tabla no tiene (no existe `createdAt`), así que ante la duda
no se adivina. Verificado con un caso real: en la base del dueño, "Despensa"
(creada a mano) y "Supermercado" (sembrada, clave `groceries`) comparten tipo
`expense` e icono `shopping-cart` — pero como sus NOMBRES son distintos, cada
`UPDATE` cuenta solo las filas de su propio nombre exacto: "Supermercado"
cuenta 1 y se marca; "Despensa" no calza ningún literal de la lista y queda en
`NULL`. Ver la sección de verificación para la prueba con SQL real.

`Loan`/`Credit card` (migración 003, ambos tipos) se excluyen a propósito —
no aparecen en ninguna sentencia del backfill. Están en vías de retiro por la
ADR 0002 (migración 012): marcarlas con `seedKey` las traduciría en vivo justo
antes de jubilarlas.

Las filas de la migración 003 que NO coinciden exactas con ninguna de las 44
combinaciones (`House`, `Food`, `Bills`, `Children`, `Rent`, el `Interests` de
INGRESO) se quedan sin `seedKey`, tratadas como si fueran del usuario — igual
diagnóstico que ya hacía la ADR 0003 para el caso `Food`/`Bills` (ambiguos:
`Food` podría mapear a `groceries` o a `diningOut`, decisión de producto, no
de arquitectura) y que esta ADR no reabre.

### 3. `seedDefaultCategoriesOnce` escribe `seedKey` desde ahora

`src/db/queries/seedQueries.ts` gana una columna más en su `INSERT`
(`seedKey = category.key` de `DEFAULT_CATEGORIES`) y en el `UPDATE` que
renombra el `Interests` heredado de la migración 006 (`seedKey =
'feesInterest'`, la clave a la que se está fusionando). No hay migración de
`app_meta` ni cambio de flag: es la misma función, mismo gateo por
`defaultCategoriesSeeded`, con una columna más en cada escritura.

### 4. Renombrar una fila sembrada borra su `seedKey` — SOLO si el nombre cambia DE VERDAD

Este es el punto que la ADR 0003 señaló como ambiguo — *"¿el mero acto de
abrir el formulario de edición cuenta como intención de romper el vínculo, o
hace falta que efectivamente cambie el texto?"* — y tenía razón en señalarlo.
La respuesta que esta ADR fija: **hace falta que el nombre guardado cambie de
verdad al GUARDAR**, nunca el mero hecho de abrir/mostrar el formulario.

La comparación NO es contra el texto crudo de la columna (`categories.category`
/ `accounts.name`), sino contra el nombre YA RESUELTO de la fila actual — el
mismo valor que el formulario mostró al cargar (`resolveSeedName(row.category,
row.seedKey, 'defaultCategories')`). La razón: una fila sembrada en un idioma
puede mostrarse, hoy, en OTRO — el usuario cambió el idioma de la app entre la
siembra y esta edición. Comparar contra la columna cruda marcaría como
"renombre" un simple "abrí, no toqué nada, guardé", exactamente el bug que la
ADR 0003 temía.

`updateCategory`/`updateAccount` (`src/db/queries/{categories,accounts}Queries.ts`)
implementan esto en una única sentencia `UPDATE`, sin round trip adicional más
allá del `SELECT` que ya hacían (o uno mínimo, en el caso de `updateAccount`,
solo cuando `name` viene en el input):

```sql
UPDATE categories
   SET category = ?, icon = ?, type = ?,
       seedKey = CASE WHEN ? THEN NULL ELSE seedKey END
 WHERE id = ?;
```

El parámetro del `CASE` es `isEffectiveRename` (`0`/`1`), calculado en JS antes
de la sentencia. SQLite evalúa el lado derecho de cada asignación de un
`UPDATE` contra la fila ANTES de escribir, así que `seedKey` en el `ELSE` sigue
siendo el valor viejo de esa misma fila — no hay condición de carrera con la
propia escritura.

### 5. Capa de presentación: UN solo punto de resolución, en la capa de consultas

Esto es la respuesta directa al segundo argumento (válido) de la ADR 0003.
Se midió el alcance real: `category.name`/`account.name` se lee, HOY, en al
menos 25 sitios distintos entre pantallas, mappers, hooks y partials — sin
contar `AllMovementsScreen/mappers.ts`, que reexporta el mapper de
`ResumenScreen`. Pedirle a cada uno de esos sitios que aprenda a mirar
`seedKey` y llamar `i18n.t` (la alternativa "en cada pantalla") es exactamente
la superficie de bugs que la ADR 0003 correctamente temía: basta con que UNO
de esos 25 sitios se cree mañana sin conocer esta convención para que una
categoría sembrada deje de traducirse ahí, en silencio, sin ningún error que
lo delate.

**Diseño elegido:** un único helper puro,
`resolveSeedName(storedName, seedKey, namespace)` en
`src/db/queries/seedName.ts`, invocado ÚNICAMENTE dentro de la capa de
consultas — en el punto exacto donde cada fila de `categories`/`accounts` se
convierte en un objeto `ICategory`/`IAccount`/`IFinanceAccountRef` para
devolverlo al resto de la app:

- `categoriesQueries.ts` — `mapRowToCategory` (usado por `getCategories`,
  `getCategoriesByType`, `getCategoryById`).
- `accountsQueries.ts` — `mapRowToAccountWithBalance`.
- `financesQueries.ts` — `getFinances`/`getFinanceById`, para `account`,
  `category` y `transferCounterpartAccount` (los tres son JOINs directos
  sobre `categories`/`accounts`, no pasan por las funciones de arriba).
- `analyticsQueries.ts` — `getSpendingByCategory`, `getIncomeByCategory`,
  `getMonthlySpendingByCategory` (cada una hace su propio JOIN a
  `categories`).
- `budgetsQueries.ts` — `getCategoryBudgets`, `getCategoryBudget`,
  `getAllCategoryBudgetsWithSpent` (mismo motivo).

`ICategory.name`/`IAccount.name`/`IFinanceAccountRef.name` YA VIENEN
resueltos cuando llegan a cualquier pantalla, hook o mapper — nada fuera de
`src/db/queries/` necesita cambiar una sola línea para que la traducción en
vivo funcione. Se verificó exhaustivamente que estas cinco son las ÚNICAS
consultas SQL de todo el proyecto que hacen `SELECT ... FROM categories`/
`JOIN categories`/`JOIN accounts` con el nombre en su `SELECT` (`grep` sobre
`src/db/queries/*.ts` — ver HANDOFF).

`seedKey` SÍ se expone en `ICategory`/`IAccount`/`IFinanceAccountRef` (no solo
`name` ya resuelto): ningún consumidor actual lo necesita, pero sirve como
documentación embebida en el tipo (por qué `name` puede diferir de lo que
"parece" estar guardado) y deja la puerta abierta a una pantalla futura que
quiera distinguir "sembrada" de "propia" (p. ej. una insignia) sin otro cambio
de esquema.

**Por qué la capa de consultas y no la capa de presentación**, a pesar de que
el patrón establecido del proyecto (`Screen / Hook / Mapper / Query`) dice
"Query owns SQL" y dejaría este tipo de formateo a los mappers:

- La capa de consultas YA hace exactamente este tipo de resolución en tiempo
  de lectura — el saldo de una cuenta (`IAccountWithBalance.balance`) nunca se
  guarda, se calcula en cada `SELECT`; esto es la misma idea aplicada a un
  nombre en vez de a un número.
- Varios de los 25 sitios (`BudgetsScreen` y sus partials, `CategoriesAdminScreen`,
  `AccountsAdminScreen`, `ArchivedAccounts`, `FormScreen`'s selectors de
  cuenta, `useCategoryForm`/`useAccountForm`, `EntityPickerSheet`,
  `useTransactionActions`) consumen `ICategory`/`IAccount`/`IBudgetOutcomeRow`
  directamente desde un hook, SIN pasar por un `mappers.ts` — no hay un único
  "punto de mapeo" natural para ellos en la capa de presentación. Resolver en
  la consulta es el único punto que de verdad es uno solo.
- `seedQueries.ts` ya importa `i18n` dentro de `src/db/queries/` desde antes
  de este encargo — no es un precedente nuevo, es el mismo que ya aceptó el
  propio proyecto para el mismo problema (nombres traducidos de filas
  sembradas).

El costo aceptado: `src/db/queries/*.ts` deja de ser "solo SQL" en un sentido
estricto — cinco de sus archivos llaman a un helper que llama a `i18n.t`. Se
consideró preferible a que la corrección de esta traducción dependiera de que
25 sitios de presentación, presentes y futuros, recuerden hacerlo bien.

## Verificación

Sobre una copia de la base real del dueño (`PRAGMA user_version = 8`, 8
cuentas, 24 categorías — ver HANDOFF para el detalle exacto de cada fila):

- Las 22 categorías con nombre EXACTO a alguna de las 44 traducciones quedan
  marcadas con su `seedKey`; las que no calzan exacto (`Alquiler de casa`,
  `Despensa`) quedan en `NULL`.
- "Despensa" (usuario) queda `NULL`; "Supermercado" (sembrada) queda marcada
  `groceries` — el caso de prueba explícito del encargo.
- Ninguna cuenta ni categoría cambia de `id`; `finances`/`category_budgets`
  no quedan con ninguna referencia huérfana.
- Ninguna fila `Loan`/`Credit card` existe en esta base (el dueño ya las
  había borrado a mano); la migración de todos modos nunca las menciona.
- Con un homónimo sintético (`Vivienda`/`expense`/`home` duplicado a mano),
  NINGUNA de las dos filas se marca — la guarda de cardinalidad funciona.

## Alternativas consideradas

- **Fusión puntual de categorías heredadas en código, sin `seedKey`** (ADR
  0003 original): rechazada por decisión del dueño — no resuelve la
  traducción EN VIVO al cambiar de idioma, que es exactamente lo pedido.
- **Resolver en cada mapper/pantalla en vez de en la capa de consultas**:
  considerada y rechazada — ver la sección de presentación arriba.
- **Migración SQL con el idioma detectado en tiempo de migración**:
  descartada por la misma razón que ya la descartaba la ADR 0003 — una
  migración no puede leer `i18next`/`AsyncStorage` desde dentro de su
  transacción síncrona.
- **Backfill sin guarda de cardinalidad** (marcar por nombre+tipo+icono sin
  contar homónimos): rechazada — es precisamente el riesgo que el encargo
  pidió evaluar explícitamente, y el caso Despensa/Supermercado de la base
  real del dueño demuestra que dos categorías del mismo tipo e icono
  coexisten hoy.

## Consecuencias

**Buenas:**
- El dueño obtiene traducción en vivo real: cambiar el idioma y volver a
  cualquier pantalla muestra los nombres sembrados en el idioma nuevo, sin
  releer la app ni perder datos.
- Un solo punto de resolución (`resolveSeedName`, cinco call sites, todos en
  `src/db/queries/`) en vez de ~25 sitios de presentación aprendiendo la
  misma regla.
- Renombrar una fila sembrada sigue siendo tan simple como antes desde la UI
  — el usuario edita un campo de texto y guarda; la clave se suelta sola,
  sin un paso adicional que recordar.
- Ninguna migración existente se toca; el backfill es aditivo y reversible en
  el sentido de que no borra ni sobrescribe ningún nombre existente, solo
  añade metadata.

**Malas / costo aceptado:**
- `src/db/queries/` deja de ser SQL puro en cinco archivos — ya tenía este
  precedente en `seedQueries.ts`.
- `Food`/`Bills`/`Children` (migración 003) siguen sin `seedKey` y en inglés
  para siempre, salvo edición manual del usuario — decisión de producto fuera
  de esta ADR, igual que ya lo era en la 0003.
- Dos consultas adicionales por guardado (`SELECT` antes del `UPDATE` en
  `updateCategory`/`updateAccount`) — coste despreciable frente al beneficio
  de no romper el vínculo de traducción en un guardado sin cambios reales.

## HANDOFF

- Migración: `src/db/migrations/009_seedKeyForCategoriesAndAccounts.ts`.
- Helper compartido: `src/db/queries/seedName.ts` (`resolveSeedName`).
- Tipos: `ICategory` (`src/interfaces/common.d.ts`), `IAccount` y
  `IFinanceAccountRef` (`src/db/queries/{accounts,finances}Queries.ts`) —
  todos ganan `seedKey: string | null`.
- Consultas tocadas: `categoriesQueries.ts`, `accountsQueries.ts`,
  `financesQueries.ts`, `analyticsQueries.ts`, `budgetsQueries.ts`.
- `seedDefaultCategoriesOnce` (`src/db/queries/seedQueries.ts`) actualizada.
- i18n: nuevo namespace `defaultAccounts` (`{"cash": "Efectivo"/"Cash"}`) en
  `src/i18n/locales/{es,en}.json`, paridad 1/1.
- Pendiente de verificar en el emulador del dueño (no hecho en esta apuesta,
  ver la nota de `senior-dba` en su respuesta): instalar sobre la base real
  (o una copia), confirmar que Resumen/Categorías/Cuentas/Presupuestos/Logros
  muestran los nombres sembrados en español, cambiar el idioma del sistema/app
  a inglés y confirmar que los MISMOS registros pasan a mostrarse en inglés
  sin perder ningún movimiento ni romper ningún saldo.
