# Architecture decisions

## ADR-001: Begin with a modular monolith

### Context

The MVP must be understandable, testable and deliverable by one student. Its
API and persistence rules need to work before the web clients grow.

### Options

1. Modular monolith with clear domain boundaries.
2. Separate API services for catalog, orders and dispensing.

### Decision

Use one Express API and PostgreSQL database, organized by domain modules.

### Reason

This keeps deployment and transactions simple while preserving boundaries
between HTTP, application orchestration, policies and SQL. Services can be
split later only if operational evidence justifies the cost.

### Consequences

- Benefits: fewer deployment failure modes; database transactions can cover
  critical state changes; small initial code surface.
- Costs: module boundaries must be respected in one codebase.
- Risks: a monolith can become tightly coupled if modules import each other's
  internals.
- Later change: extract a service only when independent scaling or ownership
  is an evidenced requirement.

### Evidence

`specification/02-SYSTEM-ARCHITECTURE.md`; current API modules are separated
under `apps/api/src/modules/`.

## ADR-002: Derive public tenant context from the machine code

### Context

The buyer catalog is public and the browser must not choose an arbitrary
tenant.

### Decision

Look up an active machine by its public code, derive its tenant from the
database relationship and preserve tenant equality across joins. Do not accept
`tenantId` from the client as an authorization input.

### Consequences

- Benefits: public requests cannot select a different tenant using a body or
  query parameter.
- Costs: public codes must be unique and sufficiently unpredictable in a
  production deployment.
- Risks: mistakes in future queries could still omit tenant-scoped joins.
- Later change: apply the same trusted-context approach to public order tokens
  and authenticated device identities.

### Evidence

The initial catalog query joins machine, tenant, slot and product with tenant
equality; the migration adds composite tenant-scoped foreign keys. HTTP tests
pass; PostgreSQL integration remains pending until a disposable database is
configured.

## ADR-003: Keep demo seed repeatable without resetting inventory

### Context

Students need stable sample codes and two tenants for isolation checks, while
rerunning seed must not restore stock or overwrite changed operational data.

### Decision

Use deterministic demo identifiers and `ON CONFLICT DO NOTHING` inside one
transaction.

### Consequences

- Benefits: reruns do not duplicate records or reset stock.
- Costs: changing a demo fixture requires an explicit migration or manual
  update rather than silently overwriting existing state.
- Risks: seed data created by an older version is not automatically reconciled.
- Later change: add a versioned fixture strategy if demo evolution requires it.

### Evidence

`database/seed/demo.sql` and `scripts/seed.js`; execution against PostgreSQL is
still pending.
