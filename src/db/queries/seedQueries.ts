import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {DEFAULT_CATEGORIES} from '@data/defaultCategories';
import i18n from '@i18n';

/**
 * Siembra de categorias por defecto, UNA sola vez por instalacion.
 *
 * No vive en una migracion a proposito: los nombres tienen que salir en
 * el idioma del usuario, y las sentencias de una migracion son SQL fijo.
 * La unica siembra que se hizo asi —la 003, once categorias en ingles—
 * termino borrada a mano y rehecha en espanol, que es justamente el
 * trabajo que esto quiere ahorrar.
 *
 * Debe llamarse DESPUES de `hydrateStoredLanguage()`: si se llama antes,
 * i18next todavia esta en el idioma del dispositivo y se sembraria en
 * uno distinto al que el usuario eligio la vez anterior.
 *
 * Desde la migracion 9 (`categories.seedKey`, ver ADR 0004), esta
 * funcion tambien escribe la CLAVE de cada fila que siembra — no solo su
 * nombre ya resuelto — para que `resolveSeedName`
 * (`src/db/queries/seedName.ts`) pueda traducirla en vivo en cada
 * lectura futura, en vez de quedar fija en el idioma de este momento. El
 * nombre resuelto se guarda IGUAL que antes, como fallback si la clave
 * alguna vez desapareciera de los JSON de i18n.
 */

/** Clave en `app_meta` (ver la migracion 007). */
const SEED_FLAG_KEY = 'defaultCategoriesSeeded';

/**
 * El `Interests` en ingles que sembraba la migracion 006 para los
 * intereses de prestamos y tarjetas. Se RENOMBRA en vez de anadir al
 * lado la categoria traducida: renombrar conserva el `id`, y con el
 * todos los movimientos y limites mensuales que ya lo apuntan. Insertar
 * una nueva dejaria dos categorias para lo mismo y los movimientos
 * viejos colgando de la que esta en ingles.
 *
 * Se compara tambien el `type`: existe (o existio) un `Interests` de
 * INGRESO sembrado por la 003, que es otra cosa —lo que uno COBRA de
 * intereses— y no debe tocarse aqui.
 */
const LEGACY_INTERESTS_NAME = 'Interests';
const LEGACY_INTERESTS_TYPE = 'expense';
/** La entrada de `DEFAULT_CATEGORIES` que sustituye a ese nombre. */
const FEES_INTEREST_KEY = 'feesInterest';

export interface ISeedDefaultCategoriesResult {
  /** `false` si ya se habia sembrado antes y no se hizo nada. */
  ran: boolean;
  /** Cuantas categorias se insertaron de verdad. */
  inserted: number;
  /** `true` si se renombro el `Interests` heredado. */
  renamedLegacyInterests: boolean;
}

const countCategories = async (db: SQLiteDatabase): Promise<number> => {
  const [result] = await db.executeSql('SELECT COUNT(*) AS total FROM categories;');
  return result.rows.item(0).total as number;
};

export const seedDefaultCategoriesOnce = async (
  db: SQLiteDatabase,
): Promise<ISeedDefaultCategoriesResult> => {
  const [flag] = await db.executeSql('SELECT value FROM app_meta WHERE key = ?;', [
    SEED_FLAG_KEY,
  ]);
  if (flag.rows.length > 0) {
    return {ran: false, inserted: 0, renamedLegacyInterests: false};
  }

  const [legacy] = await db.executeSql(
    'SELECT id FROM categories WHERE category = ? AND type = ?;',
    [LEGACY_INTERESTS_NAME, LEGACY_INTERESTS_TYPE],
  );
  const hasLegacyInterests = legacy.rows.length > 0;

  const before = await countCategories(db);

  // Los nombres se resuelven ANTES de abrir la transaccion: dentro, el
  // callback tiene que ser sincrono de principio a fin (misma regla que
  // documenta `transfersQueries.ts`), y aunque `i18n.t` lo es, dejarlo
  // fuera mantiene el bloque transaccional reducido a SQL.
  const rows = DEFAULT_CATEGORIES.map(category => ({
    name: i18n.t(`defaultCategories.${category.key}`),
    icon: category.icon,
    type: category.type,
    seedKey: category.key,
  }));
  const feesInterestName = i18n.t(`defaultCategories.${FEES_INTEREST_KEY}`);

  await db.transaction(tx => {
    // El renombrado va PRIMERO: asi, cuando le toque el turno a
    // `feesInterest` mas abajo, su `WHERE NOT EXISTS` ya encuentra la
    // fila renombrada y no inserta una segunda. Tambien se le pone
    // `seedKey` aqui: a partir de este momento es una fila sembrada mas,
    // que debe seguir el idioma activo en cada lectura igual que
    // cualquiera de las 22 — no solo un nombre traducido una vez.
    if (hasLegacyInterests) {
      tx.executeSql(
        'UPDATE categories SET category = ?, icon = ?, seedKey = ? WHERE category = ? AND type = ?;',
        [feesInterestName, 'percent', FEES_INTEREST_KEY, LEGACY_INTERESTS_NAME, LEGACY_INTERESTS_TYPE],
      );
    }

    // `categories` NO tiene `UNIQUE (category, type)` —comprobado en el
    // esquema real—, asi que el guardia contra duplicados va aqui. Sin
    // el, una instalacion que ya tenga "Combustible" acabaria con dos.
    rows.forEach(row => {
      tx.executeSql(
        `INSERT INTO categories (category, icon, type, seedKey)
           SELECT ?, ?, ?, ?
           WHERE NOT EXISTS (
             SELECT 1 FROM categories WHERE category = ? AND type = ?
           );`,
        [row.name, row.icon, row.type, row.seedKey, row.name, row.type],
      );
    });

    tx.executeSql('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?);', [
      SEED_FLAG_KEY,
      new Date().toISOString(),
    ]);
  });

  const after = await countCategories(db);
  return {
    ran: true,
    inserted: after - before,
    renamedLegacyInterests: hasLegacyInterests,
  };
};
