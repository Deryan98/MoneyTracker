# Backlog — MoneyTracker

Board de referencia mientras no exista un tracker real (no se detectó `.azuredevops/`,
`azure-pipelines.yml` con work items, ni clave de Jira/Linear en este repo). Migrar
verbatim si aparece uno.

## Bet activo: Transferencia como tercer tipo de movimiento

Pitch: `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`

| ID | Slice | Tarea | Owner | Prioridad | Depende de | Estado |
|----|-------|-------|-------|-----------|------------|--------|
| T1 | S1 | TypeSegment de 3 opciones | fe-senior-react | P1 | — | Por hacer |
| T2 | S1 | Selector de cuenta destino | fe-senior-react | P1 | T1 | Por hacer |
| T3 | S1 | Ramificar guardado a `insertTransfer` | fe-senior-react | P1 | T1, T2 | Por hacer |
| T4 | S2 | Estado explicativo (asimetría Ingreso/Transferencia) | fe-senior-react | P2 | T1-T3 | Por hacer |
| T5 | S2 | Paridad i18n + accesibilidad | fe-senior-react | P2 | T1-T4 | Por hacer |
| — | S3 | Camino único para transferir | fe-senior-react (tentativo) | — | Decisión 1 del dueño | **Bloqueada** — sin tareas hasta respuesta |

## Decisiones abiertas que bloquean trabajo

1. **Destino de la pantalla `Transfer`/botón "Transferir"** (bloquea S3) — ver
   `docs/product/slices/S3-camino-unico-pendiente-decision.md`.
2. **Copy de la asimetría Ingreso/Transferencia** (bloquea el cierre de T4, no su
   inicio) — propuesta en la pitch, pendiente de aprobación.
3. **Categorías-sitio existentes y la categoría sembrada "Credit card"** — recomendado
   no tocar en este bet; el dueño puede pedir una apuesta aparte.

## Feasibility pendiente

Handoff enviado a `senior-software-architect` para:
- Confirmar que ramificar `useFormScreen.saveTransaction` hacia `insertTransfer` no
  requiere ningún ajuste en `transfersQueries.ts` (se asume que no, por lectura del
  código — la función ya acepta origen/destino/monto y no depende de la pantalla que
  la llama).
- Opinar si la categoría sembrada "Credit card" (migración 003, expense e income)
  amerita un ADR para una futura migración correctiva, o se deja como está
  indefinidamente.
- Confirmar orden de slices (S1 → S2, S3 en paralelo solo si el dueño resuelve la
  Decisión 1 a tiempo).

## Nice to have (fuera de este bet, no descartado)

- Test automatizado de paridad de claves i18n ES/EN (P3/refactor).
- Validador de nombres de categoría contra nombres/tipos de cuenta existentes.
- Limpieza de las 3 transacciones de tarjeta ya mal-categorizadas del dueño.
