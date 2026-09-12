import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {resolveSeedName} from './seedName';

/**
 * `categories` columns are `id` / `category` / `icon` / `type` (the
 * `type` column was added in migration `user_version` 2 — see
 * `src/db/migrations/002_categoryTypeAndFinanceCleanup.ts`) / `seedKey`
 * (migration 9, see
 * `src/db/migrations/009_seedKeyForCategoriesAndAccounts.ts`). The name
 * column is `category`, not `name`, so it does not structurally match
 * the global `ICategory` interface (`{id, icon, name, type, seedKey}`)
 * declared in `src/interfaces/common.d.ts` as-is.
 *
 * Every read below goes through `mapRowToCategory`, which does two
 * things at once: aliases `category` to `name` (no separate row type,
 * no mapping step at the call site — `getCategories` returns
 * `ICategory[]` directly) AND resolves `name` through
 * `resolveSeedName` — see that function's doc and ADR 0004
 * (`docs/architecture/adr/0004-seedkey-y-traduccion-en-vivo-de-la-siembra.md`)
 * for why this is the ONE place that decision is made, instead of every
 * screen/mapper that reads `category.name` learning to look at
 * `seedKey` itself.
 */
export const CATEGORY_TYPES = ['income', 'expense'] as const;

const mapRowToCategory = (row: any): ICategory => ({
  id: row.id,
  name: resolveSeedName(row.name, row.seedKey ?? null, 'defaultCategories'),
  icon: row.icon,
  type: row.type,
  seedKey: row.seedKey ?? null,
});

const isValidCategoryType = (type: string): type is ICategory['type'] =>
  (CATEGORY_TYPES as readonly string[]).includes(type);

export const insertCategory = async (
  db: SQLiteDatabase,
  category: string,
  icon: string,
  type: ICategory['type'],
) => {
  if (!isValidCategoryType(type)) {
    // Defense in depth: the DB column has no CHECK constraint (see the
    // migration file for why), so this is the only thing rejecting an
    // invalid value before it reaches storage.
    throw new Error(`Invalid category type: ${type}`);
  }
  const insertQuery =
    'INSERT INTO categories (category, icon, type) VALUES (?, ?, ?)';
  return db.executeSql(insertQuery, [category, icon, type]);
};

/**
 * `{activeOnly: true}` filtra `retiredAt IS NULL` — `retiredAt`
 * (migración 10, ver
 * `src/db/migrations/010_retireLegacyCategoriesAndSeedKeys.ts` y ADR
 * 0005, que absorbió y reemplazó el plan de la ADR 0002) marca una
 * categoría que el sistema decidió dejar de OFRECER para selecciones
 * nuevas — no un archivado del usuario, no un borrado.
 *
 * Default `false` a propósito — cero cambio de comportamiento para
 * cualquier llamador existente que no lo pase explícitamente. Solo dos
 * call sites deben pasar `true`, por contrato (ver la tabla de la ADR
 * 0002/0005): `useFormScreen.loadCategories` (grid de categoría al
 * crear un movimiento nuevo — con la excepción de que un movimiento en
 * edición debe seguir mostrando su categoría aunque esté retirada, ver
 * ese hook) y `useBudgetsScreen` (elegir categoría para un límite
 * mensual nuevo). `AllMovementsScreen` no la pasa: un movimiento viejo
 * tiene que seguir mostrando bajo qué categoría se registró.
 *
 * `hideRetiredWithoutMovements` es distinta y NO es un alias de la
 * anterior. Nació de una observación del dueño mirando la pantalla de
 * Categorías del menú lateral: las siete filas que retira la migración
 * 10 seguían ahí, llenando la lista, sin ofrecerse ya al crear nada y
 * sin ninguna marca que explicase por qué. Eran estorbo puro.
 *
 * Pero ocultarlas a secas tiene un coste: si una retirada CONSERVA
 * movimientos, esa pantalla es la vía para llegar a ellos, y sin ella
 * el historial queda sin ruta desde aquí. Por eso el filtro no es "está
 * retirada" sino "está retirada Y ya no guarda nada": una fila retirada
 * con movimientos sigue visible, porque todavía tiene contenido que
 * alguien puede necesitar. Es un `EXISTS` en la misma consulta, no una
 * consulta por categoría — este proyecto ya tiene un problema de N+1
 * documentado en `useAnalysisScreen` y no conviene sembrar otro.
 */
export type GetCategoriesOptions = {
  activeOnly?: boolean;
  hideRetiredWithoutMovements?: boolean;
};

/** Predicado compartido por las dos consultas de abajo. */
const buildRetiredFilter = (options?: GetCategoriesOptions): string => {
  if (options?.activeOnly) {
    return 'retiredAt IS NULL';
  }
  if (options?.hideRetiredWithoutMovements) {
    return `(retiredAt IS NULL OR EXISTS (
        SELECT 1 FROM finances WHERE finances.idCategory = categories.id
      ))`;
  }
  return '';
};

export const getCategories = async (
  db: SQLiteDatabase,
  options?: GetCategoriesOptions,
): Promise<ICategory[]> => {
  const categories: ICategory[] = [];
  const filter = buildRetiredFilter(options);
  const query =
    'SELECT id, category AS name, icon, type, seedKey FROM categories' +
    (filter ? ` WHERE ${filter}` : '');
  const [resultSet] = await db.executeSql(query);

  for (let index = 0; index < resultSet.rows.length; index++) {
    categories.push(mapRowToCategory(resultSet.rows.item(index)));
  }
  return categories;
};

/**
 * Same as `getCategories` filtered to a single type. Backs the
 * Expenses/Incomes tabs, which each only ever need one type's
 * categories — uses the `idx_categories_type` index added alongside
 * `categories.type` in migration 2. See `getCategories` for the
 * `activeOnly` contract — the same two call sites, no more.
 */
export const getCategoriesByType = async (
  db: SQLiteDatabase,
  type: ICategory['type'],
  options?: GetCategoriesOptions,
): Promise<ICategory[]> => {
  const categories: ICategory[] = [];
  const filter = buildRetiredFilter(options);
  const query =
    'SELECT id, category AS name, icon, type, seedKey FROM categories WHERE type = ?' +
    (filter ? ` AND ${filter}` : '');
  const [resultSet] = await db.executeSql(query, [type]);

  for (let index = 0; index < resultSet.rows.length; index++) {
    categories.push(mapRowToCategory(resultSet.rows.item(index)));
  }
  return categories;
};

/**
 * Una categoria por id, o `null` si no existe. Alimenta el modo edicion
 * del formulario, que necesita precargar nombre, icono y tipo.
 */
export const getCategoryById = async (
  db: SQLiteDatabase,
  id: number,
): Promise<ICategory | null> => {
  const [resultSet] = await db.executeSql(
    'SELECT id, category AS name, icon, type, seedKey FROM categories WHERE id = ?',
    [id],
  );
  return resultSet.rows.length === 0 ? null : mapRowToCategory(resultSet.rows.item(0));
};

/**
 * Cuantas filas dependen de una categoria. La pantalla lo usa para
 * avisar con numeros reales antes de borrar, en vez de con un "puede que
 * afecte a algo".
 */
export const getCategoryUsage = async (
  db: SQLiteDatabase,
  id: number,
): Promise<{movements: number; budgets: number}> => {
  const [finances] = await db.executeSql(
    'SELECT COUNT(*) AS total FROM finances WHERE idCategory = ?',
    [id],
  );
  const [budgets] = await db.executeSql(
    'SELECT COUNT(*) AS total FROM category_budgets WHERE idCategory = ?',
    [id],
  );
  return {
    movements: finances.rows.item(0).total,
    budgets: budgets.rows.item(0).total,
  };
};

/**
 * Renombra una categoria y/o le cambia el icono o el tipo.
 *
 * CAMBIAR EL TIPO esta prohibido si la categoria ya tiene movimientos, y
 * no por prudencia: el signo de un movimiento se guarda en la propia
 * fila (`finances.amount`, negativo para gasto desde la migracion 4), no
 * se deduce del tipo de su categoria. Cambiar el tipo no reescribe esos
 * signos, asi que un gasto de -123 pasaria a aparecer bajo Ingresos
 * SIENDO negativo: la pestana diria "ingreso" y la cifra diria lo
 * contrario. Reescribir los signos tampoco es la salida —falsearia el
 * historial— asi que la operacion se rechaza y la pantalla propone crear
 * otra categoria.
 *
 * --- `seedKey` se borra SOLO si el nombre cambia DE VERDAD ---
 *
 * Guardar (sin tocar el nombre) una categoria sembrada NO debe romper su
 * vinculo con la traduccion en vivo — ver ADR 0004. El riesgo concreto:
 * el formulario precarga el campo con el nombre YA RESUELTO (`ICategory.
 * name`, ver `mapRowToCategory`/`resolveSeedName`), que puede ser
 * distinto de lo que hay crudo en la columna `category` si la fila se
 * sembro en un idioma y el usuario abre el formulario habiendo cambiado
 * de idioma despues. Comparar el nombre nuevo contra la columna CRUDA
 * marcaria eso como "renombre" aunque el usuario no haya tocado el
 * campo. Por eso la comparacion es contra `resolveSeedName(currentRow.
 * category, currentRow.seedKey, ...)` — el mismo valor resuelto que el
 * formulario mostro al cargar — nunca contra el texto crudo.
 *
 * Si son iguales, `seedKey` se conserva tal cual (columna `CASE WHEN`
 * evaluada dentro del propio `UPDATE`, contra el valor ANTES de la
 * escritura — SQLite calcula el lado derecho de cada asignacion con la
 * fila vieja); si son distintos, se pone a `NULL`: la fila pasa a ser
 * del usuario, exactamente como si la hubiera creado el mismo.
 *
 * Lanza:
 * - `Error('Invalid category type: ...')` con un tipo fuera de
 *   `CATEGORY_TYPES`.
 * - `Error('Cannot change the type of a category with movements')` en el
 *   caso de arriba.
 * - `Error('Category <id> does not exist')` si el id no resuelve a
 *   ninguna fila.
 */
export const updateCategory = async (
  db: SQLiteDatabase,
  id: number,
  {name, icon, type}: {name: string; icon: string; type: ICategory['type']},
): Promise<void> => {
  if (!isValidCategoryType(type)) {
    throw new Error(`Invalid category type: ${type}`);
  }

  const [current] = await db.executeSql(
    'SELECT type, category, seedKey FROM categories WHERE id = ?',
    [id],
  );
  if (current.rows.length === 0) {
    throw new Error(`Category ${id} does not exist`);
  }
  const currentRow = current.rows.item(0);
  if (currentRow.type !== type) {
    const {movements} = await getCategoryUsage(db, id);
    if (movements > 0) {
      throw new Error('Cannot change the type of a category with movements');
    }
  }

  const currentDisplayName = resolveSeedName(
    currentRow.category,
    currentRow.seedKey ?? null,
    'defaultCategories',
  );
  const isEffectiveRename = name !== currentDisplayName;

  await db.executeSql(
    `UPDATE categories
        SET category = ?, icon = ?, type = ?,
            seedKey = CASE WHEN ? THEN NULL ELSE seedKey END
      WHERE id = ?`,
    [name, icon, type, isEffectiveRename ? 1 : 0, id],
  );
};

/**
 * Borra una categoria y desengancha lo que dependia de ella.
 *
 * Tres escrituras que van SI O SI juntas, en una transaccion:
 * 1. `finances.idCategory = NULL` en sus movimientos. NO se borran: el
 *    dinero se movio de verdad y el historial y los saldos tienen que
 *    seguir cuadrando. La columna es nullable desde la migracion 4
 *    —precisamente para las transferencias, que no tienen categoria— asi
 *    que esto no fuerza nada en el esquema. `mapFinanceRowToTransactItem`
 *    pinta esos movimientos como "Sin categoria".
 * 2. Borra sus limites mensuales. Un limite sin categoria no significa
 *    nada y su `idCategory` es NOT NULL, asi que no hay opcion de
 *    desenganchar: o se borra o bloquea el borrado de la categoria.
 * 3. Borra la categoria.
 *
 * Fuera de una transaccion, una interrupcion entre la 1 y la 3 dejaria
 * movimientos huerfanos de una categoria que sigue existiendo, o —peor—
 * un `DELETE` de la categoria rechazado por la clave ajena tras haber
 * borrado ya sus limites. El callback es SINCRONO a proposito, por el
 * motivo que documenta `insertTransfer`.
 *
 * Devuelve `false` si la categoria ya no existia. No lanza en ese caso:
 * es el estado que se buscaba.
 */
export const deleteCategory = async (
  db: SQLiteDatabase,
  id: number,
): Promise<boolean> => {
  const [existing] = await db.executeSql(
    'SELECT 1 FROM categories WHERE id = ?',
    [id],
  );
  if (existing.rows.length === 0) {
    return false;
  }

  await db.transaction(tx => {
    tx.executeSql('UPDATE finances SET idCategory = NULL WHERE idCategory = ?', [id]);
    tx.executeSql('DELETE FROM category_budgets WHERE idCategory = ?', [id]);
    tx.executeSql('DELETE FROM categories WHERE id = ?', [id]);
  });
  return true;
};
