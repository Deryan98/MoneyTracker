# Backlog — MoneyTracker

Board de referencia mientras no exista un tracker real (no se detectó `.azuredevops/`,
`azure-pipelines.yml` con work items, ni clave de Jira/Linear en este repo). Migrar
verbatim si aparece uno.

## Bet anterior: Transferencia como tercer tipo de movimiento (parece completada)

Los commits recientes de la rama (`d2197ea`, `e5e707c`, `a9ff428`, `0539b93`) sugieren
que T1-T5 y la Decisión 1 (S3) ya se resolvieron — no se auditó a fondo porque no es
el objeto de esta sesión de shaping. Verificar con `senior-qa` antes de dar la apuesta
por cerrada formalmente y actualizar el estado de cada fila abajo.

| ID | Slice | Tarea | Owner | Prioridad | Depende de | Estado |
|----|-------|-------|-------|-----------|------------|--------|
| T1 | S1 | TypeSegment de 3 opciones | fe-senior-react | P1 | — | Aparenta hecho |
| T2 | S1 | Selector de cuenta destino | fe-senior-react | P1 | T1 | Aparenta hecho |
| T3 | S1 | Ramificar guardado a `insertTransfer` | fe-senior-react | P1 | T1, T2 | Aparenta hecho |
| T4 | S2 | Estado explicativo (asimetría Ingreso/Transferencia) | fe-senior-react | P2 | T1-T3 | Aparenta hecho |
| T5 | S2 | Paridad i18n + accesibilidad | fe-senior-react | P2 | T1-T4 | Sin confirmar |
| — | S3 | Camino único para transferir | fe-senior-react | — | Decisión 1 del dueño | Aparenta resuelta (ver `a9ff428`) |

## Bet activo: Saldo inicial correcto en cuentas de tarjeta de crédito

Pitch: `docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md`

| ID | Slice | Tarea | Owner | Prioridad | Depende de | Estado |
|----|-------|-------|-------|-----------|------------|--------|
| T6 | S1 | Default de `balanceSign` a negativo en cuentas de deuda nuevas | fe-senior-react | P1 | — | Por hacer |
| T7 | S2 | Migración: columna `creditLimit` en `accounts` | fe-senior-react | P2 | Feasibility de senior-software-architect | Por hacer |
| T8 | S2 | Campo de límite de crédito en el formulario + queries | fe-senior-react | P2 | T7 | Por hacer |
| T9 | S2 | Indicador de % usado en lista/detalle de cuentas | fe-senior-react | P2 | T8 | Por hacer |
| T10 | S3 | Migración: columna de confirmación + query de pendientes | fe-senior-react | P1 | T7 | Por hacer |
| T11 | S3 | Banner + flujo de revisión guiada por cuenta | fe-senior-react | P1 | T10, T8 | Por hacer |
| T12 | S3 | Diálogo de cambio de patrimonio neto (una sola vez) | fe-senior-react | P1 | T11 | Por hacer |

## Decisiones abiertas — apuesta activa (tarjetas de crédito)

Ninguna bloquea el inicio del trabajo (ver "Decisiones que tomé yo" en la pitch).
Solo queda pendiente de `senior-software-architect`:

1. Número exacto y forma de las migraciones 009/010 (columnas `creditLimit` e
   `initialBalanceConfirmedAt` en `accounts`, ver la pitch, sección final).
2. Confirmar que T7 y T10 pueden ir en migraciones separadas sin conflicto de
   `user_version` si se desarrollan en paralelo.

## Decisiones abiertas heredadas de la apuesta anterior (transferencias)

1. **Destino de la pantalla `Transfer`/botón "Transferir"** — aparenta resuelta por
   `a9ff428`, confirmar con `senior-qa`.
2. **Copy de la asimetría Ingreso/Transferencia** — aparenta resuelta por `e5e707c`.
3. **Categorías-sitio existentes y la categoría sembrada "Credit card"** — sigue sin
   tocarse, deliberadamente.

## Nice to have (fuera de ambas apuestas, no descartado)

- Test automatizado de paridad de claves i18n ES/EN (P3/refactor).
- Validador de nombres de categoría contra nombres/tipos de cuenta existentes.
- Limpieza de las 3 transacciones de tarjeta ya mal-categorizadas del dueño (nota:
  esto es sobre `finances`, no sobre el `initialBalance` de `accounts` que corrige la
  apuesta activa — son dos problemas distintos, ver la pitch activa, "No-gos").
- Alertas/avisos de proximidad al límite de crédito una vez capturado (candidata
  futura, nombrada como rabbit hole en la pitch activa).
