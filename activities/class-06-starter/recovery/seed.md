# Recuperación · Seed

## Seed incompleto o falló a la mitad

Síntoma:
El doctor marca "Seed users/requests found ... FAIL", o el seed terminó
con error.

Significado:
El seed corre dentro de UNA transacción: si falló, no dejó datos a medias.
Simplemente no se aplicó.

Comprueba:
El mensaje del seed. Si dice `42P01`, faltan las migraciones.

Acción:
`npm run db:migrate` (si faltaba esquema) y luego `npm run db:seed`.

DATABASE SEED

Users
- 2 requesters ready
- 1 agent ready

Requests
- 6 requests ready
- 15 history events ready

Seed completed successfully. 

Qué NO hacer:
No insertes usuarios del taller a mano por el editor de Supabase.

Pregunta:
¿Por qué "falló a la mitad" no dejó basura en las tablas?

## ¿Ejecuté el seed dos veces — dupliqué todo?

Síntoma:
Miedo después de un segundo `npm run db:seed`.

Significado:
Ninguno: el seed identifica a SUS usuarios por email exclusivo
(*.seed@example.test), borra solo SUS solicitudes y las recrea.

Comprueba:
En el Table Editor: sigue habiendo 3 usuarios seed y 6 solicitudes seed.

Acción:
Nada. Repetible es exactamente esto.

Qué NO hacer:
No "limpies" con DELETE amplios ni TRUNCATE: te llevarías TU trabajo.

Pregunta:
¿Qué hace reproducible a este seeder: la suerte o su criterio de identidad?

## Datos residuales de pruebas

Síntoma:
Usuarios `class06-test-...` o `class06-validation-...` en las tablas.

npm test

> class-06-request-api@6.0.0 test
> node --test --test-concurrency=1 'test/*.test.js'

✔ registering a new account answers 201 with role requester (1273.339103ms)
✔ registering the same email twice answers a generic 409 (418.549083ms)
✔ sending a role at registration is rejected explicitly (9.725057ms)
✔ logging in with valid credentials answers a Bearer token (513.076868ms)
✔ logging in with a wrong password answers a generic 401 (423.507359ms)
✔ GET /auth/me reports the identity carried by the token (582.450255ms)
✔ GET /auth/me without a token answers 401 (7.868639ms)
✔ a requester can create a request and becomes its owner (1299.920746ms)
✔ the owner can read their own request (891.715765ms)
✔ a requester cannot access another user request (1202.76286ms)
✔ the collection requires a Bearer token (8.248814ms)
✔ a requester cannot change the priority, even of their own request (1003.041736ms)
✔ an agent can move a request through a valid transition (1559.360222ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10689.283733

Significado:
Una corrida de pruebas o del validador se interrumpió antes de su cleanup.

Acción:
Vuelve a correr `npm test` o `npm run validate:class-06` (limpian lo suyo al
final). Si el residuo persiste, bórralo por email EXACTO en el SQL Editor —
primero su historial, luego sus solicitudes, luego el usuario.

Qué NO hacer:
`DELETE FROM users;` — jamás. Ni siquiera "para empezar limpio".

Pregunta:
¿Cómo distingues una fila del seed, una de pruebas y una tuya?
