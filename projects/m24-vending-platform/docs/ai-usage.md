# AI usage record

## Tools used

AI assistant in VS Code; repository inspection and command-line test tools.

## My understanding before asking

The student said the evaluation was complete and the next work was the M24
practical implementation and kickoff.

## What I asked

Align M24 documentation with a clean, scalable and secure architecture, begin
the first code vertical, and check readiness for the `m24-class-kickoff`
checkpoint.

## What the AI proposed

- A modular monolith rather than premature microservices.
- Tenant-scoped relational constraints and tenant derivation from public
  machine codes.
- Health/readiness and public catalog as the first executable slice.
- A repeatable demo seed for two tenants and an integration check against a
  dedicated PostgreSQL database.

## What I accepted

Changes are present in the working tree. Student review and confirmation are
still required before treating architectural decisions as personally approved.

## What I rejected

No student rejection has been recorded. The implementation intentionally does
not add microservices, real payments, device operations or web interfaces before
the first catalog slice is verified.

## How I verified it

`npm test` in `projects/m24-vending-platform/`: 4 tests passed; the PostgreSQL
integration test was skipped because `M24_TEST_DATABASE_URL` is not configured.
All JavaScript files passed `node --check`.

## Incomplete verification

No PostgreSQL migration, seed or real tenant-isolation integration test has
been run. The student must review the code, configure a disposable database,
run those checks and record the results without copying credentials here.
