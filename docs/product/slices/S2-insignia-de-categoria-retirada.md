# S2 — Insignia "Retirada" en administración de categorías

Pitch: `docs/product/pitches/depurar-categorias-heredadas-duplicadas.md`
Hill chart: **bajando la colina** — es una marca visual sobre un dato que S1 ya
produce (`retiredAt`), sin lógica nueva de negocio.
Depende de S1 (necesita que `retiredAt` exista y tenga filas marcadas) pero es
recortable primero si el apetite Small Batch se aprieta — ver pitch.

## Qué se puede demostrar al final

Al abrir `CategoriesAdminScreen`, cualquier categoría con `retiredAt` no nulo
(`House`, `Food`, `Bills`, `Children`, `Rent`, `Interests`(ingreso), y `Loan`/`Credit
card` si la ADR 0002 se fusionó en la misma migración) muestra una insignia
"Retirada" junto a su nombre. El resto de la pantalla (edición, borrado, conteo de
uso) sigue funcionando exactamente igual que hoy.

## Alcance

- `getCategories`/`getCategoriesByType` usadas por `useCategoriesScreen`/
  `CategoriesAdminScreen` NO cambian su llamada (siguen sin `activeOnly`, ya
  devuelven `retiredAt` si `ICategory` lo expone).
- `ICategory` (`src/interfaces/common.d.ts`) gana `retiredAt: string | null` si no lo
  tiene ya desde la implementación de la ADR 0002.
- `CategoriesAdminScreen`/su mapper: nueva pieza visual pequeña (badge/etiqueta,
  patrón a validar con `senior-uiux-design` — reutilizar el mismo lenguaje visual que
  ya use la app para estados secundarios, no inventar un componente nuevo si ya existe
  uno equivalente).
- Copy nuevo, 1 clave, paridad ES/EN.

## Fuera de alcance

- Cualquier acción nueva sobre una categoría retirada (no se agrega un botón
  "reactivar" — no fue pedido, y la ADR 0002 no lo contempla).
- Cambios a `getCategoryUsage` o al flujo de borrado — siguen igual.
- Cualquier pantalla que no sea `CategoriesAdminScreen`.

## Contrato de i18n (mismas claves en `es.json` y `en.json`)

- `categories.retiredBadge` — texto de la insignia ("Retirada" / "Retired").

## Tareas

### T17 — Insignia "Retirada" en `CategoriesAdminScreen` — S2

```
Owner:      fe-senior-react
Slice:      S2 · Insignia de categoría retirada     Appetite: S     Priority: P2
Depends on: T13 (necesita `retiredAt` poblado), T14 (necesita `ICategory.retiredAt`
            expuesto si no lo expone ya la ADR 0002)     Blocks: —
Context:    cierra `docs/architecture/tech-debt.md` → "categories.retiredAt sin señal
            visual en CategoriesAdminScreen", abierto desde la ADR 0002 y sin dueño
            hasta ahora.
Scope:
  - Insignia visual junto al nombre de cualquier categoría con `retiredAt` no nulo,
    en la lista de `CategoriesAdminScreen`.
  - Copy `categories.retiredBadge`, 1 clave, ES/EN.
Out of scope:
  - Cualquier botón de acción nuevo sobre la fila retirada.
  - Cambios a `useCategoriesScreen`/pantallas de historial (no llevan esta
    insignia, no es su propósito).
Acceptance Criteria:
  - Given `CategoriesAdminScreen` con al menos una categoría retirada (tras T13),
    When se renderiza la lista,
    Then esa fila muestra la insignia "Retirada"/"Retired" según el idioma activo,
    y las filas sin `retiredAt` no la muestran.
  - Given una categoría retirada con movimientos existentes,
    When se intenta borrarla desde esta pantalla,
    Then el comportamiento de `getCategoryUsage` es idéntico al de antes de esta
    tarea (sin cambio de lógica de borrado).
Definition of Done: AC cumplidos · tsc/lint/build verdes · sin secretos · paridad
                    i18n ES/EN verificada · verificación de fidelidad con
                    prototype-maker ⇄ senior-uiux-design · verificado en emulador
                    Android · HANDOFF.
```
