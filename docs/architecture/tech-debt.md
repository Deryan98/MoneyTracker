# Tech debt — arquitectura

Formato: impacto + condición de disparo para retomar. No es una lista de "algún día".

## Categorías heredadas de la migración 003 sin fusión (`Food`, `Bills`, `Children`) — CERRADO

- **Origen:** ADR `0003-siembra-traducida-fusion-de-categorias-heredadas-en-codigo.md`
  (superseded by `0004-seedkey-y-traduccion-en-vivo-de-la-siembra.md`, que hereda este
  mismo ítem sin resolverlo — ver su sección "Backfill", punto 2).
- **Impacto (histórico):** toda instalación que ya corrió la migración 003 conservaba
  estas 3 categorías en inglés, sin traducir NI en vivo (sin `seedKey`, tras la migración
  009), mientras el resto de la siembra sí seguía el idioma activo.
- **Por qué no se resolvió antes:** el mapeo no era 1 a 1 sin ambigüedad — fusionar
  exigía adivinar la intención del usuario sobre datos ya existentes, exactamente el tipo
  de automatismo que este proyecto ya rechazó una vez (pitch de saldo inicial de
  tarjetas, decisión (c)).
- **Resolución final (revisión del dueño en el dispositivo, 2026-09-11):** una propuesta
  intermedia (`docs/product/pitches/depurar-categorias-heredadas-duplicadas.md`) había
  shapeado RETIRAR las seis (`House`/`Food`/`Bills`/`Children`/`Rent`/`Interests`
  ingreso) sin que el dueño la hubiera confirmado todavía. Al revisar las categorías
  directamente en su dispositivo, el dueño dio una instrucción **distinta y más
  concreta** para tres de ellas: **`Bills`→"Facturas"`, `Children`→"Hijos"`,
  `Food`→"Despensa"` (más `Loan`, en sus dos tipos, →"Préstamo"`) se CONSERVAN,
  traducidas vía `seedKey`** — no se fusionan con ninguna categoría curada existente,
  siguen siendo conceptos propios (ver `src/data/defaultCategories.ts` para por qué
  `pantry`/Despensa es un concepto distinto de `groceries`/Supermercado). Solo
  `House`/`Credit card`(x2)/`Interests`(ingreso)/`Rent` se retiran (`retiredAt`, sin
  tocar `finances`) — cinco filas, no seis. `Salary` sigue confirmada sin duplicado y
  fuera de alcance. Implementado en la migración 10
  (`src/db/migrations/010_retireLegacyCategoriesAndSeedKeys.ts`) — ver ADR 0005
  (`0005-migracion-010-retiro-y-traduccion-de-categorias-heredadas.md`), que reemplaza
  tanto la propuesta de la pitch citada como el alcance de la ADR 0002 para estas filas.
  `Children` YA NO queda "retirada sin reemplazo" — se conserva traducida, así que el
  disparador de "agregar categoría de crianza" anotado en `docs/product/roadmap.md`
  queda obsoleto y puede retirarse de ahí en el próximo pase de ese documento. Ítem
  cerrado.

## `LEGACY_INTERESTS_NAME` rename sin guarda de cardinalidad

- **Origen:** `src/db/queries/seedQueries.ts`, ya en producción (commit `6784904`).
- **Impacto:** el `UPDATE categories SET category = ? WHERE category = 'Interests'
  AND type = 'expense'` no verifica que exista exactamente una fila con ese
  nombre+tipo antes de renombrar — si un usuario hubiera creado a mano una segunda
  categoría llamada literalmente `'Interests'` de tipo `expense` antes de que este
  código corriera, ambas quedarían renombradas a `feesInterest` traducido, fusionando
  dos categorías que el usuario quería mantener separadas.
- **Por qué no se corrigió ahora:** ya corrió (o puede haber corrido) en el único
  dispositivo real que usa esta app; cambiar su comportamiento retroactivamente no
  deshace lo que ya se ejecutó, y el caso (un usuario creando a mano una categoría
  llamada exactamente `'Interests'`) es de probabilidad muy baja. El backfill de la
  migración 009 (ADR 0004) SÍ lleva guarda de cardinalidad (`COUNT(*) = 1`) en cada una
  de sus 46 sentencias, para no repetir este patrón hacia adelante; solo esta llamada
  puntual, ya en producción antes de la ADR 0004, queda sin ella.
- **Disparador para retomar:** si algún usuario reporta una categoría que "desapareció
  fusionada" sin haberlo esperado, o antes de reutilizar este mismo patrón de rename
  para una quinta categoría heredada.

## `categories.retiredAt` sin señal visual en `CategoriesAdminScreen`

- **Origen:** ADR `0002-migracion-012-retiro-categorias-tarjeta-prestamo.md` (superseded
  by `0005-migracion-010-retiro-y-traduccion-de-categorias-heredadas.md`, que hereda este
  ítem sin resolverlo).
- **Impacto:** las cinco filas retiradas por la migración 10 (`House`, `Credit card` x2,
  `Interests` ingreso, `Rent`) — no solo `Loan`/`Credit card` como decía la versión
  original de este ítem, porque `Loan` ya NO se retira (ver el ítem nuevo más abajo) —
  siguen listadas en `CategoriesAdminScreen` sin ninguna marca que diga "retirada". Un
  usuario que abra esa pantalla no tiene forma de saber por qué esas filas ya no
  aparecen al crear un movimiento nuevo pero sí siguen en la lista de gestión.
- **Disparador para retomar:** próxima vez que se toque `CategoriesAdminScreen` por
  cualquier otro motivo, o si el dueño reporta confusión con estas filas.

## `Loan` sigue siendo categoría Y tipo de cuenta, `Credit card` ya no

- **Origen:** ADR `0005-migracion-010-retiro-y-traduccion-de-categorias-heredadas.md`,
  sección "Inconsistencia que se deja anotada, no resuelta".
- **Impacto:** desde la migración 006, `Loan` y `Credit card` son EXACTAMENTE el mismo
  caso arquitectónico — un `accounts.kind` (`loan`, `credit_card`) que también existe
  como categoría de `finances`, contando el mismo dinero dos veces si el usuario paga
  la tarjeta o el préstamo categorizándolo como gasto en vez de registrarlo como
  transferencia entre cuentas (el mecanismo que ya soporta
  `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`). La migración 10
  retira `Credit card` (sus dos filas) pero **conserva y traduce** `Loan` — por
  instrucción explícita del dueño al revisar sus categorías en el dispositivo, no por
  ningún criterio técnico que las distinga.
- **Por qué no se resolvió ahora:** es una decisión de producto, no de arquitectura —
  `senior-dba` ejecutó la instrucción del dueño tal cual la dio; reinterpretarla
  (retirar `Loan` también, "por consistencia") sin que él lo pida sería exactamente el
  tipo de suposición sobre la intención del usuario que este proyecto ya rechazó una vez
  (pitch de tarjetas de crédito, decisión (c)).
- **Disparador para retomar:** la próxima vez que el dueño revise sus categorías, o si
  se detecta en su base real un movimiento de préstamo categorizado como gasto que
  debería haber sido una transferencia (mismo doble conteo que ya se corrigió para
  tarjetas).

## `Food`→"Despensa" puede colisionar con una categoría "Despensa" creada a mano

- **Origen:** ADR `0005-migracion-010-retiro-y-traduccion-de-categorias-heredadas.md`,
  sección "El riesgo de colisión Food → Despensa".
- **Impacto:** se confirmó en `/tmp/mt-backup.db` (copia real del dueño) una categoría
  `Despensa` (`expense`, icono `shopping-cart`) creada A MANO, con movimientos y un
  presupuesto mensual reales. Si una instalación conserva ADEMÁS la fila `Food` de la
  migración 003 sin borrar, la migración 10 (y el renombrado equivalente para
  instalaciones nuevas en `seedQueries.ts`) tienen un candado explícito
  (`avoidIfNameExists`) que evita traducirla en ese caso — la fila `Food` se queda sin
  `seedKey`, sin duplicar el nombre. El candado es puntual (solo para `pantry`, por
  evidencia concreta), no un mecanismo general de detección de colisión de nombres
  traducidos contra categorías del usuario.
- **Disparador para retomar:** si aparece evidencia de una colisión equivalente para
  `bills`/`children`/`loan` (una categoría de usuario con ese nombre exacto), o si se
  decide construir un mecanismo general en vez de candados puntuales por clave.

## `accounts`/`categories`: coordinación manual de `src/db/db.ts` entre migraciones paralelas

- **Origen:** ADR `0001-migraciones-011-012-saldo-inicial-tarjetas-credito.md` (ahora
  "011-012", ver esa ADR — renumerada dos veces por este mismo motivo).
- **Impacto:** el runner de migraciones (`user_version`, array ordenado) no tiene
  ningún mecanismo de asignación de número en paralelo — cada nueva migración requiere
  coordinación humana para no colisionar. Con tres frentes simultáneos ya hizo falta una
  ADR completa solo para desambiguar el número, y la numeración final se corrió DOS
  veces: primero cuando la ADR 0004 (traducción en vivo) tomó el 009 por delante de los
  otros dos frentes, y de nuevo cuando la ADR 0005 (revisión de categorías en el
  dispositivo) tomó el 010 por delante de la ADR 0001, que seguía sin código escrito.
- **Disparador para retomar:** si el ritmo de migraciones paralelas aumenta (más de un
  frente de esquema activo a la vez de forma habitual, no solo esta vez), vale la pena
  evaluar un esquema de reserva de números (p. ej. un archivo `NEXT_MIGRATION` en el
  repo que cada rama incrementa al abrir su PR) — hoy, para cuatro migraciones ya
  renumeradas dos veces, empieza a acercarse al punto donde vale la pena, aunque
  todavía no se cruza esa línea.
