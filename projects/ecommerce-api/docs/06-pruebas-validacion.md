# 06 — Pruebas y validación ・ Testing & validation

> Cómo demostramos que el sistema funciona — siguiendo el patrón del curso
> (suite + helpers con cleanup seguro + validador final + colección Bruno).

---

## Estrategia ・ Strategy

| Nivel ・ Level | Qué cubre ・ Covers | Herramienta |
| --- | --- | --- |
| Unit | políticas `can*`, máquina de estados, mappers | node:test |
| Integración | cada endpoint contra la app real (`supertest` + DB real) | node:test + supertest |
| Regresión | bugs históricos: lista vacía `200 []`, 404 anti-enumeración, idempotencia | idem |
| Validador final | 12 checks over HTTPS black-box | `npm run validate:ecommerce` |
| Mano (demo) | flujo real de la tienda | Bruno (`test-api/`) |

---

## Suite ・ Suite (borrador ~18-20 tests)

**auth (7):** register 201 · email duplicado 409 · `role` en register rechazado ·
login ok · login malo 401 genérico · `me` · `me` sin token 401.
**shop (4):** listar catálogo (vitrina activa) · product 404 si inactivo ·
crear producto (admin) · PATCH producto/stock (admin).
**orders (7-9):** crear pedido y snapshot de precio · stock NO descontado al crear ·
listar solo los míos (customer) / todos (admin) · `?status=` sin matches → `200 []` ·
pagar idempotente (2× = misma respuesta, 1 solo débito) · stock descontado al pagar ·
`INSUFFICIENT_STOCK` (409) · transiciones admin `paid→shipped→delivered` ·
`INVALID_TRANSITION` (409) · cancel customer propio en `paid` · extraño = 404
idéntico a inexistente · historial ordenado y sin `changed_by`/secrets.

---

## Helpers ・ Helpers (patrón de limpieza segura del curso)

- `test-data.js`: emails únicos por corrida (`runId` + contador), registra **ids
  creados** en `createdUserIds` / `createdProductIds` / `createdOrderIds`.
- `test-auth.js`: `loginAs(user)` → token; promoción de admin solo sobre
  **usuario sintético propio** (nunca tocar el admin del seed).
- `cleanup.js`: en `after()` (corre aunque un test falle) y **por ids** en orden
  de dependencias:
  ```
  order_events → payments → order_items → orders → products → users
  ```
  Nunca `DELETE FROM` sin WHERE, nunca `TRUNCATE`. El seed sobrevive a cada corrida.

---

## Validador final ・ Final validator (`scripts/validate-ecommerce.js`)

Black-box: arranca tu app en un puerto aleatorio contra TU base, crea sus propios
datos etiquetados (`TAG` único), limpia en bloque garantizado y orienta (nunca da
la solución). **Checks (12):**

```
Environment
[01/12] Database is reachable
[02/12] Migrations are complete
[03/12] Seed data is available

Regression & contracts
[04/12] Valid empty collection returns 200
[05/12] Empty collection returns []
[06/12] Authentication is required (pay/history)

Orders & payments
[07/12] Owner can pay own order
[08/12] Stranger gets the SAME 404 as missing
[09/12] Payment is idempotent (same ref → same result, no double charge)
[10/12] Stock is deducted at payment (and can't go negative)
[11/12] Events are ordered correctly (birth first)
[12/12] Sensitive information is hidden
```

> Córrelo DOS veces: la segunda demuestra limpieza + idempotencia.
> Guarda la salida final en `projects/ecommerce-api/validation-evidence.txt`.

---

## Bruno ・ Bruno (`test-api/`)

Colección `opencollection.yml` + environments + requests `.bru`:
`Auth/register`, `Auth/login-customer`, `Auth/login-admin`, `Auth/me`,
`Products/list`, `Products/create`, `Orders/create` (guarda `orderId`),
`Orders/list`, `Orders/history`, `Orders/pay` (guarda `paymentRef`),
`Orders/status`, `Orders/cancel`.

Flujo demostración: **register → login-customer → create-order → pay (2 veces,
ver idempotencia) → history → login-admin → list all → status → delivered.**

> El `token` y `orderId` viven en el environment `Local.bru` — datos de sesión,
> **jamás se commitean** tokens reales.

---

## Evidencia ・ Evidence

- `validation-evidence.txt`: salida real con `FINAL RESULT: PASSED` (12/12).
- Suite: `npm test` → todo verde (n) en la terminal.
- Bruno: capturas del flujo (si se entrega).