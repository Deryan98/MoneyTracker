# 0003 — Siembra traducida y fusión de categorías heredadas: en código de app, no en migración ni columna `seedKey`

Status: superseded by 0004
Date: 2026-09-11

> **Nota de reversión (2026-09-11).** El dueño pidió explícitamente traducción
> EN VIVO de las categorías/cuentas sembradas al cambiar de idioma — la
> columna `seedKey` que esta ADR rechaza abajo. Ver
> `0004-seedkey-y-traduccion-en-vivo-de-la-siembra.md` para la decisión
> vigente.
>
> El rechazo de abajo se apoyaba en dos argumentos: (1) "contradice una
> decisión ya tomada y documentada" — inválido en cuanto el dueño pide
> cambiar esa decisión, es circular tomado como único argumento; y (2) que
> el alcance real toca la capa de presentación, no solo el esquema — **este
> segundo argumento seguía siendo correcto** y la ADR 0004 lo hereda
> explícitamente: en vez de negarlo, diseña alrededor de él (resolviendo la
> traducción en la capa de consultas, un único punto, para no tener que
> tocar cada pantalla que hoy pinta `category.name`/`account.name`). Se dejó
> el resto de este documento sin editar, íntegro, como registro histórico de
> por qué se descartó primero y qué llevó a reabrirlo.

## Contexto

El encargo original propone una columna `seedKey TEXT` nullable en `categories` y en
`accounts`: `NULL` = dato del usuario, se pinta el literal; con valor = sembrada, se
pinta `t(seedKey)` en vivo, siguiendo el idioma activo en cada render.

**Este problema ya se resolvió, parcialmente, en este mismo repo, antes de este
encargo — commit `6784904` (`feat(db): siembra categorias de uso diario en la primera
instalacion`), ya en la rama de trabajo actual:**

- `src/data/defaultCategories.ts` — 22 categorías de uso diario, cada una con una
  **clave** de traducción (`defaultCategories.<key>`), no un nombre.
- `src/db/queries/seedQueries.ts` (`seedDefaultCategoriesOnce`) — siembra esas 22
  **una sola vez por instalación**, resolviendo `i18n.t(...)` **en el momento de
  sembrar** y guardando el resultado como texto plano en `categories.category`. Corre
  desde `App.tsx`, después de `hydrateStoredLanguage()`, gateado por una fila en
  `app_meta` (migración 007) — nunca en una migración de esquema, porque una
  migración es SQL fijo y no puede llamar a `i18n.t`.
- El propio comentario de `defaultCategories.ts` ya deja la decisión escrita: *"el
  nombre se guarda como DATO... cambiar el idioma de la app despues NO renombra las
  que ya existen"*.
- Ya incluye un caso de **fusión de una categoría heredada de la migración 003**: la
  `'Interests'` (expense, sembrada por la migración 006 en inglés) se **renombra en
  su lugar** — mismo `id`, mismo historial de movimientos — a la traducción de
  `feesInterest`, en vez de insertarse una nueva al lado.

Esta ADR **no inventa el patrón — lo confirma como arquitectura aceptada, lo formaliza
por escrito (no existía ADR para él hasta ahora) y lo EXTIENDE** para cerrar el hueco
real que queda: la migración 003 (11 categorías en inglés, todavía sembradas en toda
instalación nueva porque es inmutable) solo tuvo UNA de sus filas fusionada
(`Interests` expense). Las demás — `House`, `Food`, `Bills`, `Children` (expense),
`Salary`, `Rent`, `Interests` (income) — siguen ahí, en inglés, sin fusionar, y
`seedDefaultCategoriesOnce` las deja intactas porque solo inserta lo que falta por
nombre exacto: en cuanto el idioma activo no coincide carácter por carácter con el
literal inglés de 2023, terminan **conviviendo dos filas** para el mismo concepto
(`'House'` en inglés + `'Housing'`/`'Vivienda'` traducida), que es exactamente el
síntoma que este encargo pide resolver.

## Decisión

### 1. Rechazo de la columna `seedKey` con traducción en vivo

**No se adopta.** Contradice una decisión ya tomada, ya implementada y ya documentada
en el código que existe hoy (`defaultCategories.ts`, cita arriba). Razones adicionales,
más allá de "ya se decidió lo contrario":

- **Alcance real, no solo de esquema.** `seedKey` no es aditiva de verdad: cada
  pantalla que hoy pinta `category.name`/`account.name` tendría que aprender a mirar
  `seedKey` primero y llamar a `t(seedKey)` en vez de usar la columna de texto —
  `CategoriesScreen`, `CategoriesAdminScreen`, el selector de categoría en el
  formulario, `AllMovementsScreen`, cualquier export futuro, y lo mismo en cuentas.
  Es un cambio transversal a la capa de presentación completa, no una columna que se
  añade y ya. El pitch de esta misma apuesta (S1-S3) es explícito en que un cambio de
  esta forma no es lo que se está pidiendo.
- **Renombrar deja de ser "hacerlo tuyo".** Con `seedKey`, "el usuario renombra y se
  borra la clave" es una regla más para programar y para que cada pantalla de edición
  respete (¿el mero acto de abrir el formulario de edición cuenta como intención de
  romper el vínculo, o hace falta que efectivamente cambie el texto?) — superficie de
  bugs nueva para un problema que la solución ya implementada no tiene: al guardar el
  nombre como texto en el momento de sembrar, un usuario que renombra simplemente
  edita una fila de texto, sin ningún estado oculto que romper.
- **Vive en `accounts` también, según el encargo original.** Pero `accounts` no tiene
  hoy ningún concepto de "sembrada" — la única cuenta con nombre literal
  (`'Efectivo'`, migración 004) es una sola fila, de una sola vez, y el pitch activa de
  este mismo ciclo (tarjetas de crédito) no toca `accounts.name`. Añadir `seedKey` ahí
  resolvería un problema que no está planteado en ningún frente de este encargo.

### 2. Se mantiene: siembra en código de aplicación, gateada por `app_meta`, nunca en migración

Confirmado como arquitectura aceptada (no hay cambio de rumbo aquí, solo formalización
por escrito): el idioma activo es un dato en tiempo de ejecución
(`i18next`/`AsyncStorage`), y una migración corre con SQL fijo dentro de una
transacción síncrona — no puede llamar `i18n.t`. Cualquier siembra o corrección que
dependa del idioma **tiene que** vivir en código de app, no en `src/db/migrations/`.
Esto ya está documentado en el propio `007_appMetaTable.ts` y en `seedQueries.ts`; esta
ADR simplemente le da el registro formal que le faltaba.

### 3. Extensión nueva: `mergeLegacySeedCategoriesOnce` — fusión acotada de la siembra de la migración 003

Nueva función en `src/db/queries/seedQueries.ts` (o archivo hermano
`legacySeedMerge.ts` si `senior-dba` prefiere separarlo — es su llamada de
implementación), **con su propia fila en `app_meta`**, independiente de
`defaultCategoriesSeeded`:

```
SEED_FLAG_KEY_LEGACY_MERGE = 'legacyEnglishCategoriesMerged'
```

**Por qué una fila de `app_meta` nueva y no reutilizar `defaultCategoriesSeeded` ni
extender la función existente in situ:** `seedDefaultCategoriesOnce` puede ya haber
corrido en el dispositivo del dueño con el código actual (commit `6784904`) antes de
que esta extensión exista — es una app sin release formal, pero el dueño instala y
prueba en su propio emulador/dispositivo constantemente (ver tribal knowledge de
`CLAUDE.md`: "verificar en emulador antes de afirmar que algo funciona"). Si la fusión
nueva se colgara de la MISMA función y el MISMO flag, y ese flag ya quedó puesto en su
dispositivo por una versión anterior de la función, la fusión nueva **nunca correría
ahí** — quedaría silenciosamente saltada para siempre en la única base de datos real
que existe hoy. Una fila de `app_meta` propia hace que esta extensión corra la próxima
vez que arranque la app, sin importar el historial de qué versión de
`seedDefaultCategoriesOnce` corrió antes.

**Alcance de la fusión — solo casos inambiguos, 1 a 1, por nombre+tipo exactos:**

| Literal migración 003/006 (`category`, `type`) | Clave destino en `DEFAULT_CATEGORIES` | ¿Se fusiona? |
|---|---|---|
| `House`, `expense` | `housing` | Sí |
| `Salary`, `income` | `salary` | Sí (nota: en inglés el texto resultante es idéntico al literal — no-op visible, pero corre igual por consistencia) |
| `Rent`, `income` | `rentalIncome` | Sí |
| `Interests`, `income` | `investments` | Sí |
| `Interests`, `expense` | `feesInterest` | **Ya fusionado** por el código existente — no se toca de nuevo |
| `Food`, `expense` | — | **No.** Ambiguo: podría mapear a `groceries` o a `diningOut`; decidir por el usuario, no por el arquitecto. |
| `Bills`, `expense` | — | **No.** Ambiguo: podría mapear a `utilities` o a `internetPhone`. |
| `Children`, `expense` | — | **No existe destino.** `DEFAULT_CATEGORIES` no tiene ninguna categoría de crianza/hijos. Inventar una fuera de este encargo. |
| `Loan`, `Credit card` (ambos tipos) | — | **No se fusionan — se retiran.** Ver ADR 0002. |

Las tres filas sin fusión (`Food`, `Bills`, `Children`) **se quedan exactamente como
están, en inglés, para siempre**, a menos que el dueño las edite a mano. Esto es una
limitación consciente, no un olvido — ver `docs/architecture/tech-debt.md`.

**Guarda contra colisión de homónimos (el riesgo que el encargo pidió evaluar
explícitamente):** `categories` no tiene `UNIQUE (category, type)` (documentado en el
propio código, migración 003). Un `UPDATE ... WHERE category = 'House' AND type =
'expense'` renombraría **todas** las filas que calcen, no solo la de la siembra
original, si el usuario hubiera creado por su cuenta otra categoría con el mismo
nombre exacto. La fusión debe llevar guarda de cardinalidad, ejecutada dentro de la
misma transacción síncrona (nada de `await` entre el `SELECT COUNT` y el `UPDATE` —
mismo requisito que ya impone el runner):

```sql
UPDATE categories
   SET category = ?, icon = ?
 WHERE category = 'House' AND type = 'expense'
   AND (SELECT COUNT(*) FROM categories WHERE category = 'House' AND type = 'expense') = 1;
```

Si el conteo es distinto de 1 (0 porque el usuario ya la borró/renombró, o más de 1
porque hay un homónimo), **no se toca nada** para ese literal — se deja como está, sin
adivinar cuál de las dos filas es "la de verdad". Esto es más estricto que el
renombrado de `Interests` que ya existe hoy en `seedQueries.ts` (que no lleva esta
guarda) — se señala como deuda técnica menor en `tech-debt.md`, no se corrige aquí
porque no fue pedido y ya corrió/puede haber corrido en producción con su comportamiento
actual.

**Orden de llamada en `App.tsx`:** después de `seedDefaultCategoriesOnce`, mismo
bloque `try`, mismo criterio de "después de `hydrateStoredLanguage()`" (necesita
`i18n.t` en el idioma correcto para escribir los nombres nuevos).

### 4. Relación con la migración 011 (ADR 0002)

Sin dependencia de orden entre sí: la migración 011 (retiro de `Loan`/`Credit card`)
es SQL puro, sin `i18n`, y corre en el pase de migraciones de `db.ts`, ANTES que
`App.tsx` llegue a llamar a `seedDefaultCategoriesOnce`/`mergeLegacySeedCategoriesOnce`
(que corren después de `initDatabase()` — ver el propio `App.tsx`). No hay carrera
posible entre ambas: para cuando el código de siembra en JS se ejecuta, el esquema
(incluida la columna `retiredAt`) ya está migrado.

## Riesgos concretos

- **El dueño ya puede tener el flag `defaultCategoriesSeeded` puesto** en su
  dispositivo de pruebas si corrió el commit `6784904` antes de esta extensión —
  resuelto por el flag independiente (punto 3).
- **`Food`/`Bills`/`Children` quedan en inglés indefinidamente** — aceptado y
  documentado como límite consciente, no un bug a perseguir en esta apuesta.
- **Un usuario que en el pasado renombró una categoría propia exactamente a `'House'`
  (expense)** vería esa fila fusionada a `'Housing'`/`'Vivienda'` igual que la
  sembrada, SI Y SOLO SI en ese momento sigue siendo la única fila `House`/`expense`
  (la guarda de cardinalidad ya cubre el caso de que haya dos). Riesgo residual
  aceptado: indistinguible de la fila sembrada real sin un dato que hoy no existe
  (`categories` no tiene `createdAt` ni ningún otro rastro de origen) — mismo tipo de
  riesgo, mismo argumento de aceptación, que ya asume el renombrado de `Interests` que
  ya está en producción.

## Alternativas consideradas

- **Columna `seedKey` + traducción en vivo** — rechazada, ver arriba.
- **Migración SQL con `UPDATE ... CASE` fijo por idioma detectado en tiempo de
  migración**: rechazada — no existe forma de leer `AsyncStorage`/`i18next` desde
  dentro de una transacción de `db.transaction()`, y aunque existiera, sería la misma
  arquitectura que ya se rechazó de tener SQL fijo dependiendo de estado mutable
  externo (mismo argumento que ya usa la migración 003 para no importar
  `categoriesData`).
- **No fusionar nada, dejar que el usuario borre y recree a mano** (lo que el dueño ya
  hizo una vez con `'Efectivo'`... no, con las categorías completas antes de este
  commit): rechazada como *plan por defecto* — es exactamente el trabajo manual que
  `seedDefaultCategoriesOnce` fue escrito para evitar, según su propio comentario de
  cabecera. Sí se acepta como *resultado residual* para los tres casos ambiguos
  (`Food`/`Bills`/`Children`), donde no hay alternativa segura mejor.
- **Pedir al dueño que resuelva la ambigüedad de `Food`/`Bills` con un mapeo 1:1
  explícito antes de escribir código**: es la opción correcta si se quiere cerrar esos
  tres casos también, pero es una decisión de producto (qué significa cada categoría
  para el dueño), no de arquitectura — se deja fuera de esta ADR y se anota en
  `tech-debt.md` con el trigger para retomarla.

## Consecuencias

**Buenas:**
- Cero cambio de arquitectura de presentación (nada aprende a mirar una `seedKey`) —
  el patrón ya validado (nombre resuelto una vez, guardado como texto) se mantiene
  íntegro.
- El dueño obtiene, sin trabajo manual, 4 de las 7 filas de la migración 003 fusionadas
  a sus equivalentes traducidos la próxima vez que abra la app, sin duplicados.
- Ningún movimiento (`finances`) ni presupuesto (`category_budgets`) pierde su
  categoría — la fusión SIEMPRE renombra en el mismo `id`, nunca inserta y reasigna.

**Malas / costo aceptado:**
- Tres categorías (`Food`, `Bills`, `Children`) quedan en inglés hasta que exista una
  decisión de producto sobre a qué se fusionan (o si se fusionan). Ver `tech-debt.md`.
- Dos flags de `app_meta` en vez de uno (`defaultCategoriesSeeded` +
  `legacyEnglishCategoriesMerged`) — costo de almacenamiento nulo, costo de lectura:
  quien lea `seedQueries.ts` en el futuro necesita el comentario de esta ADR para
  entender por qué no es un solo flag.
