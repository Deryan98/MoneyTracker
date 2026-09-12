# 0002 — Migración 012: retiro de las categorías sembradas `Credit card` / `Loan`

Status: accepted
Date: 2026-09-11

> **Renumerada (2026-09-11).** Originalmente "migración 011". El encargo de
> traducción en vivo de la siembra (`seedKey`, ver ADR 0004) tomó el número 009
> — ya implementado, mientras que este frente y el de la ADR 0001 seguían sin
> código — así que este frente pasó a 012 y el de la ADR 0001 a 010/011. El
> resto de este documento ya refleja la numeración nueva.

## Contexto

La migración 003 (ya publicada, nunca editable) siembra 4 filas semánticamente
incorrectas: `Credit card` e `Loan`, una vez como `expense` y una vez como `income`.
Son incorrectas porque desde la migración 006 existen `accounts.kind = 'credit_card'`
y `'loan'` — pagar una tarjeta o un préstamo es una **transferencia entre cuentas**
(ya soportada, ver `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`),
no un gasto/ingreso categorizado. Tenerlas como categoría además de como tipo de cuenta
cuenta el mismo dinero dos veces si el usuario las usa para ambas cosas.

Esto ya está reconocido en el propio repo, en dos lugares distintos:

- `src/data/defaultCategories.ts` (comentario, líneas ~18-23): la lista de 22
  categorías de uso diario introducida en el commit `6784904` **deliberadamente
  omite** `Loan`/`Credit card` por esta misma razón.
- `docs/product/backlog.md`, "Nice to have" y "Decisiones abiertas heredadas": el
  ítem 3 nombra exactamente este problema como pendiente, "sigue sin tocarse,
  deliberadamente".

Lo que **no** existe todavía es la limpieza retroactiva: toda instalación nueva sigue
recibiendo las 4 filas hoy mismo, porque la migración 003 que las siembra es inmutable
por regla del proyecto. Y las instalaciones que ya corrieron la 003 (la del dueño
incluida, que las borró a mano) las conservan salvo que alguien las haya borrado
manualmente.

**Restricción real que borrarlas de raíz violaría:** `finances.idCategory` y
`category_budgets.idCategory` referencian `categories(id)` con `FOREIGN KEY`. Un
`DELETE FROM categories WHERE category IN ('Loan','Credit card')` falla (o, peor, si
algún día se activara un `ON DELETE CASCADE` que hoy no existe, borraría movimientos
reales) en cuanto una sola fila de `finances` apunte a una de esas categorías. No hay
evidencia de que el dueño tenga movimientos así hoy (backlog: "limpieza de las 3
transacciones de tarjeta ya mal-categorizadas del dueño" sigue como nice-to-have
separado), pero el esquema tiene que sobrevivir a la instalación de **cualquier**
usuario, no solo la suya.

## Decisión

**Migración 012** (después de 010 y 011 del ADR 0001 — ver protocolo de merge ahí),
sobre `categories` exclusivamente:

1. Columna aditiva, mismo patrón que `envelopes.completedAt`/`archivedAt`:

   ```sql
   ALTER TABLE categories ADD COLUMN retiredAt TEXT;
   ```

   `retiredAt` es **ortogonal**, no un reemplazo de nada: una categoría retirada sigue
   siendo una fila válida y consultable — solo dice "el sistema decidió que esto no
   debe ofrecerse para movimientos nuevos", una decisión de producto/arquitectura, no
   un archivado a mano del usuario (por eso no se llama `archivedAt`: ese nombre, si
   se necesita en el futuro para que el usuario archive SUS PROPIAS categorías, debe
   quedar libre y no significar dos cosas distintas).

2. Retiro inmediato, en la misma migración (mismo criterio que la migración 006 bundleó
   el `CHECK` nuevo de `accounts.kind` con la siembra de `Interests`: "ambos sirven al
   mismo caso"), acotado por nombre **e** icono exactos para no atrapar una categoría
   homónima que un usuario haya creado por su cuenta con otro icono:

   ```sql
   UPDATE categories
      SET retiredAt = '2026-09-11T00:00:00.000Z'
    WHERE retiredAt IS NULL
      AND ((category = 'Credit card' AND icon = 'credit-card-alt')
        OR (category = 'Loan' AND icon = 'university'));
   ```

   El literal de fecha es la fecha de esta migración (hecho histórico fijo, no
   `new Date()`), exactamente por la razón que ya documentan las migraciones 003/004.
   Esta `UPDATE` corre igual de bien en una instalación nueva (donde la 003 acaba de
   sembrar las 4 filas en el mismo arranque, antes de que la 012 corra, porque el
   runner aplica las migraciones pendientes en orden ascendente dentro de la misma
   pasada) y en una instalación vieja que ya las tenía.

3. **No se borra ninguna fila.** El `FOREIGN KEY` queda intacto siempre, sin
   excepción ni caso especial para "cero usos" — ver Alternativas.

4. Índice, por consistencia con `idx_accounts_active`/`idx_envelopes_active` (mismo
   patrón parcial), aunque el volumen de `categories` (decenas de filas) no lo necesite
   por rendimiento — `senior-dba` puede omitirlo si lo considera ruido:

   ```sql
   CREATE INDEX IF NOT EXISTS idx_categories_active
     ON categories(retiredAt) WHERE retiredAt IS NULL;
   ```

## Contrato de consulta (para `senior-dba` / `fe-senior-react`)

`retiredAt` cambia el comportamiento de **exactamente dos** flujos; todos los demás
quedan sin tocar:

| Call site | Debe filtrar `retiredAt IS NULL` | Por qué |
|---|---|---|
| `useFormScreen.loadCategories` (grid de categoría al crear/editar un movimiento) | **Sí, con excepción**: si la fila que se está editando ya apunta a una categoría retirada, esa categoría debe seguir apareciendo seleccionada — no puede desaparecer de un formulario que la tiene asignada. | No se puede ofrecer `Loan`/`Credit card` para un movimiento NUEVO, pero editar uno viejo no debe romperse. |
| `useBudgetsScreen` → `getCategoriesByType(db, 'expense')` (elegir categoría para un límite mensual NUEVO) | Sí, sin excepción | Un presupuesto nuevo tampoco debe poder apuntar a una categoría retirada. |
| `useCategoriesScreen` (pestañas Gastos/Ingresos, historial por categoría) | **No** | Es la pantalla de historial/gestión — debe seguir mostrando el gasto ya registrado bajo esas categorías. |
| `AllMovementsScreen` → `getCategories` (filtro por categoría en la lista de movimientos) | **No** | El usuario debe poder filtrar movimientos viejos por una categoría retirada. |
| `CategoriesAdminScreen` (gestión/borrado de categorías) | **No** | Debe seguir viendo y pudiendo administrar (o intentar borrar, sujeto a `getCategoryUsage` como hoy) las categorías retiradas. |

Implementación sugerida: `getCategories`/`getCategoriesByType` ganan un parámetro
opcional (`{activeOnly?: boolean}`, default `false` — **cero cambio de comportamiento**
en cualquier call site que no lo pase explícitamente). Solo los dos call sites de la
tabla lo pasan en `true`. `getCategoryById` no cambia — debe seguir resolviendo
cualquier id, retirado o no, para mostrar el nombre correcto de un movimiento histórico.

## Riesgos concretos

- **Falso positivo por homónimo de usuario**: alguien que haya creado a mano una
  categoría llamada exactamente `Credit card` con el icono `credit-card-alt` (o `Loan`
  / `university`) la vería retirada sin haberlo pedido. Se acota con el emparejamiento
  por icono además de nombre — reduce la probabilidad a casi cero sin eliminarla del
  todo. Aceptado: el costo de un falso positivo (una categoría deja de ofrecerse para
  movimientos nuevos, pero sigue existiendo y usable en la práctica en el resto de
  pantallas) es bajo comparado con la complejidad de intentar distinguir "creada por
  la 003" de "creada a mano" sin ningún otro dato que lo diga (la tabla no tiene
  `createdAt`).
- **`getCategoryUsage`/borrado desde `CategoriesAdminScreen` no cambia** — sigue
  contando `finances`/`category_budgets` como hoy. Retirar no interfiere con borrar; si
  una de las 4 filas retiradas tiene cero usos, el usuario todavía puede borrarla a
  mano desde esa pantalla, exactamente como ya podía antes de esta migración.

## Alternativas consideradas

- **Borrar directamente las filas sin uso, retirar (soft) solo las que tienen uso**:
  rechazada por inconsistencia — dos caminos de código para la misma decisión de
  producto ("esto no debe ofrecerse más"), y el camino "borrar si count=0" tiene que
  ejecutarse dentro de la misma transacción síncrona del runner, con un `COUNT`
  condicionando un `DELETE` u otro — no imposible, pero es complejidad que ningún
  driver pide: la ganancia (unas pocas filas físicamente ausentes en instalaciones sin
  uso) no compensa tener dos caminos a mantener y probar.
- **Añadir un `CHECK` o `ON DELETE CASCADE` en las FK de `finances`/`category_budgets`
  para permitir borrado en cascada**: rechazada de plano — cambiaría el comportamiento
  de TODA categoría, no solo estas 4, y abriría la puerta a borrar movimientos reales
  al borrar una categoría por error. Fuera de alcance de este problema.
- **Reutilizar `archivedAt`** (el nombre que ya usan `accounts`/`envelopes`): rechazada
  — `archivedAt` en esas tablas significa "el usuario decidió esconder esto", una
  acción del dueño de los datos. Aquí la decisión es del producto/arquitectura, no del
  usuario. Mezclar los dos significados bajo el mismo nombre haría ambigua cualquier
  columna `archivedAt` que `categories` necesite en el futuro si se agrega archivado
  real de categorías propias.
- **No hacer nada y dejarlo como backlog ítem "nice to have"**: rechazada — es
  precisamente lo que este encargo pide resolver, y la migración es de costo y riesgo
  bajísimos (una columna aditiva + un `UPDATE` acotado, sin reconstrucción de tabla).

## Consecuencias

**Buenas:**
- Toda instalación nueva, desde que esta migración se mergea, deja de ofrecer
  `Loan`/`Credit card` para movimientos o presupuestos nuevos — cierra la puerta que
  `defaultCategories.ts` ya cerró para la siembra pero que la migración 003 (inmutable)
  seguía dejando abierta.
- Cero riesgo de integridad referencial — ninguna fila de `finances` o
  `category_budgets` puede quedar huérfana, porque no se borra nada.
- Reutilizable: el mismo mecanismo sirve para cualquier categoría sembrada que se
  decida retirar en el futuro, sin nueva migración de esquema.

**Malas / costo aceptado:**
- Las 4 filas quedan para siempre en `categories` (a menos que un usuario las borre a
  mano si tienen cero usos) — coste de almacenamiento irrelevante (4 filas), coste de
  atención: `CategoriesAdminScreen` las sigue listando, potencialmente confuso sin una
  señal visual de "retirada" (fuera de alcance de esta ADR — es una tarea de FE/UX,
  ver HANDOFF).
