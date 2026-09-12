import i18n from '@i18n';

/**
 * Namespace en los JSON de i18n bajo el que viven las traducciones de
 * cada tipo de fila sembrada — `defaultCategories.<key>` (22 claves, ver
 * `src/data/defaultCategories.ts`) y `defaultAccounts.<key>` (hoy solo
 * `cash`, la "Efectivo" que siembra la migracion 004).
 */
export type SeedNamespace = 'defaultCategories' | 'defaultAccounts';

/**
 * Resuelve el nombre a MOSTRAR de una fila de `categories` o `accounts`.
 *
 * Es el UNICO lugar que decide esto — ver ADR 0004
 * (`docs/architecture/adr/0004-seedkey-y-traduccion-en-vivo-de-la-siembra.md`)
 * para por que vive aqui (la capa de consultas) y no repartido por cada
 * pantalla que hoy pinta `category.name`/`account.name`:
 *
 * - `seedKey === null` — la fila es del usuario (la creo a mano, o
 *   renombro una sembrada — ver `updateCategory`/`updateAccount`). Se
 *   pinta `storedName` tal cual, sin pasar por `i18n.t`.
 * - `seedKey` con valor — la fila sigue siendo la semilla original. Se
 *   resuelve `i18n.t('<namespace>.<seedKey>')` CADA VEZ que se llama,
 *   nunca en el momento de sembrar — asi el nombre sigue el idioma
 *   activo en cada lectura (cada `useFocusEffect`), sin necesitar cache
 *   ni bus de invalidacion que no existen en esta app.
 *
 * `storedName` se recibe siempre, incluso cuando `seedKey` no es `null`,
 * porque es el FALLBACK: si alguna vez una clave desaparece de los JSON
 * de i18n (un rename de key sin actualizar esta tabla, por ejemplo),
 * `i18n.t` devuelve la clave sin traducir en vez de lanzar — ver el
 * riesgo documentado en la ADR — pero el dato guardado en la columna de
 * texto sigue ahi intacto como red de seguridad si se decidiera dejar de
 * usar la clave.
 */
export const resolveSeedName = (
  storedName: string,
  seedKey: string | null,
  namespace: SeedNamespace,
): string => (seedKey ? i18n.t(`${namespace}.${seedKey}`) : storedName);
