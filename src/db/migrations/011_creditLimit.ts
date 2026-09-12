/**
 * Migration `user_version` 11.
 *
 * `docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md`
 * (S2/T7) y `docs/architecture/adr/0001-migraciones-011-012-saldo-inicial-tarjetas-credito.md`.
 *
 * Anade `accounts.creditLimit` (cents, nullable): el CUPO de una tarjeta
 * de credito, capturado como un dato aparte del saldo inicial. Antes de
 * este cambio no existia ningun campo para el cupo, asi que el dueno lo
 * tecleaba en el unico campo numerico disponible (`initialBalance`) — la
 * causa raiz verificada del bug de patrimonio de +$4,000.
 *
 * --- Por que nullable, y por que sin `CHECK` que la ate a `credit_card` ---
 *
 * `NULL` significa "cupo no capturado todavia", no "cupo cero" — un
 * usuario que no anota su limite no tiene por que ver un 0% de uso
 * inventado. Igual que `envelopes.completedAt` (migracion 008): la
 * columna es ortogonal, nunca obligatoria, y una fila sin ella sigue
 * siendo una cuenta perfectamente valida.
 *
 * No lleva un `CHECK (kind != 'credit_card' OR creditLimit IS NOT NULL)`
 * ni el inverso: SQLite no puede expresar "esta columna solo aplica
 * cuando `kind` vale X" sin acoplar dos columnas en un CHECK cruzado, y
 * el propio pitch solo pide el campo para `credit_card` — la regla vive
 * en la capa de aplicacion (`useAccountForm`, que solo la muestra y
 * la envia cuando `selectedKind === 'credit_card'`), no en el esquema.
 * Un `loan`/`bank`/`cash`/`receivable` con `creditLimit` no NULL nunca
 * deberia ocurrir por como escribe la UI, pero si ocurriera no violaria
 * ninguna invariante de integridad real.
 *
 * Un unico `ALTER TABLE ADD COLUMN`, sin `requiresForeignKeysOff` (no
 * reconstruye la tabla) y sin indice nuevo (ninguna consulta filtra
 * todavia por `creditLimit`) — mismo patron que `008_envelopeCompletion.ts`.
 */
export const migration011Statements: string[] = [
  'ALTER TABLE accounts ADD COLUMN creditLimit INTEGER',
];

export default migration011Statements;
