# Database ・ Base de datos

> Documentación de la base de datos de la **Yoghurt Store API**: esquema versionado,
> entornos (Supabase / local), reglas de diseño y cómo aplicar las migraciones.
> ・ English below ・

---

## 1. Overview ・ Resumen

The Yoghurt Store API stores everything in a single **PostgreSQL** database
(`ecommerce_db`). The schema is defined as **versioned migrations** — one SQL file
per step, applied in ascending numerical order — so every environment (development,
test, staging, production) is reproducible and the history of changes is explicit.

> La API de Tienda de Yogures guarda todo en una **única base PostgreSQL**
> (`ecommerce_db`). El esquema se define como **migraciones versionadas** — un
> archivo SQL por paso, aplicados en orden numérico ascendente — para que cualquier
> entorno (dev, test, staging, producción) sea reproducible y el historial de
> cambios quede explícito.

Versioned SQL matters because:
- A change is **visible, reversible, and reviewable** (it has a number and a commit).
- The same base is **created identically** in every environment.
- No one has to remember which DDL was already run (the ledger records it).

> Por qué importa el SQL versionado:
> - Un cambio es **visible, reversible y revisable** (tiene número y commit).
> - La base se **crea idéntica** en todos los entornos.
> - Nadie tiene que recordar qué DDL ya se ejecutó (el ledger lo registra).

---

## 2. Database Environments ・ Entornos de base

| Environment ・ Entorno | When ・ Cuándo | How it gets the schema ・ Cómo recibe el esquema |
| --- | --- | --- |
| **Supabase (test/validation)** | During development, to try the API against a remote Postgres. | Two options: the automated runner (`db:migrate`, once implemented in Phase 2) **or** pasting the migration files manually in the SQL Editor. |
| **Local / PostgreSQL** | Development and automated tests. | The migration runner (`npm run db:migrate`) — the recommended path. |

> | Entorno | Cuándo | Cómo recibe el esquema |
> |---|---|---|
> | **Supabase (test/validación)** | Durante el desarrollo, para probar la API contra un Postgres remoto. | Dos opciones: el runner automático (`db:migrate`, una vez implementado en la Fase 2) **o** pegar los archivos de migración manualmente en el Editor SQL. |
> | **Local / PostgreSQL** | Desarrollo y tests automatizados. | El runner de migraciones (`npm run db:migrate`) — el camino recomendado. |

**Rule of thumb ・ Regla de oro:** pick **one** method per database. If you created
the schema by manual paste, do **not** run the automated runner on that same base
(duplicate tables would break it).

> **Regla de oro:** elige **un solo** método por base. Si creaste el esquema pegándolo
> a mano, **no** corras el runner automatizado sobre esa misma base (duplicaría las
> tablas).

---

## 3. Migrations ・ Migraciones

Migrations live in `database/migrations/`. They are **versioned**, **additive**,
and applied **in ascending order**. The prefix is the version number.

> Las migraciones viven en `database/migrations/`. Son **versionadas**, **aditivas**
> y se aplican **en orden ascendente**. El prefijo es el número de versión.

```
database/migrations/
├── 0001_create_users.sql
├── 0002_create_products.sql
├── 0003_create_orders.sql
├── 0004_create_order_items.sql
├── 0005_create_payments.sql
├── 0006_create_order_events.sql
└── 0007_create_indexes.sql
```

### Dependency order ・ Orden de dependencias

Each file only depends on files already applied. The order matters:

| File ・ Archivo | Creates ・ Crea | Depends on ・ Depende de |
| --- | --- | --- |
| `0001` | `users` | — |
| `0002` | `products` | — |
| `0003` | `orders` (FK → `users`) | `0001` |
| `0004` | `order_items` (FK → `orders`, `products`) | `0002`, `0003` |
| `0005` | `payments` (FK → `orders`) | `0003` |
| `0006` | `order_events` (FK → `orders`, `users`) | `0001`, `0003` |
| `0007` | indexes | all tables ・ todas las tablas |

### The ledger ・ El ledger (`schema_migrations`)

The runner records **each applied file** in a `schema_migrations` table. That means:

- A migration is executed **at most once** per database.
- Re-running `db:migrate` only applies the pending files.
- The schema state is **queryable**: `select * from schema_migrations;`.

> El runner registra **cada archivo aplicado** en una tabla `schema_migrations`. Eso
> significa:
> - Una migración se ejecuta como **máximo una vez** por base.
> - Repetir `db:migrate` solo aplica los archivos pendientes.
> - El estado del esquema es **consultable**: `select * from schema_migrations;`.

> **Note ・ Nota:** the runner script is part of **Phase 2**. Until then, the only
> way to apply the schema is the manual path below.
> **Nota:** el script del runner es parte de la **Fase 2**. Hasta entonces, la única
> vía de aplicar el esquema es el camino manual de abajo.

---

## 4. Applying the Schema ・ Aplicar el esquema

### Option A — Automated (recommended) ・ Automática (recomendada)

Once the runner exists (Phase 2), the whole base is created with one command:

```bash
npm run db:migrate
```

### Option B — Manual fallback (Supabase) ・ Manual (Supabase)

If the runner is not available yet, paste the files **in ascending order** into the
Supabase SQL Editor and run each one:

1. `0001_create_users.sql`
2. `0002_create_products.sql`
3. `0003_create_orders.sql`
4. `0004_create_order_items.sql`
5. `0005_create_payments.sql`
6. `0006_create_order_events.sql`
7. `0007_create_indexes.sql`

> Si el runner aún no existe, pega los archivos **en orden ascendente** en el Editor
> SQL de Supabase y ejecútalos uno por uno: `0001` … `0007`.

**Notes ・ Notas**
- On Supabase, `pgcrypto` (and therefore `gen_random_uuid()`) is **already available**.
- The tables are created with plain DDL — no Supabase-specific features are used.
- Use empty/fresh databases for manual paste; do not run manual paste on a base that
  was populated by the runner.

> **Notas**
> - En Supabase, `pgcrypto` (y por tanto `gen_random_uuid()`) **ya está disponible**.
> - Las tablas usan DDL estándar — sin features específicas de Supabase.
> - Usa bases vacías/frescas para el pegado manual; no combines pegado manual y runner
>   en la misma base.

---

## 5. Tables & Relationships ・ Tablas y relaciones

| Table ・ Tabla | Purpose ・ Propósito | Key columns ・ Columnas clave | Relationships ・ Relaciones |
| --- | --- | --- | --- |
| `users` | Accounts (customer/admin) | `email` UNIQUE, `role` | — |
| `products` | Catalog items | `sku` UNIQUE, `price_cents`, `stock`, `active` | — |
| `orders` | Customer orders | `customer_id`, `status`, `total_cents` | FK → `users` |
| `order_items` | Line items with price snapshot | `quantity`, `unit_price_cents` | FK → `orders`, `products` |
| `payments` | Payments (idempotent) | `payment_ref` UNIQUE, `order_id` UNIQUE | FK → `orders` |
| `order_events` | Immutable audit log | `type`, `from_status`, `to_status`, `changed_by` | FK → `orders`, `users` |

```
users ──< orders ──< order_items >── products
                │
                ├──< payments
                └──< order_events
```

> Las seis tablas y sus relaciones: `users` → `orders` → `order_items`/`payments`/
> `order_events`, con `order_items` también apuntando a `products` para el snapshot.

---

## 6. Design Rules Enforced ・ Reglas de diseño aplicadas

| Rule ・ Regla | Where ・ Dónde | Guarantees ・ Qué garantiza |
| --- | --- | --- |
| Money as integer cents | `price_cents`, `total_cents`, `amount_cents`, `unit_price_cents` + `CHECK > 0` | No float errors ・ Sin errores decimales |
| Order state machine | `status` CHECK (`pending` → `paid` → `shipped` → `delivered`, or `cancelled`) | Valid transitions only ・ Solo transiciones válidas |
| Idempotent payments | `UNIQUE (order_id)`, `UNIQUE (payment_ref)` | Paying twice = one charge ・ Pagar dos veces = un cargo |
| Safe stock | `CHECK (stock >= 0)` | Never negative ・ Nunca negativo |
| Price snapshot | `order_items.unit_price_cents` copied at creation | Later price changes don't alter orders |
| Immutable audit log | `order_events` append-only | Full, ordered history ・ Historial completo y ordenado |

> Las seis reglas de diseño: dinero en céntimos, máquina de estados del pedido,
> pagos idempotentes, stock con CHECK, snapshot de precio y bitácora inmutable.

---

## 7. Roadmap ・ Hoja de ruta

Pending automation and future work ・ Trabajo pendiente y futuro:

- **Migration runner** (`npm run db:migrate`) with the `schema_migrations` ledger
  (Phase 2). ・ Runner de migraciones con el ledger `schema_migrations` (Fase 2).
- **Seed script** (`npm run db:seed`): creates the promoted `admin` user and the
  initial `YOG-*` yoghurt products (Phase 2). ・ Script de seed: crea el usuario
  `admin` promovido y los yogures iniciales `YOG-*` (Fase 2).
- **`citas_db`**: a second, independent database for the future `citas-api` project.
  ・ Segunda base independiente para el futuro proyecto `citas-api`.