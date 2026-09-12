# 0001 — Migraciones 010 y 011: cupo y confirmación en `accounts`

Status: accepted
Date: 2026-09-11

> **Renumerada (2026-09-11).** Esta ADR y sus migraciones se numeraron
> originalmente 009/010. El encargo de traducción en vivo de la siembra
> (`seedKey`, ver ADR 0004) tomó el 009 en su lugar — es trabajo YA
> implementado, mientras que el de esta ADR (cupo/confirmación de tarjetas)
> seguía sin una sola línea de código escrita — así que este frente se corrió
> a 010/011 y el de la ADR 0002 a 012, para no dejar un hueco en
> `src/db/db.ts`'s `migrations`. El resto de este documento ya refleja la
> numeración nueva.

## Contexto

`docs/product/pitches/saldo-inicial-correcto-en-tarjetas-de-credito.md` (S2/T7, S3/T10)
pide dos columnas nuevas en `accounts`:

- `creditLimit INTEGER` nullable, centavos — el cupo de la tarjeta.
- `initialBalanceConfirmedAt TEXT` nullable — marca de que el dueño ya revisó esa
  cuenta y su saldo positivo es correcto (no un cupo mal cargado).

`PRAGMA user_version` real del dueño = 8. Dos frentes más (siembra traducida y retiro
de categorías `Loan`/`Credit card`, ver ADR 0002 y 0004) compiten por el mismo rango de
números porque los tres se shapearon en paralelo sin coordinarse entre sí. Esta ADR fija
la numeración de este frente; ADR 0002 fija la del frente de categorías.

## Decisión

**Dos migraciones, no una — igual que propuso `po-pm` — y numeradas ahora, sin
ambigüedad:**

- **Migración 010 — `creditLimit`** (S2/T7). Un único `ALTER TABLE ADD COLUMN`,
  patrón idéntico a `008_envelopeCompletion.ts`:

  ```sql
  ALTER TABLE accounts ADD COLUMN creditLimit INTEGER;
  ```

  Sin `CHECK`, sin `requiresForeignKeysOff` (no reconstruye tabla), sin índice nuevo
  (ninguna query filtra todavía por `creditLimit`). `insertAccount`/`updateAccount`
  deben validar con `isFiniteInteger` cuando el valor no es `null`, igual que ya hacen
  con `initialBalance`.

- **Migración 011 — `initialBalanceConfirmedAt`** (S3/T10). Un único
  `ALTER TABLE ADD COLUMN` más, mismo patrón:

  ```sql
  ALTER TABLE accounts ADD COLUMN initialBalanceConfirmedAt TEXT;
  ```

  Junto con la query nueva `getAccountsPendingBalanceReview` (no es DDL, va en
  `accountsQueries.ts`, fuera de la migración):

  ```sql
  SELECT ... FROM accounts
   WHERE kind IN ('credit_card', 'loan')
     AND archivedAt IS NULL
     AND initialBalance > 0
     AND initialBalanceConfirmedAt IS NULL;
  ```

### Por qué dos migraciones y no una

Mismo criterio que ya separa columnas ortogonales en este esquema (`completedAt` vs
`archivedAt` en `envelopes`, migración 008): `creditLimit` e
`initialBalanceConfirmedAt` no comparten invariante — ninguna fila necesita que ambas
existan a la vez para ser válida, y S2 debe poder cerrarse, mergearse y verse en el
dispositivo del dueño **sin esperar** a que S3 (la rebanada más incierta de las tres,
según su propio hill chart) esté lista. Bundlearlas en una sola migración acoplaría el
release de una columna estable a una que aún no ha visto UI. La migración 008 bundleó
dos columnas porque `closingMovementId` **no tiene sentido sin** `completedAt`; aquí no
existe esa relación.

### Por qué no una sola migración con las dos ALTER TABLE

Se consideró y se rechaza: aunque técnicamente cabrían dos `ALTER TABLE` en una misma
transacción, haría imposible lo que el propio pitch pide como criterio de éxito —
verificar S2 en el dispositivo real del dueño de forma independiente de S3. Una
migración es la unidad atómica de despliegue de este proyecto; que dos features
independientes compartan una unidad de despliegue es el acoplamiento que se evita.

## Orden de ejecución y paralelismo

- **010 antes que 011**, siempre — no por dependencia de DDL (ambas son `ALTER TABLE`
  sobre columnas sin relación entre sí, sin `FOREIGN KEY`, sin `CHECK` cruzado), sino
  porque el propio backlog ya declara `T10 depende de T7` y `T11 depende de T10, T8`:
  la UI de S3 (T11) reutiliza el campo `creditLimit` de S2 (T8) como destino del valor
  viejo. Desarrollar 011 antes de que 010 esté mergeado no ahorra nada y arriesga que
  T11 se escriba contra un campo que todavía no existe en `main`.
- **Ambas son independientes de la migración 012** (ADR 0002, tabla `categories`) —
  ninguna toca la misma tabla, ninguna comparte invariante. Pueden desarrollarse en
  paralelo sin colisión de SQL.
- **El único punto de colisión real es `src/db/db.ts`**: las tres migraciones
  (010, 011, 012) agregan una entrada al array `migrations` y mueven la constante
  `SCHEMA_VERSION`. Si dos ramas tocan ese archivo en paralelo, git puede resolver el
  conflicto textual, pero **una persona tiene que fusionar en serie y verificar el
  orden ascendente sin huecos ni números repetidos** antes de mergear. Protocolo:
  1. 010 se mergea primero a la rama base de esta apuesta.
  2. 011 se rebasea sobre 010 antes de mergear (su número ya es 011 de por sí, el
     rebase es solo para resolver el archivo compartido, no para renumerar).
  3. 012 (ADR 0002) se rebasea al final sobre 011 y se mergea último.
  4. Quien mergea last confirma `SCHEMA_VERSION === 12` y que `migrations` tiene
     exactamente una entrada por versión 10, 11 y 12, en ese orden.

## Consecuencias

**Buenas:**
- S2 y S3 se pueden implementar, revisar y verificar en el dispositivo del dueño de
  forma completamente independiente, como pedía el pitch.
- Cero riesgo de reconstrucción de tabla (`requiresForeignKeysOff`) — son las
  migraciones más baratas y seguras posibles sobre este esquema.
- Ninguna migración existente se toca.

**Malas / costo aceptado:**
- Dos migraciones en vez de una significan dos bumps de `user_version` para lo que un
  usuario percibe como una sola apuesta de producto — coste operativo mínimo (el
  runner ya está diseñado para esto) a cambio de shippability independiente.
- Coordinación manual de merge en `src/db/db.ts` (ver protocolo arriba) — no hay forma
  de evitarlo con un runner basado en un array ordenado y un entero global; automatizar
  la asignación de número sería sobre-ingeniería para tres migraciones que ya están
  numeradas por esta ADR.

## Alternativas consideradas

- **Una sola migración con las dos columnas**: rechazada — acopla el release de S2 y
  S3 (ver arriba).
- **Reservar rangos de números por frente de trabajo** (p. ej. 900s para cuentas, 910s
  para categorías) para evitar coordinación futura: rechazada por sobre-ingeniería —
  `user_version` es un entero secuencial sin huecos por diseño de SQLite/el runner;
  introducir rangos rompería `SCHEMA_VERSION = migrations[length-1].version` y no
  aporta nada que esta ADR no resuelva ya nombrando los tres números explícitamente.
