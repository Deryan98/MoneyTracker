# Dirección de producto — MoneyTracker

## Próximas 2-3 apuestas

1. **Saldo inicial correcto en cuentas de tarjeta de crédito** (activa, shapeada) —
   3 de las 4 tarjetas reales del dueño tienen el CUPO cargado como saldo inicial
   positivo en vez de la deuda actual en negativo (verificado contra su base:
   +$2,930 de patrimonio mostrado vs. -$1,070 real). Causa raíz: el selector de signo
   ya existe pero nace en `'positive'` incluso en cuentas de deuda. Ver
   `docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md`. Medium
   Batch, 3 rebanadas: default correcto para cuentas nuevas (S1) → campo de límite de
   crédito (S2) → revisión guiada de las 3 cuentas ya mal cargadas + aviso del cambio
   de patrimonio (S3).
2. **Transferencia como tercer tipo de movimiento** (bet anterior, aparenta
   completada por los commits recientes de la rama — pendiente de confirmar con
   `senior-qa` antes de cerrarla formalmente). Ver
   `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`.
3. **Alertas de proximidad al límite de crédito** (candidata, no shapeada) —
   extensión natural de la apuesta 1 una vez que `creditLimit` exista; nombrada como
   rabbit hole explícito de esa pitch para no inflar su apetite. Se shapea aparte si
   el dueño la pide tras ver el indicador de % usado en producción.
4. **Depurar categorías heredadas duplicadas** (shapeada, no iniciada) — un APK
   limpio recién instalado muestra `House`/`Food`/`Bills`/`Children` (gasto) y
   `Rent`/`Interests` (ingreso) — todas de la migración 003, inglés fijo — junto a
   sus equivalentes curadas traducidas; empeoró de visible a evidente con la
   traducción en vivo (`052a771`/ADR 0004), porque ahora la mitad de la lista traduce
   y la otra mitad no. `senior-qa` verificó en emulador que `Salary` NO está
   duplicada (queda fuera). Ver
   `docs/product/pitches/depurar-categorias-heredadas-duplicadas.md`. Small Batch, se
   retiran (nunca se fusionan ni se reasignan) 6 filas mediante el mismo mecanismo
   `retiredAt` que ya diseñó, sin código todavía, la ADR 0002 para `Loan`/`Credit
   card` — pregunta abierta a `senior-software-architect` sobre si ambos frentes
   comparten una sola migración.

## Qué NO estamos haciendo este ciclo, deliberadamente

- Ninguna alerta o notificación de proximidad al límite de crédito — rabbit hole
  nombrado en la apuesta 1 activa, queda como candidata 3 aparte.
- Ningún campo de "límite" para `loan`/`receivable`/`bank`/`cash` — la apuesta 1 solo
  toca `credit_card`.
- Ninguna corrección automática/silenciosa de las 3 cuentas ya mal cargadas del
  dueño — siempre pasa por una respuesta explícita suya (S3 de la apuesta 1).
- Ningún validador genérico de "esta categoría suena a una cuenta" — nombrado como
  rabbit hole en la apuesta de transferencias, es un problema distinto con su propia
  forma de solución.
- Ninguna limpieza automática o guiada de las categorías-sitio ya creadas por el
  usuario, ni de sus movimientos ya mal-categorizados (esto es sobre `finances`, no
  sobre `accounts.initialBalance` — dos problemas distintos, no se mezclan).
- Nada relacionado con exportar/respaldar/cifrar la base de datos (riesgo conocido y
  documentado en `CLAUDE.md`, pero no es parte de este ciclo).
- Ninguna fusión/renombrado de categoría heredada a una curada (`Food`→`Groceries`,
  etc.) — la apuesta 4 RETIRA, nunca fusiona; fusionar exigiría adivinar qué quiso
  decir el usuario con `Food`/`Bills` (y reasignar `finances`/`category_budgets` para
  `Interests`(ingreso), que comparte icono con `investments`), que es precisamente lo
  que ya se rechazó una vez (ADR 0003, superseded).
- Ninguna categoría curada de crianza/hijos todavía — `Children` se retira sin
  reemplazo en la apuesta 4; se shapea aparte si el dueño la pide.
- Ningún retiro de `Salary` — `senior-qa` confirmó que no duplica en instalación en
  inglés (T16, cerrada). La variante en español queda como nota, no como decisión
  pendiente de bloqueo.

## Señal que nos haría cambiar de opinión

- Si el dueño, tras S1 de la apuesta activa, sigue creando cuentas de deuda con saldo
  positivo A PESAR del nuevo default (por ejemplo, tecleando el signo contrario a
  mano) — señal de que el problema no era solo el default, sino el propio flujo de
  captura, y habría que revisar el diseño del selector antes de dar S1 por cerrada.
- Si tras el indicador de % usado (S2) el dueño pide explícitamente avisos de
  proximidad al límite — sube la candidata 3 de "no shapeada" a activa.
- Si tras la apuesta de transferencias el dueño sigue creando categorías-sitio (o
  sigue prefiriendo la pantalla `Transfer` vieja si no se retiró del todo) — señal de
  que el problema no era solo "dónde vive el botón", sino el vocabulario mismo.
- Si una instalación que arranca en ESPAÑOL confirma que `Salary` sí queda duplicada
  (no verificado — T16 solo probó inglés) — se retira con la misma receta de la
  apuesta 4, sin necesidad de re-shapear nada.
- Si el dueño reporta que le falta una categoría para gastos de hijos/crianza tras
  quedar `Children` retirada sin reemplazo — sube la candidata de categoría de
  crianza de "nice to have" a shapeada.
