# 0005 — Migración 010: retiro y traducción de categorías heredadas de la migración 003

Status: accepted

> **Enmienda 2026-09-12** — `Loan` pasa de "traducida y conservada" a RETIRADA,
> en sus dos tipos. Al señalarle que `Loan` y `Credit card` son el mismo error
> arquitectónico (ambos son `accounts.kind` desde la migración 006), el dueño decidió
> retirar las dos. La migración 010 se editó en el sitio porque aún no había salido de
> la rama. Quedan 3 traducciones (`Bills`, `Children`, `Food`) y 7 retiradas.
Date: 2026-09-11

## Contexto

El dueño revisó las categorías en su dispositivo real y dio instrucciones concretas,
distintas en varios puntos de lo que `po-pm` había shapeado antes sin su confirmación
(ver `docs/product/pitches/depurar-categorias-heredadas-duplicadas.md`, cuyo "Solución"
proponía retirar `House`/`Food`/`Bills`/`Children`/`Rent`/`Interests`(ingreso) — seis
filas — sin haberlo validado todavía con él). La revisión directa del dueño **reemplaza**
esa propuesta para tres de esas seis filas:

| Fila (migración 003/006) | tipo | icono | Decisión final del dueño |
|---|---|---|---|
| `Bills` | expense | `tags` | **Conservar, traducir** → "Facturas" |
| `Children` | expense | `child` | **Conservar, traducir** → "Hijos" |
| `Food` | expense | `shopping-cart` | **Conservar, traducir** → "Despensa" (concepto DISTINTO de `groceries`/Supermercado) |
| `Loan` | expense | `university` | **Conservar, traducir** → "Préstamo" |
| `Loan` | income | `university` | **Conservar, traducir** → "Préstamo" |
| `House` | expense | `home` | Retirar — duplica `Vivienda`/`housing` |
| `Credit card` | expense | `credit-card-alt` | Retirar — "no debería estar listada" |
| `Credit card` | income | `credit-card-alt` | Retirar — "no considero que sea un ingreso" |
| `Interests` | income | `line-chart` | Retirar — duplica `Intereses e inversiones`/`investments` |
| `Rent` | income | `home` | Retirar — duplica `Alquileres`/`rentalIncome` |

Además, categoría **nueva** de ingreso: `Business`/"Negocio".

Este encargo necesita el mecanismo `categories.retiredAt` **ya**, no cuando a la ADR
0001/0002 les tocara su turno — ambas seguían sin una sola línea de código escrita a la
fecha de esta migración (ver la nota de renumeración ya presente en las dos).

## Decisión

**Una sola migración, la 010**, que absorbe tres cosas que la ADR 0002 había separado en
una futura "migración 12" propia:

1. **`categories.retiredAt TEXT`**, aditiva — el mismo diseño exacto que ya proponía la
   ADR 0002 (columna ortogonal, no un reemplazo de nada, no un archivado de usuario).
2. **Backfill de `seedKey`** (mismo patrón que la migración 9/ADR 0004) sobre las cinco
   filas que se conservan traducidas: `Bills`→`bills`, `Children`→`children`,
   `Food`→`pantry` (no `groceries`: son dos conceptos distintos, ver
   `src/data/defaultCategories.ts`), `Loan`(expense)→`loan`, `Loan`(income)→`loan` (misma
   clave en las dos filas — el texto es idéntico en los dos idiomas, el `type` de cada
   fila ya las distingue; una segunda clave solo duplicaría el mismo string).
3. **Retiro** (`retiredAt` no nulo, ninguna fila borrada) de las cinco restantes:
   `House`, `Credit card`(x2), `Interests`(income), `Rent`(income).
4. **Inserción condicional** de `Business`/income, solo para instalaciones donde
   `seedDefaultCategoriesOnce` ya corrió (su bandera en `app_meta` existe) — ver el
   comentario de cabecera de la propia migración para el porqué de la condición.

Ver `src/db/migrations/010_retireLegacyCategoriesAndSeedKeys.ts` para el SQL completo y
su razonamiento línea por línea; no se repite aquí.

### Por qué se numera 010 y qué pasa con las ADR 0001 y 0002

- **ADR 0001** (cupo/confirmación de tarjetas, `creditLimit` /
  `initialBalanceConfirmedAt`) había tomado 010/011. Se **renumera a 011/012** — ver la
  nota añadida en ese documento. Ninguna de sus migraciones tenía código escrito, así
  que renumerar no rompe nada ya mergeado.
- **ADR 0002** (retiro de `Loan`/`Credit card` vía `retiredAt`, numerada 012 en su propia
  renumeración anterior) queda **`superseded by 0005`**. No porque su diseño estuviera
  mal — el mecanismo `retiredAt` de esta migración es literalmente el que ella propuso,
  sin cambios — sino porque:
  1. El número que reservaba (012) ya no existe como migración propia: el trabajo se
     adelantó y se fusionó aquí, en la 010.
  2. **El alcance ejecutado difiere del que ella describía.** La ADR 0002 proponía
     retirar `Loan` Y `Credit card`, ambos tipos, por ser el mismo caso arquitectónico
     (tipo de cuenta que también es categoría). El dueño, al revisar en el dispositivo,
     pidió retirar solo `Credit card` y **conservar y traducir** `Loan`. Esta migración
     ejecuta la instrucción del dueño, no el análisis original de la ADR 0002 — ver
     "Inconsistencia que se deja anotada" abajo.

Con esta migración, la secuencia queda: **010** (esta), **011** (`creditLimit`, ADR
0001), **012** (`initialBalanceConfirmedAt`, ADR 0001) — sin huecos, sin números
repetidos.

## Contrato de consulta — sin cambios sobre lo que ya especificaba la ADR 0002

| Call site | Filtra `retiredAt IS NULL` | Por qué |
|---|---|---|
| `useFormScreen.loadCategories` | **Sí, con excepción**: si el movimiento en edición ya apunta a una categoría retirada, se re-añade a la lista para que siga apareciendo seleccionada. | No se debe poder elegir una categoría retirada para un movimiento NUEVO; editar uno viejo no debe romperse. |
| `useBudgetsScreen` → `getCategoriesByType(db, 'expense', {activeOnly: true})` | Sí, sin excepción | Un presupuesto nuevo tampoco debe apuntar a una categoría retirada. Nota: solo consulta `type='expense'`, así que las de ingreso retiradas (`Credit card`) nunca llegaban aquí de todos modos. |
| `useCategoriesScreen` | No | Pantalla de historial/gestión — debe seguir mostrando el gasto ya registrado. |
| `AllMovementsScreen` → `getCategories` | No | El filtro por categoría de la lista de movimientos debe poder usar una categoría retirada. |
| `CategoriesAdminScreen` | No | Debe seguir viendo y administrando las categorías retiradas. |

Implementado exactamente como sugería la ADR 0002: `getCategories`/`getCategoriesByType`
ganan `{activeOnly?: boolean}` (default `false`, cero cambio de comportamiento para
cualquier llamador que no lo pase). Ver `src/db/queries/categoriesQueries.ts`.

## El riesgo de colisión "Food → Despensa" y por qué se le puso un candado

Al preparar esta migración se verificó `/tmp/mt-backup.db` (copia de la base real del
dueño). Esa copia concreta **ya no tiene** las filas `House`/`Food`/`Bills`/`Children`/
`Loan`/`Credit card`/`Interests`(income)/`Rent` — deben haberse borrado a mano en algún
momento anterior a esta copia, así que en ella los `UPDATE`s de esta migración no tocan
ninguna fila (verificado, ver el HANDOFF de esta sesión). Pero esa misma copia confirma
un hecho relevante para **cualquier otra instalación** que sí conserve `Food`: existe una
categoría `Despensa` (`expense`, icono `shopping-cart`, con movimientos y un presupuesto
mensual reales) creada A MANO por el dueño, ya documentada como caso real en el
comentario de la migración 9.

Si una instalación tiene AMBAS — la fila `Food` (migración 3, sin tocar) Y una fila
`Despensa` hecha a mano — traducir `Food` a "Despensa" (la traducción que pidió el dueño)
haría que la pantalla de categorías mostrara **dos** filas con el mismo nombre
"Despensa": exactamente el tipo de duplicado visible que todo este encargo busca
eliminar. La guarda de cardinalidad (`COUNT(*) = 1`) no protege contra esto — compara la
fila `Food` contra sí misma, no contra una fila con un nombre distinto.

**Decisión:** la migración 010 y el renombrado equivalente en `seedQueries.ts`
(`LEGACY_TRANSLATED_CATEGORIES`, para instalaciones nuevas) llevan una condición extra
solo para este caso: `AND NOT EXISTS (SELECT 1 FROM categories WHERE type = 'expense'
AND category IN ('Despensa', 'Pantry'))`. Si ya existe una fila con ese nombre, `Food`
se queda sin `seedKey` — exactamente como está hoy, tratada como si fuera del usuario —
en vez de traducirse y duplicar el nombre. No se le añadió el mismo candado a
`Bills`/`Children`/`Loan` por falta de evidencia equivalente: sería proteger contra un
riesgo no observado, y añadir condiciones sin evidencia es el mismo tipo de suposición
que este proyecto ya rechazó una vez (ver la pitch de tarjetas de crédito).

## Inconsistencia que se deja anotada, no resuelta

`Credit card` se retira; `Loan` se conserva y traduce. Ambas son, desde la migración 6,
**exactamente el mismo caso arquitectónico**: un tipo de cuenta (`credit_card`, `loan`)
que también existe como categoría, contando el mismo dinero dos veces si el usuario las
usa para ambas cosas a la vez (pagar la tarjeta/el préstamo como "gasto categorizado" en
vez de como transferencia entre cuentas). El dueño, explícitamente, pidió tratarlas
distinto. Esta migración ejecuta lo que pidió — no le corresponde a `senior-dba`
reinterpretar una decisión de producto ya tomada por el dueño de los datos — pero el
reparo se dejó escrito, visible y reversible, en dos sitios:

- `docs/architecture/tech-debt.md`, ítem "`Loan` sigue siendo categoría Y tipo de
  cuenta, `Credit card` ya no".
- El comentario de cabecera de `src/db/migrations/010_retireLegacyCategoriesAndSeedKeys.ts`
  y de `src/data/defaultCategories.ts`.

Si en el futuro se decide resolver la inconsistencia (retirar `Loan` también, o dejar de
tratar `Credit card`/`loan` como tipos de cuenta especiales), es una migración nueva y
una decisión de producto nueva — no algo que este documento fuerza.

## Alternativas consideradas

- **Migración propia (012) solo para `retiredAt` + `Loan`/`Credit card`, como proponía la
  ADR 0002, y una migración aparte para el resto**: rechazada — hubiera dejado a `Bills`/
  `Children`/`Food` sin traducir un ciclo de release más, cuando el mecanismo
  (`retiredAt`+backfill de `seedKey`) que necesitan es el MISMO que ya hay que escribir
  para `Loan`/`Credit card`. Bundlearlas es el mismo criterio que ya usó la migración 006
  ("ambos sirven al mismo caso").
- **Fusionar `Food` con `groceries` en vez de traducirla por separado**: rechazada,
  explícitamente pedida en contra por el dueño — usa ambas categorías por separado en su
  base real. Ver `defaultCategories.ts` para el detalle del porqué son dos conceptos.
- **Retirar `Loan` también, por consistencia con `Credit card`**: rechazada — no es una
  decisión que le toque tomar a `senior-dba` sin preguntar; el dueño ya dio la
  instrucción contraria de forma explícita. Ver "Inconsistencia" arriba.

## Consecuencias

**Buenas:**
- Las cinco categorías que el dueño usa de verdad (`Bills`/`Children`/`Food`/`Loan`x2)
  empiezan a traducir en vivo igual que las 22+1 curadas, cerrando la brecha que el
  propio `docs/architecture/tech-debt.md` ya señalaba.
- `House`/`Credit card`(x2)/`Interests`(income)/`Rent` dejan de ofrecerse para
  movimientos y presupuestos nuevos, sin borrar nada ni arriesgar integridad referencial.
- `Business`/"Negocio" queda disponible para toda instalación, vieja o nueva.
- Cero migraciones nuevas para el trabajo que la ADR 0001 sigue necesitando — solo se le
  corrieron los números.

**Malas / costo aceptado:**
- La inconsistencia `Loan`/`Credit card` queda sin resolver, por decisión expresa del
  dueño — ver arriba.
- El candado `avoidIfNameExists` de `Food`→`pantry` es una solución puntual, no un
  mecanismo general de detección de colisión de nombres traducidos — cualquier otra
  clave nueva que corra el mismo riesgo necesitará su propio candado explícito, a mano.
