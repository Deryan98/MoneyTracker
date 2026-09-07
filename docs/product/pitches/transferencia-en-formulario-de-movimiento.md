# Pitch: Transferencia como tercer tipo de movimiento en "Nuevo movimiento"

Estado: propuesto — pendiente de feasibility (`senior-software-architect`) y de 3
decisiones del dueño (ver "Decisiones pendientes").

## Problema

Didier abre el "+" para anotar el pago de su tarjeta de crédito porque es el botón que
siempre ve — el mismo que usa para el resto de sus gastos. Ese formulario solo ofrece
Gasto | Ingreso; no hay "Transferencia" en ningún sitio de esa pantalla. Para poder
guardar algo, elige Gasto y busca en la rejilla una categoría que se llame como su
tarjeta. No la encuentra — porque no existe una categoría de propósito llamada así — así
que la crea él mismo. A partir de ahí el pago de la tarjeta cuenta como un gasto nuevo,
cuando el gasto real ya se contó el día que pasó la tarjeta en el supermercado o la
gasolinera: el mismo dinero queda registrado dos veces, una vez bajo su categoría real
(Combustible, Despensa, Supermercado) y otra vez bajo la categoría-sitio inventada.

Esto no es un caso límite hipotético. Se verificó en el código: la migración
`003_seedDefaultCategoriesAndDropIcons.ts` siembra, en **toda instalación nueva**, una
categoría de gasto y otra de ingreso literalmente llamadas **"Credit card"**. El propio
seed por defecto de la app ya comete el error semántico que Didier describe, antes de
que el usuario toque nada. Y la puerta de salida hacia ese error es estructural: el FAB
"+" (`src/screens/FormScreen`) es la única entrada visible y solo pregunta
Gasto/Ingreso; "Transferir" existe (`src/screens/AccountsScreen/Transfer`,
`insertTransfer` ya escribe las dos patas atómicamente) pero vive detrás de un botón
secundario junto al patrimonio neto en la pestaña Cuentas — no en el camino que
cualquiera recorre para "anotar algo que gasté".

## Apetito

**Medium Batch — 1 semana.** No hay esquema nuevo: `finances.idCategory NULL` +
`transferGroupId` compartido ya existen (migración 4) e `insertTransfer` ya es atómico
y probado en producción (pantalla Transfer). Esto es reordenar UI y ramificar un hook
existente, no construir un mecanismo nuevo. Si el trabajo de diseño de la UI de destino
(rejilla de categorías → selector de cuenta destino) no cierra en la semana, se recorta
alcance visual (ver Rabbit holes), no se alarga el plazo.

## Solución (breadboard, baja fidelidad)

```
Lugar: FormScreen ("Nuevo movimiento", ruta Form/EditTransaction)

Afordancias:
  - TypeSegment: Gasto | Ingreso | Transferencia   (3 pastillas, layout="even")
  - AmountCard: input de monto (sin cambio) + selector de CUENTA ORIGEN (sin cambio)
  - Zona inferior, condicionada por TypeSegment:
      Gasto/Ingreso  -> CategoryGrid (sin cambio, ya filtrada por tipo)
      Transferencia  -> selector de CUENTA DESTINO
                        (mismas pastillas que el selector de origen del AmountCard;
                         excluye la cuenta ya elegida como origen — igual que
                         `accountsForPicker` en useTransferScreen)
  - Botón Guardar (sin cambio de posición ni copy)

Conexiones:
  - Elegir "Transferencia" -> limpia selectedCategory, oculta CategoryGrid, muestra
    selector de cuenta destino, precarga la primera cuenta distinta del origen.
  - Guardar con Transferencia -> llama a insertTransfer(origen, destino, monto)
    en vez de insertFinance — MISMA función que ya usa la pantalla Transfer, cero
    SQL nuevo.
  - Cambiar la cuenta ORIGEN mientras Transferencia está activo y coincide con el
    destino -> el destino se re-resuelve a otra cuenta distinta (mismo
    comportamiento ya existente en useTransferScreen, reutilizado).
```

## Rabbit holes (ya decididos)

- **No se rediseña la pantalla `Transfer` existente.** Su tarjeta de vista previa
  "Después de transferir", su cabecera y su copy son trabajo reciente y aprobado
  (commit `bc82d6e` y anteriores) — se tocan solo si el dueño decide en la Decisión 1
  que esa pantalla desaparece o cambia de rol, y eso se ejecuta como tarea aparte, no
  como parte de rediseñarla.
- **No se construye un validador genérico** "esta categoría suena a cuenta" para
  categorías nuevas. Tentador, pero es un problema distinto (integridad de datos al
  crear categorías) con su propia forma de solución (aviso en `CreateCategory`, quizás
  una lista de palabras reservadas) — no cabe en el apetite de esta rebanada y no lo
  necesita para cerrar el problema real (la puerta de salida al error es el FORMULARIO
  DE MOVIMIENTO, no el de categoría).
- **No se migran ni se limpian** las categorías-sitio que un usuario ya se haya
  inventado, ni las 3 transacciones de tarjeta ya mal-categorizadas del dueño. Esta
  rebanada previene hacia adelante; la limpieza de datos existentes es una decisión de
  producto aparte (ver Decisión 3) porque requiere decidir qué hacer con movimientos ya
  guardados, no solo con el formulario.
- **No se toca la categoría sembrada "Credit card"** de la migración 003. No se puede
  editar una migración ya enviada (regla de `CLAUDE.md`); quitarla o renombrarla
  necesitaría una migración NUEVA con su propio ADR, y decidir si eso ES deseable
  siquiera es la Decisión 3, no una tarea de esta rebanada.

## No-gos (explícitamente fuera)

- Ninguna migración de base de datos nueva.
- Ninguna herramienta de "convertir gasto existente en transferencia" (editar una pata
  de transferencia ya está bloqueado hoy por diseño — `useFormScreen`'s
  `transferNotEditable` — y esta rebanada no lo cambia).
- Ningún cambio al mecanismo de préstamos (`receivable`) más allá de que ya es una
  transferencia — sigue funcionando exactamente igual.
- Ningún cambio al problema adyacente del saldo inicial de las tarjetas de crédito (ver
  sección dedicada abajo) — se nombra, se recomienda como apuesta futura, no se ejecuta
  aquí.
- Ningún soporte de "transferencia hacia un sobre" (`envelopes`) — esa es la mecánica de
  Asignar/Retirar que ya existe y es un dominio distinto.

## Señal de éxito

Observable en el propio dato: después de este cambio, el conteo de categorías nuevas
creadas por el dueño con nombre de cuenta/banco/tarjeta (verificable a ojo, es su única
base) se queda en cero, y la próxima vez que registre un pago de tarjeta lo hace como
Transferencia — dos patas en `finances` con `transferGroupId` compartido y
`idCategory NULL`, visibles en Balance en ambas cuentas — no como un gasto con una
categoría nueva.

## Decisiones pendientes del dueño (no las tomo yo)

1. **Destino de la pantalla `Transfer` y su botón "Transferir" en Cuentas.** Tres
   opciones, cada una con distinto costo:
   - (a) Se queda tal cual, como atajo alternativo — cero trabajo adicional, pero
     quedan DOS caminos para lo mismo, con dos UIs distintas.
   - (b) El botón "Transferir" pasa a navegar al FormScreen con el segmento
     Transferencia preseleccionado, y la pantalla `Transfer` se retira de la
     navegación (no se borra el código todavía, se deja de registrar la ruta) —
     un solo camino, trabajo mínimo adicional (~otra tarea pequeña de navegación).
   - (c) La pantalla `Transfer` se elimina del todo — más trabajo (hay que decidir
     qué pasa con `useTransferScreen`, `TransferPreview`, etc.) y no cabe en este
     apetite si se pide ahora.
   Mientras no haya respuesta, S3 (abajo) queda en "figuring it out", sin tareas.
2. **Cómo se comunica la asimetría Ingreso/Transferencia** — un ingreso lleva
   categoría (viene de fuera), una transferencia no (se queda dentro). Propongo en S2
   un texto explicativo corto en el lugar donde iría la rejilla ("Este movimiento se
   queda entre tus cuentas, no necesita categoría") en vez de dejar el espacio vacío
   sin explicación — el dueño puede aprobar, cambiar el copy, o pedir otra solución.
3. **Categorías-sitio existentes** (las que el usuario ya se inventó) y la categoría
   sembrada "Credit card": ¿se dejan como están (el usuario deja de usarlas hacia
   adelante) o se abre una apuesta separada para limpiarlas/ocultarlas? Recomiendo
   dejarlas y no tocarlas en esta rebanada — ver Rabbit holes.

## Problema adyacente (fuera de esta pitch, recomendado como apuesta separada)

Se verificó por lectura de código (no se tocó el emulador) que `credit_card` es un
`AccountKind` real y que `isDebtAccountKind` ya lo trata como cuenta de deuda —
`useAccountForm` ya ofrece elegir el signo del saldo inicial (`balanceSign`) solo en
cuentas de deuda, precisamente para este caso. El dato de que 3 de las 4 tarjetas del
dueño tienen el CUPO cargado como saldo inicial positivo (en vez de la deuda actual en
negativo) es un problema de **datos y de guía en el alta de cuenta**, no de este
formulario: aunque esta rebanada funcione perfecto, transferir dinero HACIA una de esas
cuentas mal cargadas la haría "más positiva" — parecería que la transferencia falla
cuando en realidad el dato de partida ya estaba mal. Recomiendo una pitch aparte,
pequeña (Small Batch), para: (a) copy de ayuda en `CreateAccount` cuando
`selectedKind === 'credit_card'` explicando que el saldo inicial es la deuda actual
(negativa), no el cupo: y (b) opcionalmente, un flujo para que el dueño corrija sus 3
cuentas ya mal cargadas. No se shapea aquí para no inflar el apetite de esta rebanada;
queda anotada en `docs/product/roadmap.md`.
