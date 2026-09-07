# Dirección de producto — MoneyTracker

## Próximas 2-3 apuestas

1. **Transferencia como tercer tipo de movimiento** (activa) — cierra la puerta de
   salida hacia categorías-sitio inventadas, moviendo "Transferencia" al camino que el
   usuario ya recorre (el FAB "+"). Ver
   `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`.
2. **Saldo inicial correcto en cuentas de tarjeta de crédito** (candidata, no shapeada
   aún) — problema adyacente detectado al shapear la apuesta 1: 3 de las 4 tarjetas del
   dueño tienen el CUPO cargado como saldo inicial positivo en vez de la deuda actual
   en negativo, lo que infla su patrimonio neto y haría que una transferencia hacia esa
   cuenta se vea "rara" (más positiva) sobre un dato de partida ya incorrecto. Solución
   probable: copy de ayuda en `CreateAccount` cuando `selectedKind === 'credit_card'`
   + quizás un flujo de corrección para las cuentas ya existentes. Small Batch
   estimado.
3. **Decisión sobre la pantalla `Transfer` existente** — depende de la respuesta del
   dueño a la Decisión 1 de la apuesta 1; puede no requerir una apuesta propia si la
   respuesta es "déjala tal cual".

## Qué NO estamos haciendo este ciclo, deliberadamente

- Ningún validador genérico de "esta categoría suena a una cuenta" — nombrado como
  rabbit hole en la apuesta 1, es un problema distinto con su propia forma de
  solución.
- Ninguna limpieza automática o guiada de las categorías-sitio ya creadas por el
  usuario, ni de sus movimientos ya mal-categorizados.
- Ningún cambio a `Transfer`/`useTransferScreen` fuera de lo que decida la Decisión 1.
- Nada relacionado con exportar/respaldar/cifrar la base de datos (riesgo conocido y
  documentado en `CLAUDE.md`, pero no es parte de este ciclo).

## Señal que nos haría cambiar de opinión

- Si tras la apuesta 1 el dueño sigue creando categorías-sitio (porque el copy de la
  Decisión 2 no fue suficiente, o porque prefiere seguir usando la pantalla `Transfer`
  vieja) — señal de que el problema no era solo "dónde vive el botón", sino el
  vocabulario mismo, y habría que revisar la Decisión 2 antes de dar la apuesta por
  cerrada.
- Si la transferencia hacia una tarjeta con el cupo mal cargado genera una queja o
  confusión antes de que la apuesta 2 se shapee — sube su prioridad de candidata a
  activa.
