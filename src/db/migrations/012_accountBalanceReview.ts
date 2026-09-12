/**
 * Migration `user_version` 12.
 *
 * `docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md`
 * (S3/T10) y `docs/architecture/adr/0001-migraciones-011-012-saldo-inicial-tarjetas-credito.md`.
 *
 * Anade `accounts.initialBalanceConfirmedAt` (ISO-8601, nullable): marca
 * que el dueno ya REVISO una cuenta de deuda con `initialBalance`
 * positivo y confirmo que ese saldo a favor es correcto (el caso raro
 * real — una devolucion en una tarjeta), no un cupo mal cargado.
 *
 * --- Por que esta columna es ORTOGONAL a `archivedAt` ---
 *
 * Mismo razonamiento que documenta la migracion 008 para `completedAt`
 * vs `archivedAt` en `envelopes`: las dos esconden algo de una vista por
 * defecto, pero significan cosas opuestas. Una cuenta puede estar ACTIVA
 * (`archivedAt IS NULL`) y sin revisar a la vez — de hecho las tres
 * cuentas reales del dueno que motivan esta migracion (ids 6, 7, 8) lo
 * estan. Archivar una cuenta no la confirma, y confirmar una cuenta no
 * la archiva.
 *
 * --- Por que no se reconstruye `accounts` ---
 *
 * `ALTER TABLE ADD COLUMN` sobre una columna nullable, sin `CHECK`, sin
 * `requiresForeignKeysOff` — no hay nada que reconstruir. Mismo patron
 * que la migracion 011 (`creditLimit`), deliberadamente en un archivo
 * aparte: ver la ADR 0001 para por que S2 y S3 son dos migraciones y no
 * una.
 *
 * La query `getAccountsPendingBalanceReview` que lee esta columna vive
 * en `src/db/queries/accountsQueries.ts`, no aqui — esto es solo DDL.
 */
export const migration012Statements: string[] = [
  'ALTER TABLE accounts ADD COLUMN initialBalanceConfirmedAt TEXT',
];

export default migration012Statements;
