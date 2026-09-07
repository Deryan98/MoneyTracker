# S2 — Comunicar la asimetría Ingreso/Transferencia y pulir estados

Pitch: `docs/product/pitches/transferencia-en-formulario-de-movimiento.md`
Hill chart: **subiendo la colina** — el copy exacto y su ubicación son la parte
desconocida; depende de la Decisión 2 del dueño (aprobar/ajustar el texto propuesto).
Depende de S1 completo (necesita el segmento de 3 vías y el selector de destino ya
funcionando).

## Qué se puede demostrar al final

Un usuario que nunca ha usado la app entiende, sin preguntar, por qué Transferencia no
le pide categoría — hay un texto en el lugar donde antes iría la rejilla, no un hueco
vacío sin explicar.

## Alcance

- Texto explicativo corto donde iría `CategoryGrid` cuando el segmento es
  Transferencia (propuesta de copy en la pitch, Decisión 2 — pendiente de aprobación
  del dueño; si la rechaza, esta tarea usa el copy que él dé, no el propuesto).
- Revisar accesibilidad: el `accessibilityLabel` del botón Guardar
  (`form.saveTransactionAccessibilityLabel`) sigue siendo correcto para el caso
  Transferencia, o necesita una variante — a decidir junto con diseño.
- Paridad ES/EN de todas las claves nuevas de S1 y S2 verificada manualmente (no hay
  test automático de paridad de claves en este repo — ver `CLAUDE.md`).

## Fuera de alcance

- Cualquier cambio a la pantalla `Transfer` (es S3, bloqueada).
- Cualquier validador de nombres de categoría (rabbit hole nombrado en la pitch).

## Tareas

### T4 — Estado explicativo de la zona de categoría en modo Transferencia — S2

```
Owner:      fe-senior-react
Slice:      S2 · Asimetría y pulido     Appetite: S     Priority: P2
Depends on: T1, T2, T3 (S1 completo)     Blocks: —
Context:    Decisión 2 de la pitch — un ingreso lleva categoría, una transferencia
            no; el usuario no debe quedarse buscando una categoría que no existe.
Scope:
  - Copy propuesto (a validar con el dueño): "Este movimiento se queda entre tus
    cuentas, no necesita categoría."
  - Se muestra en el mismo lugar donde `CategoryGrid`/el estado vacío de
    categorías se muestran hoy, con el mismo tratamiento tipográfico que
    `form.noCategoriesHint` (mismo patrón visual, no uno nuevo).
Out of scope:
  - Ilustraciones o iconografía nueva.
Acceptance Criteria:
  - Given el segmento en Transferencia,
    When se renderiza el formulario,
    Then NO aparece `CategoryGrid` ni su estado de carga/error, y en su lugar
    aparece el texto explicativo.
  - Given el segmento cambia de Transferencia a Gasto o Ingreso,
    When se re-renderiza,
    Then el texto explicativo desaparece y `CategoryGrid` vuelve a su
    comportamiento actual sin cambios.
Definition of Done: AC cumplidos · copy aprobado por el dueño (o el que él
                    entregue) · tsc/lint/build verdes · verificación de fidelidad
                    con prototype-maker ⇄ senior-uiux-design · verificación en
                    emulador cambiando el idioma del dispositivo (ES/EN) · HANDOFF.
```

### T5 — Paridad de claves i18n y revisión de accesibilidad — S2

```
Owner:      fe-senior-react
Slice:      S2 · Asimetría y pulido     Appetite: S     Priority: P2
Depends on: T1, T2, T3, T4     Blocks: —
Context:    El repo no tiene test automático de paridad ES/EN (CLAUDE.md, sección
            Overview) — se verifica a mano.
Scope:
  - Confirmar que cada clave nueva de `form.*` introducida en S1/S2 existe en
    `src/i18n/locales/es.json` Y `en.json`, con textos naturales (no calcados).
  - Revisar `accessibilityLabel`/`accessibilityRole` de las nuevas pastillas y del
    selector de destino (mismo criterio que ya usa `SegmentedControl`:
    `radiogroup`/`radio` + `accessibilityState.selected`).
Out of scope:
  - Añadir un test automatizado de paridad — sugerido como P3/refactor aparte si
    el dueño lo quiere, no incluido aquí.
Acceptance Criteria:
  - Given `es.json` y `en.json`,
    When se comparan las claves bajo `form.*` añadidas por esta pitch,
    Then el conjunto de claves es idéntico en ambos archivos.
  - Given el lector de accesibilidad activo en el emulador,
    When se navega la pastilla "Transferencia" y el selector de destino,
    Then ambos anuncian rol y estado seleccionado correctamente.
Definition of Done: AC cumplidos · verificación en emulador con TalkBack o
                    `adb shell uiautomator dump` · HANDOFF.
```
