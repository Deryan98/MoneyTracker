# S3 — Revisión guiada de cuentas ya mal cargadas + aviso de cambio de patrimonio

Pitch: `docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md`
Hill chart: **subiendo la colina** — es la rebanada más incierta de las tres: el copy
del asistente, cuántos pasos tiene y cómo se comunica el cambio de patrimonio son
decisiones de diseño que no están cerradas. Depende de S2 (reutiliza el campo
`creditLimit` como destino del valor viejo cuando el usuario confirma que era un
cupo).

## Qué se puede demostrar al final

Las 3 cuentas reales del dueño (ids 6, 7, 8) que hoy tienen el cupo cargado como saldo
positivo aparecen señaladas en Cuentas. El dueño responde, por cada una, cuánto debe
realmente (o confirma que el saldo a favor es correcto, el caso raro). Al terminar, ve
un mensaje único que explica cómo cambió su patrimonio neto y por qué.

## Alcance

- Migración nueva (propuesta: 010, número exacto a confirmar con
  `senior-software-architect`) que añade `initialBalanceConfirmedAt TEXT` (nullable)
  a `accounts` — mismo patrón aditivo que T7/S2 y que `completedAt` en
  `008_envelopeCompletion.ts`.
- Query nueva en `accountsQueries.ts`: cuentas "pendientes de revisión" =
  `kind IN ('credit_card', 'loan') AND archivedAt IS NULL AND initialBalance > 0 AND
  initialBalanceConfirmedAt IS NULL`.
- Banner no bloqueante en `AccountsScreen` ("Revisa el saldo de N cuentas") que
  navega a una pantalla nueva de revisión.
- Por cada cuenta pendiente, dos acciones:
  - **"Esto era mi límite de crédito"** → abre un campo obligatorio (sin default,
    sin permitir guardar vacío ni en 0) para el monto REAL adeudado hoy; al
    confirmar: el valor viejo de `initialBalance` se copia a `creditLimit` (si no
    tenía uno ya) y `initialBalance` pasa a ser `-(monto tecleado)`.
  - **"Este saldo a favor es correcto"** → no cambia ningún monto, solo fija
    `initialBalanceConfirmedAt = now()`.
- Al resolver la ÚLTIMA cuenta pendiente de la sesión de revisión: diálogo único
  "Tu patrimonio neto cambió de $X a $Y" (antes = patrimonio al ABRIR el asistente,
  después = patrimonio recalculado al cerrarlo), con una frase explicando el porqué.
  Se muestra una sola vez; no se repite tras cerrarlo.
- El banner persiste entre reinicios de la app mientras existan cuentas pendientes,
  pero nunca bloquea el resto de la app.

## Fuera de alcance

- Cualquier corrección automática — todo pasa por una respuesta explícita del dueño.
- Extender la revisión a cuentas `receivable`/`bank`/`cash` — no hay evidencia de que
  estén mal cargadas.
- Rediseñar `AccountsScreen` más allá del banner y el punto de entrada a la revisión.

## Contrato de i18n

- `accounts.reviewBannerTitle` (con `{{count}}`), `accounts.reviewBannerAction`.
- `accounts.reviewWasLimitAction`, `accounts.reviewConfirmCorrectAction`.
- `accounts.reviewAmountOwedLabel`, `accounts.reviewAmountOwedRequired` (sin
  default, error si se intenta continuar vacío).
- `accounts.netWorthChangedTitle`, `accounts.netWorthChangedMessage` (interpolación
  `{{before}}`, `{{after}}`, usando `formatCentsToCurrency`).

## Tareas

### T10 — Migración: columna de confirmación + query de cuentas pendientes — S3

```
Owner:      fe-senior-react (DDL exacto confirmado por senior-software-architect)
Slice:      S3 · Revisión guiada     Appetite: S     Priority: P1
Depends on: T7 (mismo patrón de migración aditiva, se prefiere secuencial)
Blocks:     T11
Context:    docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md —
            "Pregunta para senior-software-architect", opción 2.
Scope:
  - Migración `src/db/migrations/01N_accountBalanceReview.ts`:
    `ALTER TABLE accounts ADD COLUMN initialBalanceConfirmedAt TEXT`.
  - `getAccountsPendingBalanceReview(db)` en `accountsQueries.ts`: SELECT con el
    filtro descrito arriba, devolviendo `IAccountWithBalance[]`.
  - Doc comment explicando por qué esta columna es ORTOGONAL a `archivedAt` (una
    cuenta puede estar activa y sin revisar a la vez) — mismo razonamiento que
    `008` documenta para `completedAt` vs `archivedAt`.
Out of scope:
  - Cualquier lógica de UI — solo esquema y query.
Acceptance Criteria:
  - Given la base real del dueño (ids 6, 7, 8 con `initialBalance` positivo,
    id 3 con `initialBalance` negativo, ids 2 y 4 de tipo `loan` negativos),
    When se llama `getAccountsPendingBalanceReview`,
    Then devuelve EXACTAMENTE las cuentas 6, 7 y 8 — ni la 3 (ya negativa), ni la
    2/4 (`loan` ya negativo), ni ninguna `cash`/`bank`/`receivable`.
  - Given una cuenta con `initialBalanceConfirmedAt` ya no nulo,
    When se llama la query,
    Then esa cuenta NO aparece, aunque su `initialBalance` siga siendo positivo.
Definition of Done: AC cumplidos · verificación contra una copia real de
                    `moneytracker.db` del dueño · HANDOFF.
```

### T11 — Banner + flujo de revisión guiada por cuenta — S3

```
Owner:      fe-senior-react (con prototype-maker ⇄ senior-uiux-design para las
            pantallas del asistente — es el punto más incierto de esta pitch)
Slice:      S3 · Revisión guiada     Appetite: M     Priority: P1
Depends on: T10, T8 (necesita el campo `creditLimit` de S2 como destino del valor
            viejo)     Blocks: T12
Context:    decisión (c) de la pitch — nunca automática, siempre una respuesta
            explícita del dueño, sin default a 0.
Scope:
  - Banner en `AccountsScreen`, visible cuando
    `getAccountsPendingBalanceReview` devuelve al menos una fila.
  - Pantalla de revisión: una cuenta a la vez (o lista con acción inline si el
    apetite no alcanza para un asistente paso a paso — recorte explícito
    permitido por la pitch), con las dos acciones descritas en el alcance de
    esta rebanada.
  - Acción "Esto era mi límite de crédito": el input del monto adeudado es
    OBLIGATORIO — el botón de confirmar queda deshabilitado hasta que haya un
    valor numérico válido (mismo criterio de validación que `initialBalance`,
    vía `isFiniteInteger`/`parseInitialBalanceToCents`).
  - Acción "Este saldo a favor es correcto": confirmación inmediata, sin campos
    adicionales.
Out of scope:
  - El diálogo de cambio de patrimonio neto — es T12.
  - Cualquier alerta de proximidad al límite recién capturado — no-go de la
    pitch.
Acceptance Criteria:
  - Given las 3 cuentas pendientes del dueño,
    When abre la pestaña Cuentas,
    Then ve un banner "Revisa el saldo de 3 cuentas".
  - Given elige "Esto era mi límite de crédito" para la cuenta 6 (initialBalance
    +$2,000) y escribe "150" como monto real adeudado,
    When confirma,
    Then `creditLimit` de la cuenta 6 pasa a ser $2,000, `initialBalance` pasa a
    ser -$150, y la cuenta deja de aparecer en pendientes.
  - Given intenta confirmar sin escribir ningún monto,
    When pulsa el botón de confirmar,
    Then el botón está deshabilitado y no se guarda nada.
  - Given elige "Este saldo a favor es correcto" para una cuenta,
    When confirma,
    Then `initialBalance` NO cambia, `initialBalanceConfirmedAt` deja de ser
    `NULL`, y la cuenta deja de aparecer en pendientes para siempre (no vuelve a
    señalarse aunque el saldo derivado cambie después por movimientos).
  - Given quedan cuentas pendientes y el usuario cierra la app,
    When la vuelve a abrir,
    Then el banner reaparece — el resto de la app (Balance, Movimientos,
    Presupuestos) sigue usable sin restricción.
  - Given ya no quedan cuentas pendientes,
    When abre Cuentas,
    Then no aparece ningún banner.
Definition of Done: AC cumplidos · tsc/lint/build verdes · verificación de
                    fidelidad con prototype-maker ⇄ senior-uiux-design ·
                    verificación en el EMULADOR contra una copia de la base real
                    del dueño, confirmando el estado final de las cuentas 6, 7 y
                    8 con `sqlite3` · HANDOFF.
```

### T12 — Diálogo de cambio de patrimonio neto (una sola vez) — S3

```
Owner:      fe-senior-react
Slice:      S3 · Revisión guiada     Appetite: S     Priority: P1
Depends on: T11     Blocks: —
Context:    decisión (d) de la pitch — un salto silencioso de +$2,930 a -$1,070
            destruye confianza aunque la cifra nueva sea la correcta.
Scope:
  - Al ABRIR el flujo de revisión (T11), capturar el patrimonio neto actual en
    memoria ("antes").
  - Al CERRAR el flujo tras resolver la última cuenta pendiente de esa sesión,
    recalcular el patrimonio neto ("después") y mostrar
    `accounts.netWorthChangedTitle`/`netWorthChangedMessage` con ambos valores
    formateados vía `formatCentsToCurrency`.
  - El diálogo se muestra UNA sola vez por sesión de revisión completada — si el
    usuario abandona a medias y vuelve después, solo se dispara al completar la
    última cuenta que faltaba, no en cada apertura del banner.
Out of scope:
  - Cualquier variante de este diálogo para cambios de patrimonio "normales" (por
    ejemplo, tras registrar un gasto) — esto es exclusivo del cierre de la
    revisión guiada de S3.
Acceptance Criteria:
  - Given el dueño resuelve la cuenta 6, luego la 7, luego la 8 (la última
    pendiente),
    When confirma la 8,
    Then aparece exactamente una vez un diálogo mostrando el patrimonio neto de
    antes de abrir la revisión y el de después de cerrarla.
  - Given el diálogo ya se mostró y se cerró,
    When el usuario vuelve a abrir Cuentas más tarde,
    Then el diálogo NO reaparece (no hay cuentas pendientes que lo disparen de
    nuevo).
  - Given el dueño resuelve solo 2 de las 3 cuentas y cierra el flujo a medias,
    When vuelve después y resuelve la última pendiente,
    Then el diálogo se dispara en ESE momento (al completarse la revisión), no
    antes.
Definition of Done: AC cumplidos · copy aprobado por el dueño (o prototype-maker
                    ⇄ senior-uiux-design en su representación) · verificación en
                    emulador con la base real del dueño mostrando el salto de
                    +$2,930 a la cifra corregida · HANDOFF.
```
