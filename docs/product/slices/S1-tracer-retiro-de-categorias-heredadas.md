# S1 — Tracer bullet: retirar las 6 categorías heredadas duplicadas de los selectores nuevos

Pitch: `docs/product/pitches/depurar-categorias-heredadas-duplicadas.md`
Hill chart: **subiendo la colina en un solo punto** (confirmar con
`senior-software-architect` si esta migración se funde con la de la ADR 0002 o va
aparte — bloquea el número de archivo, no el diseño), **bajando la colina en el
resto** (mecanismo ya diseñado en detalle por la ADR 0002, esta rebanada solo lo
aplica a 6 filas más — alcance ampliado tras la verificación de `senior-qa`, ver
nota de cierre de T16 al final).

## Qué se puede demostrar al final

Una instalación limpia (o una ya existente, tras migrar) abre "Nuevo movimiento" y NO
ve `House`, `Food`, `Bills`, `Children` (gasto) ni `Rent`, `Interests` (ingreso) en la
rejilla de categorías — solo sus equivalentes curadas (`Housing`/Vivienda,
`Groceries`+`Dining out`/Supermercado+Comida fuera, `Utilities`+`Internet/Phone`/
Servicios+Internet-Teléfono, `Rental income`/Alquileres, `Investments`/Intereses e
inversiones). Lo mismo al elegir categoría para un presupuesto mensual nuevo. Un
movimiento YA registrado bajo cualquiera de las 6 sigue viéndose exactamente igual en
Categorías, en la lista de movimientos y al editarlo. `Salary` no cambia — sigue
siendo una sola fila, sin retirar.

## Alcance

- Migración nueva sobre `categories` (mismo archivo o número que decida
  `senior-software-architect`, ver pregunta de arquitectura de la pitch):
  - Si `retiredAt` no existe todavía (la ADR 0002 no se ha construido): añadirla,
    `ALTER TABLE categories ADD COLUMN retiredAt TEXT`, aditiva, sin `CHECK`.
  - `UPDATE`s guardados por nombre+tipo+icono EXACTOS (mismo patrón que la ADR 0002),
    uno por fila:
    - `House`/expense/`home`
    - `Food`/expense/`shopping-cart`
    - `Bills`/expense/`tags`
    - `Children`/expense/`child`
    - `Rent`/income/`home`
    - `Interests`/income/`line-chart`

    Fecha fija (la de esta migración, no `new Date()`), misma para las 6.
  - Índice `idx_categories_active` — reutilizar el de la ADR 0002 si ya existe en la
    misma migración; no duplicar.
  - Registrada en `src/db/db.ts` con `version` incrementada.
- `src/db/queries/categoriesQueries.ts`: `getCategories`/`getCategoriesByType` ganan
  `{activeOnly?: boolean}` (default `false`, sin cambio de firma para llamadores
  existentes que no lo pasen).
- `useFormScreen.loadCategories` (rejilla de categoría al crear/editar un movimiento):
  pasa `activeOnly: true`, CON la excepción de que si el movimiento en edición ya
  apunta a una categoría retirada, esa categoría se agrega de vuelta a la lista
  cargada (no puede desaparecer de un formulario que la tiene asignada).
- `useBudgetsScreen` → `getCategoriesByType(db, <type>, {activeOnly: true})` (elegir
  categoría para un límite mensual NUEVO) — cubre tanto gasto como ingreso, ya que
  ahora hay retiradas de ambos tipos (`Rent`/`Interests` son `income`).
- Ningún cambio en `useCategoriesScreen`, `AllMovementsScreen`'s `getCategories`,
  `CategoriesAdminScreen`, `getCategoryById` ni `getCategoryUsage`.

## Fuera de alcance (de esta rebanada, no de la pitch entera)

- La insignia visual "Retirada" en `CategoriesAdminScreen` — es S2, recortable
  primero si el apetite se aprieta.
- `Loan`/`Credit card` — SI `senior-software-architect` decide fundir esta migración
  con la de la ADR 0002, esas cuatro filas (gasto e ingreso) entran aquí también; si
  decide separarlas, quedan en su propia migración/tarea, fuera de esta rebanada.
- `Salary` — confirmado SIN duplicado en instalación en inglés (ver cierre de T16
  abajo); no se retira. La variante en español queda como nota abierta, no como
  tarea.
- Cualquier fusión, renombrado o reasignación de `finances`/`category_budgets` — no se
  toca nada de eso, nunca, ni siquiera para `Interests`(ingreso) pese a compartir
  icono con `investments` (ver rabbit holes de la pitch).

## Contrato de i18n

Ninguna clave nueva. Esta rebanada no agrega texto — las categorías curadas que
reemplazan a las retiradas ya existen y ya traducen (vía `seedKey`, ADR 0004).

## Tareas

### T13 — Migración: retirar las 6 categorías heredadas duplicadas — S1

```
Owner:      senior-be
Slice:      S1 · Tracer retiro de categorías heredadas     Appetite: S     Priority: P1
Depends on: feasibility de senior-software-architect (número de migración, fusión o
            no con la de la ADR 0002)     Blocks: T14, T15
Context:    docs/product/pitches/depurar-categorias-heredadas-duplicadas.md —
            causa raíz verificada: la migración 003 (inmutable) siembra estas 6 filas
            en inglés; `seedDefaultCategoriesOnce` solo evita duplicar por nombre
            exacto, así que conviven con sus equivalentes curadas. Ampliado de 4 a 6
            filas tras verificación de `senior-qa` (Rent/Interests de ingreso también
            duplican; Salary no).
Scope:
  - Migración aditiva sobre `categories`: columna `retiredAt` (si no existe aún) +
    `UPDATE`s guardados por nombre+tipo+icono exactos para las 6 filas (`House`,
    `Food`, `Bills`, `Children` en expense; `Rent`, `Interests` en income) + índice
    parcial `idx_categories_active` (reutilizar si ya lo crea la misma migración
    para Loan/Credit card).
  - Ningún `DELETE`. Ninguna fila de `finances`/`category_budgets` referenciada se
    modifica.
  - Statement síncrono dentro de la transacción del runner (sin `await` entre
    sentencias), mismo patrón que exige `db.ts`.
Out of scope:
  - Loan/Credit card, Salary — ver pitch.
  - Cualquier columna o índice no relacionado con `retiredAt`.
Acceptance Criteria:
  - Given una instalación NUEVA (sin `user_version` previo),
    When corre el pase completo de migraciones,
    Then `SELECT category, type, retiredAt FROM categories WHERE (category IN
    ('House','Food','Bills','Children') AND type='expense') OR (category IN
    ('Rent','Interests') AND type='income');` devuelve 6 filas, todas con
    `retiredAt` no nulo y el mismo valor de fecha fija.
  - Given una instalación existente con `user_version` anterior a esta migración Y
    con un movimiento (`finances`) que apunta a la categoría `Children` o a
    `Interests`(income),
    When corre la migración,
    Then ese movimiento sigue existiendo, con el mismo `idCategory`, mismo `amount`,
    sin cambios.
  - Given la migración ya corrida una vez,
    When se re-ejecuta el runner (reinicio de la app sin cambios de versión),
    Then no se re-aplica (gateada por `user_version`) y no lanza error de columna
    duplicada.
  - Given un usuario que creó a mano una categoría llamada exactamente `House`,
    tipo `expense`, con un icono DISTINTO de `home`,
    When corre la migración,
    Then esa fila NO queda retirada (la guarda por icono exacto la protege).
  - Given la fila `Salary`/income/`money` de la migración 003,
    When corre esta migración,
    Then permanece SIN retirar (no aparece en el criterio de ningún `UPDATE` de esta
    tarea).
Definition of Done: AC cumplidos · migración registrada en `src/db/db.ts` · sin
                    editar ninguna migración ya publicada · verificación en emulador
                    Android instalando limpio y con `adb shell run-as ... cat
                    databases/moneytracker.db` · HANDOFF.
```

### T14 — `activeOnly` en la capa de consultas de categorías — S1

```
Owner:      senior-be
Slice:      S1 · Tracer retiro de categorías heredadas     Appetite: S     Priority: P1
Depends on: T13     Blocks: T15
Context:    contrato de consulta ya definido por la ADR 0002 — dos call sites
            filtran, el resto no. Sin cambio de diseño respecto al alcance previo:
            más filas retiradas no cambian esta tarea.
Scope:
  - `getCategories`/`getCategoriesByType` (`src/db/queries/categoriesQueries.ts`)
    ganan `{activeOnly?: boolean}` opcional, default `false`.
  - Cuando `activeOnly: true`, el `WHERE` de la consulta añade
    `AND retiredAt IS NULL`.
  - `getCategoryById` no cambia — debe seguir resolviendo cualquier id.
Out of scope:
  - Tocar `useCategoriesScreen`, `AllMovementsScreen`, `CategoriesAdminScreen` —
    ninguno pasa `activeOnly`.
Acceptance Criteria:
  - Given `getCategoriesByType(db, 'expense')` sin segundo argumento,
    When se ejecuta tras T13,
    Then devuelve las 4 filas de gasto retiradas igual que antes (sin cambio de
    comportamiento por defecto).
  - Given `getCategoriesByType(db, 'income')` sin segundo argumento,
    When se ejecuta tras T13,
    Then devuelve `Rent` e `Interests` retiradas igual que antes (sin cambio de
    comportamiento por defecto).
  - Given `getCategoriesByType(db, 'expense', {activeOnly: true})`,
    When se ejecuta tras T13,
    Then NO incluye `House`, `Food`, `Bills` ni `Children` en el resultado.
  - Given `getCategoriesByType(db, 'income', {activeOnly: true})`,
    When se ejecuta tras T13,
    Then NO incluye `Rent` ni `Interests` en el resultado, y SÍ incluye `Salary`.
  - Given `getCategoryById(db, <id de Children>)`,
    When se ejecuta tras T13,
    Then devuelve la fila completa igual que antes de retirarla.
Definition of Done: AC cumplidos · tsc/lint/build verdes · sin secretos · HANDOFF.
```

### T15 — Excepción de edición + filtro en Presupuestos — S1

```
Owner:      fe-senior-react
Slice:      S1 · Tracer retiro de categorías heredadas     Appetite: S     Priority: P1
Depends on: T14     Blocks: —
Context:    dos únicos call sites que deben pasar `activeOnly: true` — el resto de la
            app no cambia. Verificado contra el código actual: `useBudgetsScreen`
            solo llama `getCategoriesByType(db, 'expense')` — Presupuestos no maneja
            límites de ingreso hoy, así que `Rent`/`Interests` (ambas `income`) nunca
            aparecen ahí de todos modos; esta tarea solo necesita pasar `activeOnly`
            en la llamada de `'expense'` que ya existe.
Scope:
  - `useFormScreen.loadCategories`: pasa `activeOnly: true` en AMBOS tipos (gasto e
    ingreso) — es el único call site que sí muestra categorías de ingreso; si el
    movimiento en edición ya apunta a una categoría retirada, esa categoría se agrega
    de vuelta a la lista cargada antes de renderizar la rejilla.
  - `useBudgetsScreen` (selector de categoría de GASTO para un límite NUEVO): pasa
    `activeOnly: true` en su única llamada (`getCategoriesByType(db, 'expense', ...)`),
    sin excepción (un presupuesto nuevo nunca debe ofrecer una retirada). No requiere
    tocar nada de `income` — no aplica a este call site.
Out of scope:
  - Cualquier otro selector de categoría en la app.
Acceptance Criteria:
  - Given el formulario "Nuevo movimiento" en modo ALTA con tipo Gasto,
    When se abre la rejilla de categoría,
    Then no aparecen `House`, `Food`, `Bills` ni `Children`.
  - Given el formulario "Nuevo movimiento" en modo ALTA con tipo Ingreso,
    When se abre la rejilla de categoría,
    Then no aparecen `Rent` ni `Interests`, y `Salary` sigue apareciendo.
  - Given un movimiento YA guardado con categoría `Children` o con `Interests`
    (ingreso),
    When se abre para EDITAR,
    Then la categoría retirada correspondiente aparece en la rejilla, seleccionada,
    y el resto de retiradas sigue sin aparecer.
  - Given la pantalla de Presupuestos creando un límite NUEVO,
    When se abre el selector de categoría,
    Then no aparecen `House`, `Food`, `Bills` ni `Children` (las únicas 4 retiradas
    de tipo `expense`, el único tipo que maneja Presupuestos hoy).
Definition of Done: AC cumplidos · tsc/lint/build verdes · sin secretos ·
                    verificación de fidelidad con prototype-maker ⇄ senior-uiux-design
                    (sin cambio visual nuevo, solo menos ítems en una rejilla ya
                    existente) · verificado en emulador Android · HANDOFF.
```

### T16 — Verificación QA de Salary/Rent/Interests(ingreso) — CERRADA

```
Estado:     Cerrada. `senior-qa` entregó evidencia directamente (instalación limpia en
            inglés, cambiada a español desde el drawer, sección Ingresos de
            Categorías) sin necesidad de ejecutar esta tarea como ticket aparte.
Veredicto:
  - `Rent` (migración 003, icono `home`) SÍ duplica con `Alquileres` (curada, clave
    `rentalIncome`, icono `key`) — entra al alcance de T13 (ver arriba).
  - `Interests` (migración 003, icono `line-chart`) SÍ duplica con `Intereses e
    inversiones` (curada, clave `investments`, MISMO icono `line-chart`) — entra al
    alcance de T13; el icono compartido se evaluó en la pitch (rabbit holes) y no
    cambia el tratamiento (se retira igual, sin fusión).
  - `Salary` NO duplica en instalación en inglés: la migración 009 ya la marcó con
    `seedKey='salary'` en su backfill (coincide letra por letra con la traducción
    inglesa), una sola fila, traduce bien a "Salario" en español. Queda FUERA del
    alcance de T13.
Nota abierta, no bloqueante: no se verificó una instalación que arranque en ESPAÑOL
para `Salary` — ahí el choque de nombres no ocurriría (`"Salario" ≠ "Salary"`) y
podría existir un duplicado. Si aparece, se resuelve con la misma receta ya usada
aquí (retirar la fila de la migración 003), no requiere una decisión nueva. Anotado
en `docs/product/roadmap.md` como señal a vigilar, no como tarea pendiente.
```
