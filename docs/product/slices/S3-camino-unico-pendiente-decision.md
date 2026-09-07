# S3 — Un solo camino para transferir (BLOQUEADA por decisión del dueño)

Pitch: `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`
Hill chart: **subiendo la colina** — no hay tareas escritas todavía. Esto es
intencional: escribir tareas antes de la Decisión 1 del dueño sería inventar alcance
que puede sobrar.

## Por qué está bloqueada

La pitch identificó tres caminos posibles para el botón "Transferir" de
`AccountsScreen` y la ruta `Transfer` una vez que S1 existe:

- (a) Dejarlo tal cual — dos caminos para lo mismo.
- (b) El botón navega al FormScreen con Transferencia preseleccionada; la ruta
  `Transfer` se deja de registrar.
- (c) Se elimina `Transfer`/`useTransferScreen`/sus partials del todo.

Cada opción tiene un costo y un riesgo distintos, y ninguna es una llamada de producto
que yo deba tomar por el dueño — está nombrada explícitamente en la pitch como
"Decisión 1".

## Qué pasa cuando llegue la respuesta

- Si (a): esta rebanada se cierra sin tareas, se borra este archivo o se marca
  "resuelta: no acción".
- Si (b): tareas esperadas — `fe-senior-react` cambia el `onPress` del botón
  "Transferir" para navegar a `Form` con un parámetro de tipo inicial, y retira
  `Stack.Screen name="Transfer"` de `AccountsNavigator` (código de la pantalla se
  queda en el árbol, marcado como no enrutado, hasta que el dueño decida borrarlo —
  mismo criterio que el resto de "dead code" que ya documenta `CLAUDE.md`). Encaja en
  Small Batch.
- Si (c): pasa a shaping propio — retirar `Transfer.tsx`, `useTransferScreen.ts`,
  `TransferDivider`, `TransferPreview`, `AccountPickerModal`, sus claves i18n
  (`transfer.*`) y decidir si algo de `AccountSelectorCard`/`AmountCard` de esa
  carpeta se reutiliza en S1/S2 antes de borrarlo. No se apetece aquí sin esa
  decisión — Medium Batch estimado, a re-shapear cuando el dueño elija esta opción.

## Acción para el dueño

Una pregunta, no un cuestionario: **¿el botón "Transferir" de Cuentas debe seguir
abriendo su propia pantalla, o debe abrir el mismo formulario con Transferencia ya
elegida?** La respuesta decide si esta rebanada tiene un lote de trabajo (b) o dos
(c y el retiro), o ninguno (a).
