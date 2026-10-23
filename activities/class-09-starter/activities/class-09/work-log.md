# Work log

Registro del trabajo con IA durante el TALLER (la evaluación tiene su
propio historial obligatorio en assessment/). No copies conversaciones
completas aquí: registra el criterio, no el chat.


**Fecha:** 2026-10-23

- **Tiempo total registrado:** 10:04–10:42 (-04) (aprox.)

## Fase 0 — Reconocimiento y baseline (2026-10-23 10:04 -04)

| Hora (-04) | Comando | Resultado real |
| --- | --- | --- |
| 10:04 | `date` | `2026-10-23 10:04:50 -04` |
| 10:05 | `npm run doctor` | 7/7 PASS |
| 10:05 | `curl -i /health` | `200 {"status":"ok"}` |
| 10:05 | `curl -i /ready` | `200 {"status":"ready","database":"available"}` |
| 10:05 | `curl -i /` | `404 ROUTE_NOT_FOUND` (ruta raíz inexistente) |
| 10:05 | `npm run db:migrate` | `001`–`005` SKIPPED, sin pendientes |
| 10:05 | `npm run db:seed` | 3 usuarios, 6 requests, 15 eventos de historial |
| 10:06–10:07 | `npm test` | 64 tests: 59 pass, 0 fail, 5 todo |
| 10:19 | `git commit -m "class-09-baseline"` + `git push origin master` | commit `0c7b966` publicado en `origin/master` |

Nota: `npm run dev` ya estaba corriendo en otra terminal; no lo inicié de nuevo.

## Fase 2 — Análisis y reproducción (10:08–10:11 -04)

- Completé §1–§9 de `system-dossier.md`: inventario, recorrido de
  `GET /requests/:id`, auditoría de 15 áreas, impacto y dudas.
- Reproduje BUG-901 con un script temporal (ya eliminado) usando
  `supertest`, usuarios sintéticos y el helper de cleanup:
  - requester ajeno → `200` con el id 169;
  - requester ajeno + `?userId=<owner>` → `200`;
  - owner → `200`; agent → `200`;
  - id inexistente → `404 REQUEST_NOT_FOUND`;
  - sin token → `401 AUTHENTICATION_REQUIRED`.
- Conclusión: el fallo está en `getRequest`
  (`src/modules/requests/requests.service.js:86-93`), que devuelve la fila
  sin consultar `canViewRequest`; la policy ya existe y es correcta.

## Fase 3 — Pruebas de regresión y corrección (10:12–10:16 -04)

- Convertí los 3 `todo` de `test/request-access-policy.test.js` y los 2 de
  `test/request-detail.test.js`.
- `npm run test:policy` → 8/8 PASS (la policy ya era correcta).
- `npm run test:detail` ANTES del fix → 4 PASS, 2 FAIL:
  `200 !== 404` en el acceso ajeno y en `?userId=<owner>`.
- Corrección mínima en `requests.service.js:86-93`: mapear la fila,
  consultar `canViewRequest(actor, request)` y lanzar el mismo
  `notFound(id)`; se retiró el `TEMP(REQ-442)`.
- `npm run test:detail` DESPUÉS → 6/6 PASS.
- `npm test` → 64/64 PASS, 0 fail, 0 todo, ~73 s.

## Fase 4 — Validación (10:16–10:42 -04)

- `npm run validate:class-09` → 14/14 PASS,
  `FINAL RESULT: PASSED`.
- Salida guardada en `activities/class-09/validation-evidence.txt`.

## Commits

- `class-09-baseline` → `0c7b966`
- `class-09-analysis` → `bc75c71` (dossier §1–§9)
- `class-09-fix` → `4116383` (policy en `getRequest` + 5 pruebas)
- `class-09-submission` → este commit (`work-log.md` + `validation-evidence.txt`)

## What I observed before asking AI

- `package.json` define `start`/`dev` como `node src/server.js`.
- `src/server.js` solo arranca el proceso; `src/app.js` construye la app.
- Orden de `app.use`: CORS → requestId → requestLogger → JSON → health → auth → requests → notFound → errorHandler.
- `/` responde 404 porque no hay ruta raíz; `/health` y `/ready` sí existen.
- La suite pasa sin `npm run dev` porque supertest importa `app` sin abrir un puerto real.
- `getHistory` y `patchRequest` sí consultan `canViewRequest`; `getRequest` no.

## What I asked

- ¿Dónde arranca el sistema siguiendo `package.json`?
- ¿Qué diferencia hay entre `server.js` y `app.js`?
- ¿Qué hacen `/health` y `/ready`?
- ¿Por qué `/` devuelve 404?
- ¿En qué orden atraviesa una petición los `app.use` y por qué un 401 no llega al handler?
- ¿Dónde debería aplicarse la regla de visibilidad del detalle sin alterar el contrato exitoso?

## What the AI proposed

- Seguir `package.json` → `src/server.js` → `src/app.js` → `app.listen`.
- Separar arranque (`server`) de construcción (`app`) y explicar el rol de supertest.
- Documentar `/health` como liveness sin base y `/ready` como readiness con `SELECT 1`.
- Explicar que `authenticate` va antes de `requestsRoutes`, por eso un 401 salta el handler y cae en `errorHandler`.
- Completar §1–§9 del dossier antes de tocar código.
- Para el fix: reutilizar `canViewRequest` en `getRequest` y el mismo `notFound(id)`, sin capas ni migraciones.

## Evidence I checked

- `package.json`: scripts `start`/`dev`.
- `src/server.js:4-8`: `PORT` y `app.listen`.
- `src/app.js:25-41`: orden de middlewares y routers.
- `src/routes/health.routes.js:27-45`: `/health` y `/ready`.
- `src/middleware/authenticate.js:13-44` y `src/middleware/error-handler.js:33-72`.
- `src/modules/requests/requests.service.js:86-93, 155-162, 219-227`.
- `src/modules/requests/request.policy.js:20-27`.
- Salidas reales de `doctor`, `curl`, `db:migrate`, `db:seed`, `npm test`,
  `test:policy`, `test:detail` y `validate:class-09` (arriba).

## What I accepted

- El plan por fases y completar el análisis antes de tocar el service.
- La explicación `server` vs `app` y el orden de `app.use`.
- La distinción `/health` (liveness) vs `/ready` (readiness).
- El 404 de `/` como comportamiento esperado del contrato, no como fallo.
- El fix mínimo: una comprobación con la policy existente y el mismo
  `notFound`, sin cambiar el schema ni los endpoints vecinos.

## What I rejected

- Tocar código o el bug antes de completar el análisis (§8) y reproducirlo.
- Añadir rutas nuevas (por ejemplo, una ruta raíz) solo para evitar el 404.
- Cambiar la policy o el mapper para este bug: la regla ya existe en `canViewRequest`.
- Responder `403` al requester ajeno: la decisión del sistema es `404`
  para no confirmar existencia.
- Tomar `userId`/`createdBy` del query o body como identidad.
- Agregar migraciones, controllers, repositories o DTOs: el ticket lo prohíbe.

## What I changed

- `activities/class-09/system-dossier.md`: §1–§9 completas con evidencia.
- `activities/class-09/work-log.md`: fases, horas y resultados reales.
- `activities/class-09/validation-evidence.txt`: salida del validador.
- `src/modules/requests/requests.service.js`: `getRequest` consulta
  `canViewRequest` y retira el `TEMP(REQ-442)`.
- `test/request-access-policy.test.js`: 3 pruebas activadas.
- `test/request-detail.test.js`: 2 pruebas de regresión activadas.

## How I verified it

- Reproducción antes del fix: ajeno `200`, ajeno con `?userId` `200`.
- `npm run test:policy` → 8/8 PASS.
- `npm run test:detail` antes del fix → 4 PASS, 2 FAIL (`200 !== 404`).
- `npm run test:detail` después → 6/6 PASS.
- `npm test` → 64/64 PASS, 0 fail, 0 todo.
- `npm run validate:class-09` → 14/14 PASS, `FINAL RESULT: PASSED`.

## What I still cannot explain

- Por qué `TEMP(REQ-442)` desactivó la visibilidad del detalle y cuándo se puede retirar.
- Si support necesita un rol que vea solicitudes ajenas y cómo se modelaría sin reabrir BUG-901.
- Si `claim` debería comprobar visibilidad además de rol/estado.
- Si el orden `findById` → policy deja algún canal lateral (tiempo/errores)
  que el 404 no cubre.
