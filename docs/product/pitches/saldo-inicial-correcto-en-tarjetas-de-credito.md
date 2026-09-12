# Pitch: Saldo inicial correcto en cuentas de tarjeta de crédito

Estado: shapeado — sin decisiones bloqueantes del dueño (ver "Decisiones que tomé yo"
más abajo); pendiente de feasibility de `senior-software-architect` solo para el diseño
exacto de las dos migraciones nuevas (S2 y S3).

Candidata anotada en `docs/product/roadmap.md` desde la apuesta anterior
("Transferencia como tercer tipo de movimiento"); esta pitch la formaliza con evidencia
verificada contra la base real del dueño.

## Problema

Didier da de alta una tarjeta de crédito nueva. La app ya le advierte —
`accounts.debtBalanceHint`, un texto que dice literalmente "en una tarjeta o un
préstamo, lo que debes se guarda como saldo negativo: así resta de tu patrimonio neto"
— y ya le da un selector para elegir el signo (`balanceSign`, "Debo" / "A favor").
Aun así teclea 1000, o 2000, dos veces con el selector en "A favor" y una vez... no,
las tres veces. Lo que tecleó no es lo que debe: es el CUPO de la tarjeta, el número
redondo que el banco le dio. La app se lo cree, lo suma como si fuera dinero a favor,
y su patrimonio neto sube $4,000 de golpe por tres tarjetas que en realidad le quitan
dinero, no se lo dan.

Esto se verificó contra la base real del dueño (`PRAGMA user_version = 8`, 8 cuentas):

| id | nombre | kind | inicial | movs | saldo | ¿correcta? |
|----|--------|------|--------:|-----:|------:|------------|
| 3 | Cusca Epay | credit_card | -$1,340 | -$200 | -$1,540 | sí |
| 6 | Mi Tarjeta Gasolina Restaurante | credit_card | +$2,000 | -$280 | +$1,720 | **no — cupo cargado como saldo** |
| 7 | Mi Tarjeta Platinum Banco Agrícola | credit_card | +$1,000 | $0 | +$1,000 | **no** |
| 8 | Mi Súper Tarjeta Promerica | credit_card | +$1,000 | $0 | +$1,000 | **no** |
| 2, 4 | Extra Cuscatlán / Préstamo de consumo | loan | -$1,000 c/u | $0 | -$1,000 c/u | sí |

Patrimonio que la app muestra hoy: **+$2,930**. Sin los $4,000 fantasma: **-$1,070**.

Lo que hace que esto no sea "el usuario se equivocó" y sí un defecto de producto:
la cuenta capturada CORRECTAMENTE (id 3) es **anterior** a las tres mal capturadas
(ids 6, 7, 8) — mismo usuario, misma app, el aviso y el selector ya existían para las
tres últimas (ambos entraron en el commit `0b402d5`, 2026-09-02) y aun así fallaron.
La causa es un **default silencioso**: `balanceSign` nace en `'positive'` incluso
cuando `selectedKind` ya es una cuenta de deuda
(`src/hooks/useAccountForm.ts:75-77`) — el usuario tiene que darse cuenta de que debe
tocar un control que la mayoría no toca porque el valor que está tecleando (el cupo)
"se siente" positivo. El texto explica; el default decide. Y no hay ningún lugar en la
app para anotar el cupo real, así que ese dato —que el usuario claramente SÍ quiso
guardar, porque tecleó números redondos de cupo, no de deuda— no tiene dónde ir más que
el campo equivocado.

## Apetite

**Medium Batch — 1 semana**, repartido en 3 rebanadas pequeñas e independientes entre
sí en lo que demuestran, aunque la 3 reutiliza el campo que crea la 2. No es Small
Batch porque hay dos migraciones nuevas y una pantalla de revisión guiada, no solo un
cambio de default. Si la rebanada 3 (la más incierta, ver hill chart) no cierra en la
semana, se recorta su forma —de un asistente paso a paso a una lista plana con un
botón "Corregir" por cuenta, mismo resultado, menos coreografía de UI— no se alarga el
plazo ni se auto-corrige el dato sin preguntar.

## Solución (breadboard, baja fidelidad)

```
Lugar 1: CreateAccount / useAccountForm — cuentas NUEVAS (S1)
  - Al elegir un kind de deuda (credit_card, loan) por primera vez en una cuenta
    nueva, `balanceSign` nace en 'negative', no en 'positive'.
  - El selector sigue existiendo y sigue siendo tocable (caso real: una tarjeta con
    saldo a favor por una devolución) — no se elimina, solo deja de mentir por
    default.

Lugar 2: CreateAccount / AccountsScreen — límite de crédito (S2)
  - Nuevo campo opcional "Límite de crédito", visible solo cuando
    selectedKind === 'credit_card'. Vive junto al campo de saldo inicial, no lo
    reemplaza.
  - En la lista/detalle de cuentas, una tarjeta con creditLimit capturado muestra
    un dato informativo de cuánto lleva usado (p. ej. "86% usado de $2,000") —
    solo lectura, sin bloquear ni avisar de nada todavía.

Lugar 3: pantalla nueva de revisión guiada (S3)
  - Un banner no bloqueante en Cuentas ("Revisa el saldo de N cuentas") aparece
    mientras existan cuentas de deuda con initialBalance positivo sin confirmar.
  - Por cada cuenta señalada: dos botones, "Esto era mi límite de crédito" (mueve
    el valor viejo al campo del Lugar 2 y pide el monto REAL adeudado, sin
    default a cero) o "Este saldo a favor es correcto" (confirma sin cambiar
    nada, para el caso raro real).
  - Al resolver la última cuenta señalada, un diálogo único muestra el cambio de
    patrimonio neto (antes → después) con una frase que explica por qué cambió.
```

## Rabbit holes (ya decididos)

- **No se elimina el selector de signo.** Tentador simplificar quitándolo para
  `credit_card`/`loan`, pero el caso "saldo a favor real en una tarjeta" existe
  (devoluciones) — se corrige el DEFAULT, no se le quita la opción al usuario.
- **No se construyen alertas ni notificaciones de "te acercas a tu límite".** Es la
  extensión natural de tener un `creditLimit`, y es tentadora, pero es un problema de
  UX de avisos (cuándo, cómo, con qué frecuencia) con su propia forma de solución —
  se nombra como apuesta futura en `roadmap.md`, no entra en este apetite.
- **No se generaliza `creditLimit` a `loan`/`receivable`/`bank`/`cash`.** Un préstamo
  tiene capital y plazo, no un "cupo" — es un concepto distinto que merece su propio
  shaping si se pide ("seguimiento de plan de pago"). Esta pitch solo toca
  `credit_card`.
- **No se reutiliza `category_budgets`/`envelopes` para modelar el cupo.** Un
  presupuesto mensual por categoría y un sobre son mecánicas de GASTO planeado; un
  cupo de tarjeta es un TECHO de una cuenta de deuda. Se parecen en que ambos son "un
  número contra el que comparar algo", pero forzarlos al mismo mecanismo acopla dos
  dominios que hoy son independientes por diseño.
- **No se bloquea el uso de la app mientras haya cuentas por revisar.** El banner de
  S3 es persistente pero nunca modal de app completa — el dueño sigue pudiendo anotar
  gastos, ver Balance, todo, mientras decide cuándo revisar sus tarjetas.
- **No se adivina la deuda real de las 3 cuentas mal cargadas.** Cero información
  automática decide esto — es una pregunta que solo el dueño puede responder, y el
  asistente de S3 la hace explícita, sin default a 0 (la id 6 además ya tiene -$280 de
  movimientos reales encima de un saldo inicial que ni siquiera se sabe si es cupo
  completo o parcial).

## No-gos (explícitamente fuera)

- Ninguna alerta o notificación de "cerca de tu límite" (ver rabbit holes).
- Ningún campo de límite de crédito para `loan`, `receivable`, `bank` o `cash`.
- Ninguna corrección automática/silenciosa de las 3 cuentas ya mal cargadas —
  siempre pasa por una respuesta explícita del dueño (Lugar 3).
- Ningún bloqueo del resto de la app mientras la revisión esté pendiente.
- Ningún cambio al mecanismo de transferencias de la apuesta anterior (ya cerrada,
  ver `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`).
- Ninguna auditoría de cuentas `cash`/`bank` — no hay evidencia de que su saldo
  inicial esté mal, y esta pitch no las toca.
- Ninguna edición de una migración ya publicada — todo cambio de esquema es una
  migración nueva (009, 010… número exacto a confirmar con
  `senior-software-architect`), registrada en `src/db/db.ts`.

## Señal de éxito

- Toda cuenta `credit_card` creada DESPUÉS de este cambio nace con `initialBalance`
  negativo salvo que el dueño elija explícitamente "a favor" — verificable en la base:
  `SELECT * FROM accounts WHERE kind='credit_card' AND initialBalance > 0` no debería
  crecer con cuentas nuevas sin una confirmación explícita registrada.
- Las 3 cuentas señaladas en la base actual del dueño (ids 6, 7, 8) terminan con su
  `initialBalance` corregido o confirmado — cero filas de deuda pendientes de
  revisión.
- El patrimonio neto que la app muestra pasa de +$2,930 a la cifra real (que podría
  ser -$1,070 u otra, según lo que el dueño confirme que debe realmente), y el dueño
  vio y cerró el diálogo que explica ese cambio.

## Decisiones que tomé yo (no quedan abiertas para el dueño)

Las cuatro preguntas planteadas al shapear esto tienen respuesta en esta pitch, con su
razonamiento:

**a) ¿Se fuerza el signo por tipo, o se deja el selector?** Se deja el selector — el
caso "saldo a favor real" existe — pero se corrige su DEFAULT para que nazca en
negativo cuando el tipo ya es de deuda (S1). Es el arreglo de una línea que ataca la
causa raíz sin quitarle una opción real a nadie.

**b) ¿Se pide el límite de crédito como campo aparte?** Sí (S2). El usuario ya
demostró que quiere guardar ese dato — tecleó números redondos de cupo tres veces
seguidas. Dárselo un lugar correcto es lo que cierra la puerta por la que se coló el
error. Alcance: campo opcional + indicador de % usado, de solo lectura. Alertas o
avisos de proximidad al límite quedan fuera (rabbit hole nombrado), anotadas como
candidata futura en `roadmap.md`.

**c) ¿Migración automática o pantalla de revisión?** Pantalla de revisión guiada
(S3), nunca automática. No hay forma de saber, sin preguntarle al dueño, si esas tres
tarjetas tienen deuda real hoy — poner 0 es una suposición tan mala como la que causó
el bug. La id 6 además ya arrastra -$280 de movimientos reales, así que ni siquiera
"restaurar a 0" sería neutral. El asistente pide el monto real sin default, con salida
para el caso raro ("este saldo a favor SÍ es correcto").

**d) ¿Se avisa del salto de $4,000?** Sí (cierre de S3): un diálogo único, disparado
al resolver la última cuenta pendiente, que compara el patrimonio neto antes/después
y explica el porqué. No es una notificación push ni un banner permanente — se
muestra una vez y se archiva.

## Pregunta para `senior-software-architect` (no para el dueño)

El diseño exacto de las dos migraciones nuevas es su llamada, no la mía:

1. **S2** necesita una columna nueva y aditiva en `accounts` para el cupo (propongo
   `creditLimit INTEGER` nullable, en centavos, mismo patrón que
   `008_envelopeCompletion.ts` — `ALTER TABLE ADD COLUMN`, sin `CHECK`, sin
   `requiresForeignKeysOff` porque no hay que reconstruir la tabla).
2. **S3** necesita distinguir "cuenta de deuda con saldo positivo sin revisar" de
   "cuenta de deuda con saldo positivo YA confirmada como correcta" — propongo otra
   columna aditiva (`initialBalanceConfirmedAt TEXT`, nullable) en vez de una tabla
   aparte, por el mismo motivo que ya documenta `008` para `completedAt`: la cuenta ya
   es el registro, una tabla aparte se desincroniza.
3. ¿Van en una sola migración o en dos (009 para el cupo, 010 para la confirmación)?
   Propongo dos, para que S2 y S3 puedan cerrarse y verse en el dispositivo del dueño
   de forma independiente, pero es una llamada de arquitectura, no de producto.

Ninguna de las dos toca `finances`, `categories`, `envelopes` ni
`category_budgets` — el radio de acción completo es `accounts`.
