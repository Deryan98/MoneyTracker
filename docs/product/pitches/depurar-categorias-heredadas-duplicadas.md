# Pitch: Depurar categorías heredadas duplicadas de la migración 003

Estado: shapeado — sin decisiones bloqueantes del dueño (ver "Decisiones que tomé yo");
pendiente de feasibility de `senior-software-architect` para el número exacto de
migración y para confirmar si se funde con el mecanismo de la ADR 0002 (ver
"Pregunta para `senior-software-architect`").

Dispara el ítem de `docs/architecture/tech-debt.md` ("Categorías heredadas de la
migración 003 sin fusión") — su propio disparador dice literalmente "cuando `po-pm`
tenga una decisión de producto explícita sobre el mapeo de `Food`/`Bills`, o cuando se
decida agregar una categoría de crianza". Esta pitch es esa decisión.

## Problema

Didier instala un APK de release limpio — cero datos, primera vez. Abre Categorías y,
antes de tocar nada, ya ve la lista duplicada: **House** junto a **Housing**/Vivienda
(mismo icono, `home`), **Food** junto a **Groceries**/Supermercado (mismo icono,
`shopping-cart`), **Bills** junto a **Utilities**/Servicios del hogar, **Children** sin
ningún equivalente, y **Loan**/**Credit card** repetidos una vez como gasto y otra como
ingreso. Son dos siembras que nunca se hablan entre sí: la migración 003 (inmutable,
11 categorías en inglés, de 2023) y la siembra curada de 22 categorías
(`seedDefaultCategoriesOnce`, en el idioma activo) que solo evita insertar una fila si
el nombre coincide letra por letra — y "Housing" nunca es "House".

**Verificado además por `senior-qa` en un segundo pase** (instalación limpia en
inglés, cambiada a español desde el drawer, sección Ingresos de Categorías): `Rent`
(migración 003, icono `home`, nunca traduce) convive con `Alquileres` (curada, clave
`rentalIncome`, icono `key`) — mismo concepto, dos filas. `Interests` (migración 003,
icono `line-chart`, nunca traduce) convive con `Intereses e inversiones` (curada,
clave `investments`, **mismo icono** `line-chart`) — mismo concepto, dos filas, y
además comparten dibujo. `Loan`/`Credit card` aparecen efectivamente en las dos
secciones (Gastos e Ingresos, 4 filas en total), confirmando lo que ya asumía la
ADR 0002. `Salary`, en cambio, **no está duplicada**: la instalación de prueba fue en
inglés, la clave curada `salary` resolvió también a `"Salary"`, chocó por nombre
exacto con la fila de la migración 003 (la siembra curada no insertó nada) y la
migración 009 marcó esa única fila con `seedKey='salary'` en su backfill — por eso ya
se ve "Salario" al cambiar a español, sin duplicado ni fila huérfana. El matiz sin
verificar: una instalación que arranca en ESPAÑOL no tendría ese choque de nombres
("Salario" ≠ "Salary"), así que ahí sí podría haber dos filas — anotado como nota
abierta, no como bloqueo (ver "Decisiones que tomé yo").

Esto no es nuevo (existe desde el commit `6784904`, antes del trabajo de i18n), pero el
merge reciente `052a771` (traducción en vivo vía `seedKey`) lo hizo **visiblemente
peor**: las 22 curadas ahora traducen en vivo; de las 11 heredadas de la 003, solo dos
tienen salida hoy (`Interests`(gasto), ya fusionada en código; `Salary`, que consigue
`seedKey` por el backfill de la migración 009 SI la instalación arrancó en inglés) —
el resto (`House`, `Food`, `Bills`, `Children`, `Rent`, `Interests`(ingreso), `Loan` y
`Credit card` en sus dos tipos) no tiene `seedKey` y no puede tenerlo sin antes
decidir si se fusiona o se retira. El resultado que ve cualquier instalación nueva
hoy: media lista de
categorías cambia de idioma al cambiar el idioma de la app, la otra mitad se queda
fija en inglés, al lado de su traducción — el defecto pasó de "hay dos filas parecidas"
a "la mitad de la pantalla no traduce", que se nota en el primer vistazo.

## Apetite

**Small Batch — 1 a 2 días.** Es una migración aditiva (mismo patrón ya aceptado en la
ADR 0002: columna + `UPDATE`s acotados por nombre+tipo+icono, sin `DELETE`, sin
reconstrucción de tabla) más un parámetro opcional en dos consultas existentes. Si el
alcance no cierra en el apetite, lo primero que se corta es la insignia visual en
`CategoriesAdminScreen` (S2) — la retirada en sí (S1) no se recorta, es el punto entero
del encargo.

## Solución (breadboard, baja fidelidad)

```
Lugar 1: migración nueva, solo sobre `categories` (S1)
  - Reutiliza el mecanismo YA DECIDIDO por la ADR 0002 (`categories.retiredAt TEXT`,
    aditivo, sin CHECK, sin requiresForeignKeysOff) — que a la fecha de esta pitch
    TODAVÍA NO TIENE CÓDIGO ESCRITO (el directorio de migraciones llega solo a 009).
  - `UPDATE ... SET retiredAt = '<fecha fija>' WHERE retiredAt IS NULL AND
    (categoria = X AND type = Y AND icon = Z)`, una condición por fila, exactamente
    el patrón que ya usa la ADR 0002 para Loan/Credit card — ver "Pregunta para
    senior-software-architect" sobre si esto va en la MISMA migración que Loan/Credit
    card o en una aparte.
  - Filas que se retiran: `House` (expense/home), `Food` (expense/shopping-cart),
    `Bills` (expense/tags), `Children` (expense/child), `Rent` (income/home),
    `Interests` (income/line-chart) — las 6 confirmadas en emulador entre el dueño y
    `senior-qa`. `Salary` queda explícitamente FUERA (ver "Decisiones que tomé yo").
  - Ninguna fila se borra. Ninguna fila de `finances`/`category_budgets` se toca —
    tampoco para `Interests`(income), aunque comparta icono con `investments` (ver
    rabbit holes).

Lugar 2: capa de consultas — `src/db/queries/categoriesQueries.ts` (S1)
  - `getCategories`/`getCategoriesByType` ganan `{activeOnly?: boolean}` (default
    `false` — cero cambio de comportamiento para cualquier llamador que no lo pase).
  - Exactamente los mismos DOS call sites que ya identificó la ADR 0002 pasan `true`:
    `useFormScreen.loadCategories` (rejilla de categoría al crear un movimiento NUEVO,
    con la excepción de que una categoría ya asignada a un movimiento en edición debe
    seguir apareciendo) y `useBudgetsScreen` (elegir categoría para un límite mensual
    NUEVO). Ningún otro call site cambia.

Lugar 3: `CategoriesAdminScreen` (S2, recortable primero)
  - Insignia visual "Retirada" junto al nombre de cualquier fila con `retiredAt` no
    nulo — cierra el ítem de `tech-debt.md` ("sin señal visual") que quedaba abierto
    desde la ADR 0002, aprovechando que esta pitch ya toca el mismo mecanismo.
```

## Rabbit holes (ya decididos)

- **No se fusiona/renombra ninguna fila.** Se RETIRA (se oculta de selectores
  futuros), nunca se reasigna ni se renombra. Esto es deliberado y es lo que evita la
  trampa que bloqueó la ADR 0003 (superseded): fusionar "Food" exige decidir SI
  significaba súper o restaurante para saber a cuál de las dos curadas fusionarlo —
  una suposición sobre datos ya existentes que este proyecto ya rechazó una vez (ver
  la pitch de tarjetas de crédito, decisión c). Retirar no necesita esa respuesta: el
  movimiento histórico se queda exactamente donde está, con el nombre que tiene hoy.
- **`Children` se retira SIN reemplazo.** No hay ninguna categoría curada de
  crianza/hijos en `DEFAULT_CATEGORIES` — inventar una es una apuesta de producto
  aparte (nueva clave de i18n en 2 idiomas, un icono, decidir dónding encaja en la
  lista de 22), no una limpieza de datos. Se deja como candidata en `roadmap.md`.
- **No se toca `Salary`.** Al revisar el código (`defaultCategories.ts` +
  `seedQueries.ts`) identifiqué un riesgo: si el idioma activo en el momento de
  sembrar produce exactamente el string `"Salary"` (instalación en inglés), la guarda
  `WHERE NOT EXISTS` de `seedDefaultCategoriesOnce` NUNCA inserta la fila curada
  `salary` — la única fila "Salary" que existe en ese caso ES la de la migración 003.
  Retirarla a ciegas habría dejado a un usuario en inglés SIN NINGUNA categoría de
  ingreso por salario que elegir. `senior-qa` lo verificó en emulador: instalación en
  inglés, sin duplicado, y la migración 009 ya marcó esa fila con `seedKey='salary'`
  en su backfill (coincide letra por letra con una de las 44 combinaciones) — traduce
  bien a "Salario" al cambiar de idioma, sin fila huérfana. Confirmado: `Salary`
  **no entra** en el alcance de retiro. Nota abierta, no bloqueante: una instalación
  que arranque en ESPAÑOL no tendría ese choque de nombres ("Salario" ≠ "Salary") y sí
  podría terminar con dos filas — sin verificar todavía; si aparece, es la misma
  receta ya aplicada aquí (retirar la de la migración 003 una vez confirmado que existe
  reemplazo), no una decisión nueva.
- **`Interests`(ingreso) comparte icono (`line-chart`) con `investments`, pero se
  retira igual, sin tratamiento especial.** El nombre de texto sigue siendo distinto
  en cualquier pantalla que lo muestre (`Interests` vs. `Intereses e inversiones`/
  `Investments`) — todas las pantallas que renderizan una categoría lo hacen con
  icono Y nombre juntos (rejilla del formulario, `CategoriesScreen`,
  `CategoriesAdminScreen`, filtros de `AllMovementsScreen`), nunca solo el icono
  aislado, así que un historial mixto sigue siendo legible. La alternativa —
  fusionar ambas filas en una sola para que el icono compartido deje de importar —
  exigiría reasignar los movimientos ya existentes de una fila a la otra, que es
  exactamente el `no-go` que ya rechacé para el resto de esta pitch: el dinero que se
  movió de verdad no se toca, ni siquiera para simplificar una coincidencia visual.
  Si `senior-qa`/`senior-uiux-design` encuentran una pantalla real donde el icono se
  muestra SIN el nombre (no la hay hoy, según el código revisado), esto se re-abre.
- **Ninguna migración de `finances`/`category_budgets`.** El dinero que ya se movió no
  se toca — mismo principio ya aplicado por la ADR 0002.

## No-gos (explícitamente fuera)

- Ninguna reasignación de movimientos existentes de una categoría retirada a otra —
  incluido el caso `Interests`(ingreso)/`investments` con icono compartido.
- Ninguna categoría nueva de crianza/hijos en `DEFAULT_CATEGORIES` (candidata aparte).
- Ningún retiro de `Salary` — confirmado sin duplicado en instalación en inglés; la
  variante en español queda anotada, no decidida a ciegas.
- Ningún aviso push/banner/dialog al usuario cuando una categoría deja de ofrecerse —
  mismo criterio que ya aceptó la ADR 0002 para Loan/Credit card; la única señal es
  pasiva (insignia en `CategoriesAdminScreen`, S2).
- Ninguna edición de una migración ya publicada.
- Ningún cambio a `getCategoryById`, `getCategoryUsage`, ni al flujo de borrado de
  `CategoriesAdminScreen` — siguen viendo y pudiendo intentar borrar cualquier fila,
  retirada o no, exactamente como hoy.

## Señal de éxito

- Un APK de release instalado limpio, en cualquiera de los dos idiomas, muestra
  Categorías sin `House`, `Food`, `Bills`, `Children`, `Rent`(ingreso) ni
  `Interests`(ingreso) junto a su equivalente traducido — solo las 22 curadas (más
  `Loan`/`Credit card` si la ADR 0002 se funde aquí, ver la pregunta de arquitectura).
  `Salary` sigue como una sola fila, sin cambio.
- Verificable en la base: `SELECT category, type, retiredAt FROM categories WHERE
  (category IN ('House','Food','Bills','Children') AND type='expense') OR
  (category IN ('Rent','Interests') AND type='income');` — las 6 con `retiredAt` no
  nulo, cero filas borradas.
- Ningún movimiento existente cambia de categoría ni de monto —
  `SELECT COUNT(*) FROM finances WHERE idCategory IN (<ids retirados>)` antes y
  después de la migración da el mismo número.

## Decisiones que tomé yo (no quedan abiertas para el dueño)

**a) ¿Cuáles se retiran?** `House`, `Food`, `Bills`, `Children` (expense) y `Rent`,
`Interests` (income) — las seis. Las primeras cuatro y `Rent` son seguras de retirar
en cualquier idioma (su curada equivalente SIEMPRE se inserta como fila aparte, porque
el texto traducido nunca coincide letra por letra con el literal en inglés de 2023 —
no hay caso donde retirarlas deje al usuario sin opción). `Interests`(ingreso) se
confirmó duplicada por `senior-qa` y se retira igual, sin tratamiento especial pese a
compartir icono con `investments` (ver rabbit holes). `Children` se retira igual,
aunque no tiene reemplazo — ver rabbit holes. `Salary` queda FUERA, confirmada sin
duplicado por `senior-qa` en instalación en inglés — la variante en español queda
anotada, no decidida a ciegas (ver rabbit holes).

**b) ¿Qué pasa con los movimientos que ya apunten a una retirada?** Nada. Se quedan
exactamente donde están, con el nombre y la categoría que tienen hoy. Retirar solo
cambia dos flujos (rejilla de categoría en un movimiento NUEVO, selector de un
presupuesto NUEVO) — ni `CategoriesScreen`, ni `AllMovementsScreen`, ni
`CategoriesAdminScreen` cambian su comportamiento de lectura/gestión. Mismo contrato
que ya fijó la ADR 0002 para Loan/Credit card; esta pitch no inventa uno nuevo, lo
reutiliza para 6 filas más.

**c) ¿Se amplía la migración de la ADR 0002 o se hace una aparte?** Recomiendo
ampliarla — ver la pregunta de arquitectura, porque no es mi llamada cerrarla del
todo, pero el argumento de producto es fuerte: a la fecha de esta pitch, la ADR 0002
(Loan/Credit card) **tampoco tiene código ni tarea en el backlog todavía**. Construir
el mecanismo genérico (columna, índice, parámetro `activeOnly`, excepción de edición
en el formulario) dos veces — una para Loan/Credit card, otra para
House/Food/Bills/Children/Rent/Interests(ingreso) — es literalmente el mismo trabajo hecho dos veces sin
ninguna razón de negocio para separarlo: ambas son "categorías sembradas que no deben
ofrecerse más", mismo mecanismo, misma tabla. Si `senior-software-architect` ve un
motivo de secuenciación (por ejemplo, que la migración de la ADR 0002 depende de que
cierren antes las 010/011 del ADR 0001, y este frente no debería esperar a eso), la
alternativa de una migración aparte queda documentada como opción B, no descartada.

**d) ¿Hay que avisar al usuario?** No con un aviso activo (push/banner/diálogo) —
mismo criterio que ya aceptó la ADR 0002. Sí con una señal pasiva: la insignia
"Retirada" en `CategoriesAdminScreen` (S2), que además cierra un ítem de deuda técnica
que ya estaba anotado y sin dueño. Es la respuesta correcta para una app de un solo
usuario sin infraestructura de notificaciones, y consistente con lo ya decidido para
Loan/Credit card — no se inventa un mecanismo nuevo para 6 filas más.

## Pregunta para `senior-software-architect` (no para el dueño)

1. **¿La misma migración que la ADR 0002, o una aparte?** Mi recomendación de
   producto es la misma (ver decisión c) — evitar construir el mecanismo dos veces.
   Necesito que confirmes o rechaces esto considerando la secuencia real de
   migraciones (010/011 del ADR 0001 siguen sin código; 012 de la ADR 0002 también).
   Si se funden, la ADR 0002 necesita una nota de ampliación de alcance (o una ADR
   0005 que la sustituya) — no la edito yo.
2. Número exacto de migración (¿sigue siendo 012, o cambia si se fusiona con las 6
   filas de esta pitch más las 4 de la ADR 0002 — 10 en total?) — tu llamada, no
   invento el número.
3. Confirmar que el índice `idx_categories_active` que ya propone la ADR 0002 sirve
   sin cambios para las 6 filas nuevas (misma columna, mismo filtro parcial
   `WHERE retiredAt IS NULL`) — no debería hacer falta un segundo índice, pero lo
   confirmas tú.

Ninguna de las dos rebanadas toca `finances`, `envelopes`, `category_budgets`, ni
`accounts` — el radio de acción completo es `categories` y las dos consultas que ya
identificó la ADR 0002.
