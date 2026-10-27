# M24 implementation plan

Student: Xamuel Romero  
Student ID: xamuelromero  
Email: xamuelromero.itsu@gmail.com  
Repository path: `projects/m24-vending-platform/`  
Kickoff commit: Not created

## Architecture

Start with a modular monolith: one Express API and PostgreSQL/Supabase. Browser
clients call the API; only the backend connects to PostgreSQL. Separate HTTP
routes, application services, pure domain policies and SQL stores where those
boundaries add value. Do not introduce microservices or empty layers for the
MVP.

## Current structure

```text
apps/api/src/
├── app.js
├── server.js
├── config.js
├── database/
├── middleware/
├── modules/
│   ├── health/
│   └── machines/
└── shared/
database/
├── migrations/
└── seed/
test/
scripts/
docs/
```

The `admin-web` and `vending-web` clients will be added when needed for the
demonstrable end-to-end flow. The MVP's first user-visible feature is the
public machine catalog.

## First vertical

```text
tenant + location + machine + product + slot
→ GET /api/v1/public/machines/:publicCode/catalog
→ create order and reserve inventory
→ simulated payment
→ device claims and completes one dispense job
→ consume reservation and complete order
```

Current code implements health/readiness and the public catalog. Orders,
payments, device authentication, dispensing and web clients are planned, not
implemented.

## Database and tenant isolation

- PostgreSQL through `pg`; Supabase is the managed PostgreSQL provider.
- Versioned SQL migrations and a repeatable, transactional demo seed.
- Operational tables include `tenant_id`; composite foreign keys prevent
  cross-tenant references.
- Public catalog resolves a machine using `publicCode`; the tenant is derived
  by the server, not accepted from the request.
- Use parameterized SQL, explicit status/quantity constraints and transactions
  for related writes.

## Verification

- Unit/API tests for health, readiness, catalog isolation at the HTTP boundary,
  invalid codes and unknown machines.
- PostgreSQL integration test for two demo tenants, using a disposable
  `M24_TEST_DATABASE_URL`.
- Later: negative cross-tenant access tests, inventory concurrency,
  idempotency retries and end-to-end purchase/dispense verification.

## Risks and open items

- Configure a disposable PostgreSQL database and execute migrations and seed.
- Run the real PostgreSQL integration test; current API tests use an isolated
  in-memory store.
- Confirm intended Git remote before creating the kickoff commit.
- Complete user/device authentication, rate limiting, CORS allowlist and the
  remaining MVP verticals before describing the system as production-ready.
