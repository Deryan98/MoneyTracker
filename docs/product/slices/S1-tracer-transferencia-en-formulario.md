# S1 — Tracer bullet: guardar una transferencia desde "Nuevo movimiento"

Pitch: `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`
Hill chart: **bajando la colina** salvo el punto de diseño marcado abajo — el mecanismo
de escritura (`insertTransfer`) ya existe y está probado; lo nuevo es puramente de UI y
ramificación de hook.

## Qué se puede demostrar al final

Desde el FAB "+", el usuario elige Transferencia, ve un selector de cuenta destino en
vez de la rejilla de categorías, guarda, y el movimiento aparece como dos patas
(`transferGroupId` compartido) visibles en Balance en ambas cuentas — igual que si lo
hubiera hecho desde la pantalla `Transfer` existente, pero desde el camino que el
usuario realmente usa.

## Alcance

- `TypeSegment` gana una tercera opción `'transfer'` (`layout="even"`, 3 pastillas en
  una fila — ya soportado por `SegmentedControl`, sin cambios ahí).
- Nuevo componente `DestinationAccountField` (o nombre que decida FE/diseño):
  mismo patrón visual que el `AccountSelector` ya embebido en `AmountCard` (pastillas
  horizontales), pero:
  - excluye la cuenta actualmente elegida como ORIGEN de su propia lista,
  - si el origen cambia y coincide con el destino elegido, el destino se re-resuelve a
    otra cuenta (mismo comportamiento que `accountsForPicker`/`load` en
    `useTransferScreen` — se reutiliza el criterio, no necesariamente el código).
- `useFormScreen`: `selectedType` acepta `'transfer'`; cuando está activo:
  - `selectedCategory` se ignora (no se exige, no se muestra error de categoría),
  - se añade estado de cuenta destino (`selectedDestinationAccount` o equivalente),
  - `saveTransaction` llama a `insertTransfer(db, {idAccountFrom: selectedAccount.id,
    idAccountTo: selectedDestinationAccount.id, amount})` en vez de `insertFinance`.
- Copys nuevos en `es.json` y `en.json` bajo `form.*` (ver Contrato de i18n abajo).
- Regla "no puedes transferir a la misma cuenta": el selector de destino nunca la
  ofrece como opción (igual que hace hoy `useTransferScreen`), no se depende de un
  mensaje de error tras guardar.
- Caso "menos de 2 cuentas activas": Transferencia queda seleccionable en el segmento,
  pero el guardado se deshabilita con un mensaje explicando que hace falta una segunda
  cuenta — mismo espíritu que ya tiene `useTransferScreen` cuando `toAccountId` no
  resuelve.

## Fuera de alcance (de esta rebanada, no de la pitch entera)

- El texto explicativo de la asimetría Ingreso/Transferencia (empty-state de la zona de
  categoría) — es S2.
- Tocar el botón "Transferir" de `AccountsScreen` o la ruta `Transfer` — es S3, y está
  bloqueada por la Decisión 1 del dueño.
- Editar una transferencia ya guardada desde este formulario — sigue rechazada tal cual
  hoy (`form.transferNotEditable`); esta rebanada no cambia ese camino, solo verifica
  que sigue funcionando (AC de regresión abajo).

## Contrato de i18n (mismas claves en `es.json` y `en.json`, bajo `form.*`)

- `segmentTransfer` — etiqueta de la tercera pastilla.
- `transferDestinationLabel` — título sobre el selector de cuenta destino.
- `chooseDestinationAccountFirst` — error si se intenta guardar sin destino elegido.
- `needsSecondAccountForTransfer` — mensaje cuando hay menos de 2 cuentas activas.
- Reutilizar (no duplicar) `transfer.invalidAmount`/lo ya existente donde aplique — el
  monto no cambia de validación por ser transferencia.

## Tareas

### T1 — TypeSegment de 3 opciones — S1

```
Owner:      fe-senior-react
Slice:      S1 · Tracer transferencia en formulario     Appetite: S     Priority: P1
Depends on: —     Blocks: T2, T3
Context:    docs/product/pitches/transferencia-en-formulario-de-movimiento.md —
            el selector Gasto/Ingreso pasa a 3 vías.
Scope:
  - `TypeSegment` acepta y expone `'expense' | 'income' | 'transfer'`.
  - Usa `layout="even"` de `SegmentedControl` (ya existe, sin tocar ese componente).
  - Color de la pastilla "Transferencia" activa: NO reutilizar rojo/verde (ya
    significan gasto/ingreso en toda la app) — coordinar con diseño (ver T-diseño)
    un tercer tono; si no hay tiempo, usar `colors[accent][1]` (el default del
    átomo) como placeholder documentado.
Out of scope:
  - Cambios a `SegmentedControl` en sí.
Acceptance Criteria:
  - Given el formulario "Nuevo movimiento" recién abierto,
    When se renderiza,
    Then se ven 3 pastillas: Gasto, Ingreso, Transferencia, en una sola fila.
  - Given el segmento en "Gasto" o "Ingreso",
    When el usuario pulsa "Transferencia",
    Then `onChange('transfer')` se dispara exactamente una vez.
Definition of Done: AC cumplidos · tsc/lint/build verdes · sin secretos ·
                    verificación de fidelidad con prototype-maker ⇄ senior-uiux-design
                    (el prototipo original nunca dibujó 3 vías, así que esto es
                    EXTENSIÓN del lenguaje visual, no un delta a corregir) · HANDOFF.
```

### T2 — Selector de cuenta destino — S1

```
Owner:      fe-senior-react
Slice:      S1 · Tracer transferencia en formulario     Appetite: M     Priority: P1
Depends on: T1     Blocks: T3
Context:    mismo pitch. Sustituye la rejilla de categorías cuando el segmento es
            Transferencia.
Scope:
  - Nuevo componente presentacional (pastillas horizontales, mismo patrón que
    `AccountSelector` de `AmountCard`), recibe `accounts`, `excludeAccountId`,
    `selectedAccount`, `onSelect`, `status`, `errorMessage` — mismos 4 estados de
    ciclo de vida que el resto del formulario (loading/success/error/vacío).
  - Estado "vacío": menos de 2 cuentas activas → mensaje
    `form.needsSecondAccountForTransfer`, sin pastillas.
Out of scope:
  - Modal/hoja de selección tipo `AccountPickerModal` de `Transfer` — las pastillas
    inline ya cubren el caso de pocas cuentas (mismo criterio ya aceptado en
    `AccountSelector`'s doc comment).
Acceptance Criteria:
  - Given el segmento en Transferencia y 3 cuentas activas,
    When se renderiza el selector de destino,
    Then se muestran exactamente 2 pastillas (todas menos la cuenta origen
    actualmente elegida).
  - Given el selector de destino con una cuenta ya elegida,
    When el usuario cambia la cuenta ORIGEN a la misma que el destino actual,
    Then el destino se re-resuelve automáticamente a otra cuenta distinta del
    nuevo origen (nunca quedan origen y destino iguales en pantalla).
  - Given solo 1 cuenta activa en el dispositivo,
    When el segmento pasa a Transferencia,
    Then se muestra `form.needsSecondAccountForTransfer` y el botón Guardar queda
    deshabilitado.
Definition of Done: igual que T1 + verificación en emulador Android (pull de
                    `moneytracker.db` o captura de pantalla) de los 3 estados.
```

### T3 — Ramificar el guardado a `insertTransfer` — S1

```
Owner:      fe-senior-react
Slice:      S1 · Tracer transferencia en formulario     Appetite: M     Priority: P1
Depends on: T1, T2     Blocks: —
Context:    `useFormScreen.saveTransaction` hoy solo conoce `insertFinance`/
            `updateFinance`. `insertTransfer` ya existe en
            `src/db/queries/transfersQueries.ts` y es atómico — NO se toca esa
            función ni el esquema.
Scope:
  - Nuevo estado en `useFormScreen`: cuenta destino seleccionada.
  - `saveTransaction`: si `selectedType === 'transfer'`, valida
    (destino elegido, destino ≠ origen, monto válido — reutilizar
    `parseAmountToCents`, NUNCA `parseFloat`) y llama a `insertTransfer` en vez de
    `insertFinance`; si no, comportamiento sin cambios.
  - Tras guardar una transferencia con éxito, misma navegación que hoy
    (`navigation.getParent()?.navigate('Resumen')`) — el movimiento se ve en Balance
    en ambas cuentas por el mismo mecanismo de refresco por foco que ya documenta
    `CLAUDE.md` (no hay bus de invalidación; esto no lo cambia).
Out of scope:
  - Modo edición de una pata de transferencia — sigue rechazado
    (`form.transferNotEditable`), sin tocar ese camino.
Acceptance Criteria:
  - Given Transferencia con origen A, destino B y monto $50 válidos,
    When se pulsa Guardar,
    Then se crean exactamente 2 filas en `finances` con el mismo
    `transferGroupId`, `idCategory NULL`, montos -5000/+5000 (centavos), y NINGUNA
    fila queda huérfana si la operación se interrumpe (mismo contrato que
    `insertTransfer` ya documenta y prueba).
  - Given Transferencia sin cuenta destino elegida,
    When se pulsa Guardar,
    Then se muestra `form.chooseDestinationAccountFirst` y NO se llama a
    `insertTransfer`.
  - Given un movimiento de tipo Gasto o Ingreso (no transferencia),
    When se guarda,
    Then el comportamiento es IDÉNTICO al actual — regresión: sigue llamando
    `insertFinance`/`updateFinance`, con la misma navegación y los mismos mensajes.
  - Given una fila existente con `transferGroupId !== null`,
    When se abre en modo edición (`EditTransaction`),
    Then se sigue mostrando `form.transferNotEditable` exactamente como hoy —
    regresión, sin cambios de este slice.
Definition of Done: AC cumplidos · tsc/lint/build verdes · verificación en emulador
                    Android leyendo `moneytracker.db` (`PRAGMA user_version;
                    SELECT * FROM finances ORDER BY id DESC LIMIT 2;`) tras guardar
                    una transferencia real · sin secretos · HANDOFF.
```
