# S2 — Límite de crédito como campo propio

Pitch: `docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md`
Hill chart: **subiendo la colina en la parte de diseño** (cómo se muestra el % usado
en la lista/detalle de cuentas es una decisión de `senior-uiux-design`), **bajando la
colina en el resto** (migración aditiva y campo de formulario siguen el patrón ya
usado por `008_envelopeCompletion.ts` y por el resto de `useAccountForm`).
Depende de S1 (mismo hook, mejor evitar tocarlo dos veces en paralelo) pero no
reutiliza su código directamente.

## Qué se puede demostrar al final

Al crear o editar una tarjeta de crédito, el usuario puede anotar su cupo (opcional).
Si lo hace, la lista/detalle de cuentas muestra cuánto lleva usado de ese cupo — un
dato informativo, nada que bloquee ni avise todavía.

## Alcance

- Migración nueva (número exacto a confirmar con `senior-software-architect`,
  propuesta: 009) que añade `creditLimit INTEGER` (nullable, centavos) a `accounts` —
  `ALTER TABLE ADD COLUMN`, sin `CHECK`, sin `requiresForeignKeysOff`, mismo patrón
  que `008_envelopeCompletion.ts`. Registrada en `src/db/db.ts` con
  `version` incrementada.
- `IAccount`/`IAccountWithBalance`/`IInsertAccountInput`/`IUpdateAccountInput` en
  `src/db/queries/accountsQueries.ts` ganan `creditLimit: number | null` — SELECT,
  INSERT y UPDATE actualizados; `isFiniteInteger` aplicado igual que a
  `initialBalance` cuando el valor no es `null`.
- `CreateAccount`/`useAccountForm`: nuevo campo opcional "Límite de crédito", visible
  SOLO cuando `selectedKind === 'credit_card'`. Reutiliza el mismo patrón de texto
  editable que `initialBalanceText` (magnitud, sin signo — un cupo nunca es
  negativo), sin negativos permitidos (`allowNegative: false` siempre).
- Vacío = `null` = "sin límite capturado" — no se fuerza a capturarlo, no se asume 0.
- Cálculo de % usado (solo cuando `creditLimit` no es `null` y `creditLimit > 0` y el
  saldo derivado es negativo): función pura nueva en el mapper de la pantalla que lo
  muestre (NO en `@db/queries` — el porcentaje es presentación, no dato), guardando
  contra división por cero.
- Copy final del indicador de % usado, a validar con `senior-uiux-design`.

## Fuera de alcance

- Cualquier alerta o aviso al acercarse al límite — no-go de la pitch, candidata
  futura.
- El campo para `loan`, `receivable`, `bank`, `cash` — solo `credit_card`.
- La corrección de las 3 cuentas ya mal cargadas del dueño — es S3, que SÍ reutiliza
  este campo como destino del valor viejo.

## Contrato de i18n (mismas claves en `es.json` y `en.json`)

- `accounts.creditLimitLabel` — etiqueta del campo.
- `accounts.creditLimitPlaceholder` / `accounts.creditLimitAccessibilityLabel`.
- `accounts.creditLimitInvalid` — error de validación (mismo criterio que
  `accounts.form.invalidInitialBalance`, adaptado).
- `accounts.creditLimitUsedLabel` — texto del indicador de % usado (interpolación
  `{{percent}}`, `{{limit}}` — formato final con `senior-uiux-design`).

## Tareas

### T7 — Migración: columna `creditLimit` en `accounts` — S2

```
Owner:      fe-senior-react (DDL exacto confirmado por senior-software-architect
            antes de escribir la migración)
Slice:      S2 · Límite de crédito     Appetite: S     Priority: P2
Depends on: feasibility de senior-software-architect     Blocks: T8
Context:    docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md —
            "Pregunta para senior-software-architect". Sigue el patrón de
            `008_envelopeCompletion.ts` (columna aditiva, sin reconstrucción de
            tabla, sin `requiresForeignKeysOff`).
Scope:
  - Nueva migración `src/db/migrations/00N_creditLimit.ts` exportando el statement
    de `ALTER TABLE`.
  - Registro en el arreglo `migrations` de `src/db/db.ts` con `version`
    incrementada (la base del dueño está en 8, así que esta es la próxima).
  - Doc comment explicando por qué es nullable, por qué solo aplica
    semánticamente a `credit_card` sin un `CHECK` que lo obligue (mismo
    razonamiento que columnas ortogonales existentes, p. ej. `completedAt` en
    `envelopes`).
Out of scope:
  - Cualquier índice nuevo — no hay consulta que filtre por `creditLimit` todavía.
Acceptance Criteria:
  - Given una instalación ya en `user_version = 8` (la base real del dueño),
    When arranca la app tras este cambio,
    Then `PRAGMA user_version` pasa a la nueva versión y las 8 cuentas existentes
    se leen con `creditLimit IS NULL`, sin error.
  - Given una instalación NUEVA (desde cero),
    When corre `initDatabase()`,
    Then la migración corre en orden junto a las demás y `accounts` tiene la
    columna `creditLimit`.
Definition of Done: AC cumplidos · migración nunca edita un archivo ya publicado ·
                    verificación en emulador con una copia de `moneytracker.db` en
                    `user_version = 8` real (o una reconstrucción equivalente) ·
                    HANDOFF.
```

### T8 — Campo de límite de crédito en el formulario + queries — S2

```
Owner:      fe-senior-react
Slice:      S2 · Límite de crédito     Appetite: M     Priority: P2
Depends on: T7     Blocks: T9
Context:    el usuario ya demostró que quiere guardar este dato (tecleó cupos
            redondos en el campo equivocado) — esta tarea le da un lugar correcto.
Scope:
  - `accountsQueries.ts`: `IAccount`, `IAccountWithBalance`,
    `IInsertAccountInput`, `IUpdateAccountInput` ganan `creditLimit: number |
    null`; `insertAccount`/`updateAccount` validan con `isFiniteInteger` cuando
    no es `null`; `ACCOUNTS_WITH_BALANCE_SELECT` incluye la columna.
  - `useAccountForm`: nuevo estado `creditLimitText`, visible/editable solo
    cuando `selectedKind === 'credit_card'`; se limpia si el kind cambia a otro
    valor (mismo criterio que ya aplica el hook a `balanceSign`).
  - `CreateAccount.tsx`: nuevo `InputField` condicionado a
    `selectedKind === 'credit_card'`, debajo del campo de saldo inicial.
Out of scope:
  - El indicador de % usado en la lista de cuentas — es T9.
  - Cambios a `loan`/`receivable`/`bank`/`cash`.
Acceptance Criteria:
  - Given `selectedKind === 'credit_card'`,
    When se renderiza `CreateAccount`,
    Then aparece el campo "Límite de crédito" además del saldo inicial.
  - Given `selectedKind` distinto de `credit_card`,
    When se renderiza,
    Then el campo NO aparece y no se envía ningún valor de `creditLimit` al
    guardar (queda `null`).
  - Given el campo vacío al guardar una tarjeta,
    When se guarda,
    Then `creditLimit` se persiste como `NULL` (no como 0) — vacío nunca implica
    "sin cupo = cero".
  - Given un valor no numérico en el campo,
    When se intenta guardar,
    Then se muestra `accounts.creditLimitInvalid` y NO se guarda.
  - Given se edita una cuenta `credit_card` con `creditLimit` ya guardado,
    When se abre en modo edición,
    Then el campo se precarga con ese valor (mismo patrón que
    `centsToEditableAmountText` ya usa para `initialBalance`).
Definition of Done: AC cumplidos · tsc/lint/build verdes · verificación en
                    emulador (crear y editar una tarjeta con y sin límite,
                    confirmar con `SELECT creditLimit FROM accounts WHERE id=?`)
                    · HANDOFF.
```

### T9 — Indicador de % usado en la lista/detalle de cuentas — S2

```
Owner:      fe-senior-react (con prototype-maker ⇄ senior-uiux-design para el
            formato visual exacto)
Slice:      S2 · Límite de crédito     Appetite: S     Priority: P2
Depends on: T8     Blocks: —
Context:    dato puramente informativo — ninguna alerta ni bloqueo (no-go de la
            pitch). El cálculo es presentación, no dato: vive en el mapper de la
            pantalla, no en `@db/queries`.
Scope:
  - Función pura `computeCreditUsage(balance, creditLimit)` en el `mappers.ts` de
    la pantalla que muestre las cuentas — devuelve `null` si `creditLimit` es
    `null`/`0` o si `balance >= 0` (nada que mostrar), o el porcentaje entero
    (0-100, con tope en 100) en caso contrario.
  - Render condicional del texto `accounts.creditLimitUsedLabel` bajo la tarjeta
    de cuenta cuando `computeCreditUsage` no es `null`.
Out of scope:
  - Cualquier color de alerta o umbral (p. ej. "rojo si > 90%") — no-go de la
    pitch, no en este apetite.
Acceptance Criteria:
  - Given una tarjeta con `creditLimit = $2,000` y saldo derivado `-$1,720`,
    When se ve la lista de cuentas,
    Then se muestra un texto equivalente a "86% usado" (copy final a validar
    con diseño).
  - Given una tarjeta sin `creditLimit` capturado,
    When se ve la lista de cuentas,
    Then NO aparece ningún indicador de uso.
  - Given una tarjeta con `creditLimit` capturado pero saldo derivado positivo
    (el caso de una cuenta aún no corregida, ver S3),
    When se ve la lista de cuentas,
    Then NO aparece el indicador (evita mostrar un porcentaje sin sentido sobre
    un dato que todavía no se sabe si es correcto).
Definition of Done: AC cumplidos · verificación de fidelidad con
                    prototype-maker ⇄ senior-uiux-design · verificación en
                    emulador con las 4 tarjetas reales del dueño (una con cupo,
                    tres sin) · HANDOFF.
```
