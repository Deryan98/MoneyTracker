# Tech debt — arquitectura

Formato: impacto + condición de disparo para retomar. No es una lista de "algún día".

## Categorías heredadas de la migración 003 sin fusión (`Food`, `Bills`, `Children`)

- **Origen:** ADR `0003-siembra-traducida-fusion-de-categorias-heredadas-en-codigo.md`
  (superseded by `0004-seedkey-y-traduccion-en-vivo-de-la-siembra.md`, que hereda este
  mismo ítem sin resolverlo — ver su sección "Backfill", punto 2).
- **Impacto:** toda instalación que ya corrió la migración 003 (todas las reales,
  incluida la del dueño) conserva estas 3 categorías en inglés, sin traducir NI en vivo
  (sin `seedKey`, tras la migración 009), mientras el resto de la siembra sí sigue el
  idioma activo. Inconsistencia visible, no un bug funcional — los movimientos siguen
  registrándose y sumándose bien.
- **Por qué no se resolvió ahora:** el mapeo no es 1 a 1 sin ambigüedad. `Food` podría
  fusionarse a `groceries` o a `diningOut`; `Bills` a `utilities` o a `internetPhone`;
  `Children` no tiene ningún equivalente en `DEFAULT_CATEGORIES` hoy. Resolverlo a
  ciegas es adivinar la intención del usuario sobre datos ya existentes — exactamente
  el tipo de automatismo que este proyecto ya rechazó una vez (ver la pitch de saldo
  inicial de tarjetas, decisión (c): "no hay forma de saber, sin preguntarle al
  dueño").
- **Disparador para retomar:** cuando `po-pm` tenga una decisión de producto explícita
  sobre el mapeo de `Food`/`Bills`, o cuando se decida agregar una categoría de crianza
  a `DEFAULT_CATEGORIES` (que le daría destino a `Children`). Hasta entonces, se dejan
  como están.

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

- **Origen:** ADR `0002-migracion-012-retiro-categorias-tarjeta-prestamo.md`.
- **Impacto:** `Loan`/`Credit card` (si tienen movimientos y no se pueden borrar)
  siguen listadas en la pantalla de administración de categorías sin ninguna marca
  que diga "retirada" — un usuario que abra esa pantalla no tiene forma de saber por
  qué esas dos ya no aparecen al crear un movimiento nuevo pero sí siguen en la lista
  de gestión.
- **Disparador para retomar:** próxima vez que se toque `CategoriesAdminScreen` por
  cualquier otro motivo, o si el dueño reporta confusión con estas dos filas.

## `accounts`/`categories`: coordinación manual de `src/db/db.ts` entre migraciones paralelas

- **Origen:** ADR `0001-migraciones-010-011-saldo-inicial-tarjetas-credito.md`.
- **Impacto:** el runner de migraciones (`user_version`, array ordenado) no tiene
  ningún mecanismo de asignación de número en paralelo — cada nueva migración requiere
  coordinación humana (esta sesión de arquitectura) para no colisionar. A partir de
  tres frentes simultáneos ya hizo falta esta ADR completa solo para desambiguar el
  número, y aun así la numeración final se corrió una vez más cuando la ADR 0004
  (traducción en vivo) tomó el 009 por delante de estos dos frentes, que seguían sin
  código escrito.
- **Disparador para retomar:** si el ritmo de migraciones paralelas aumenta (más de un
  frente de esquema activo a la vez de forma habitual, no solo esta vez), vale la pena
  evaluar un esquema de reserva de números (p. ej. un archivo `NEXT_MIGRATION` en el
  repo que cada rama incrementa al abrir su PR) — hoy, para tres migraciones, sería
  sobre-ingeniería.
