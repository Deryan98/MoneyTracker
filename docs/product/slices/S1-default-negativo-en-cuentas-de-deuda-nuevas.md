# S1 — Tracer bullet: signo negativo por defecto en cuentas de deuda nuevas

Pitch: `docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md`
Hill chart: **bajando la colina** — es un cambio de una condición en un hook que ya
existe (`useAccountForm`), simétrico al que ya existe en sentido contrario
(`onChangeSelectedKind` ya fuerza `'positive'` al salir de un tipo de deuda). No hay
esquema nuevo, no hay pantalla nueva.

## Qué se puede demostrar al final

Un usuario que da de alta una tarjeta o un préstamo nuevo, sin tocar el selector de
signo, guarda con el saldo YA negativo — el default deja de mentir. El selector
sigue ahí y sigue funcionando para el caso real de saldo a favor.

## Alcance

- `useAccountForm.onChangeSelectedKind`: cuando el nuevo `kind` cumple
  `isDebtAccountKind(kind)` **y la cuenta es de alta (no edición)**, `balanceSign` pasa
  a `'negative'` — la rama inversa (kind no-deuda ⇒ `'positive'`) ya existe y no se
  toca.
- Sin cambio en modo edición: `loadAccount` sigue fijando `balanceSign` a partir del
  signo REAL del `initialBalance` guardado (`account.initialBalance < 0 ? 'negative' :
  'positive'`) — abrir una de las 3 cuentas ya mal cargadas del dueño para editar debe
  seguir mostrando su valor real (positivo), sin re-escribir nada; esa corrección es
  S3, no esta rebanada.
- Verificar que `accounts.debtBalanceHint` sigue siendo el texto correcto dado el
  nuevo default (probablemente no necesita cambio de copy, solo confirmarlo).

## Fuera de alcance

- Cualquier campo nuevo (límite de crédito) — es S2.
- Cualquier corrección de datos ya existentes — es S3.
- Eliminar o esconder el selector de signo — rabbit hole rechazado en la pitch.

## Contrato de i18n

Ninguna clave nueva. `accounts.debtBalanceHint`, `accounts.balanceSignLabel`,
`accounts.balanceSignOwed`, `accounts.balanceSignPositive` ya existen y no cambian de
texto (a confirmar en la tarea que el copy siga siendo coherente con el nuevo
comportamiento).

## Tareas

### T6 — Default de `balanceSign` a negativo en cuentas de deuda nuevas — S1

```
Owner:      fe-senior-react
Slice:      S1 · Default negativo en cuentas de deuda nuevas   Appetite: S   Priority: P1
Depends on: —     Blocks: —
Context:    docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md —
            causa raíz verificada: `useAccountForm.ts:75-77` inicializa `balanceSign`
            en `'positive'` sin importar el `kind`, y `onChangeSelectedKind` (líneas
            142-150) solo corrige el sentido no-deuda→positivo, nunca el sentido
            deuda→negativo. 3 de las 4 tarjetas reales del dueño (ids 6, 7, 8)
            quedaron mal cargadas por exactamente este hueco.
Scope:
  - En `onChangeSelectedKind`, cuando `isDebtAccountKind(kind)` es true Y
    `mode === 'create'`, fijar `balanceSign` a `'negative'`.
  - No tocar el camino de `loadAccount` (modo edición) — debe seguir reflejando el
    signo REAL guardado, no un default.
  - No tocar `isDebtAccountKind`, `DEBT_ACCOUNT_KINDS`, ni ninguna función de
    `@db/queries` — este fix vive enteramente en el hook.
Out of scope:
  - Cualquier cambio de copy en `accounts.debtBalanceHint` u otras claves — se
    verifica que siguen siendo correctas, no se reescriben salvo que la
    verificación encuentre un problema real.
  - El selector de signo en sí (`ChipSelect` en `CreateAccount.tsx`) no cambia de
    posición ni de opciones.
Acceptance Criteria:
  - Given `CreateAccount` en modo alta con el kind por defecto (`cash`),
    When el usuario selecciona `credit_card` o `loan` en `KindField`,
    Then el `ChipSelect` de signo queda mostrando "Debo" (negativo)
    seleccionado, sin que el usuario lo haya tocado.
  - Given el signo ya en negativo tras seleccionar un tipo de deuda,
    When el usuario cambia el kind a `cash` o `bank` (no deuda),
    Then el signo vuelve a `'positive'` — comportamiento ya existente, sin
    regresión.
  - Given una cuenta nueva de tipo `credit_card` con el usuario tecleando solo el
    monto (sin tocar el selector) y guardando,
    When se lee la fila insertada,
    Then `initialBalance` es un entero negativo igual a `-(monto tecleado en
    centavos)`.
  - Given el modo EDICIÓN de una cuenta `credit_card` ya existente con
    `initialBalance` positivo (el caso real de las 3 cuentas del dueño),
    When se abre para editar,
    Then el selector de signo muestra "A favor" (el valor REAL guardado, no el
    nuevo default) — esta tarea no reescribe datos existentes.
Definition of Done: AC cumplidos · tsc/lint/build verdes · sin secretos ·
                    verificación en emulador Android creando una tarjeta nueva y
                    leyendo `moneytracker.db`
                    (`SELECT initialBalance FROM accounts ORDER BY id DESC LIMIT 1;`)
                    · HANDOFF.
```
