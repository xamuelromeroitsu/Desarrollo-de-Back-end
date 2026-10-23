# System dossier

Un solo expediente para todo el análisis del taller. Regla de oro: cada
afirmación cita su evidencia (archivo y función, prueba, tabla o salida de
comando) o se declara como duda en la sección 9. "El service maneja la
lógica" sin nombres no cuenta como inventario.

## 1. How the system starts

En desarrollo, `npm run dev` ejecuta `node --watch src/server.js`; para un
arranque sin watch, `npm start` ejecuta `node src/server.js` (scripts de
`package.json`). `src/server.js` importa la aplicación desde `src/app.js`,
elige el puerto de `PORT` o `3000` y llama a `app.listen`, que deja el
proceso escuchando HTTP. `src/app.js` construye y configura la aplicación
Express, instala middlewares y monta las rutas de health, auth y requests;
no abre un puerto.

**Evidencia ejecutada (2026-10-23 10:04 -04):**

- `npm run dev` → `Request API is running on http://localhost:3000`.
- `curl -i /health` → `200 {"status":"ok"}`.
- `curl -i /ready` → `200 {"status":"ready","database":"available"}`.
- `curl -i /` → `404 {"error":{"code":"ROUTE_NOT_FOUND",...}}` (no existe
  ruta raíz; la atrapa `notFound`, `app.js:40`).

**Por qué `server` ≠ `app`:** `server.js` arranca el proceso; `app.js`
construye la aplicación y la exporta. `supertest` importa `app` y lo
ejercita sin abrir un puerto real, por eso `npm test` corre sin
`npm run dev`.

## 2. Main components

| Componente | Archivo o recurso | Responsabilidad | Evidencia | Duda |
| --- | --- | --- | --- | --- |
| Punto de entrada | `src/server.js` | Lee `PORT` (default `3000`), importa `app` y abre el listener HTTP. | `src/server.js`: `app.listen(PORT, ...)`; scripts `start` y `dev` en `package.json`. | Ninguna para el arranque observado. |
| Construcción de la app | `src/app.js` | Crea Express, registra middlewares y monta rutas; no escucha en un puerto. | `src/app.js`: `express()`, `app.use(...)` y exportación de `app`. | Ninguna para las rutas montadas. |
| Router principal | `src/app.js`, `src/routes/health.routes.js`, `src/modules/*/*.routes.js` | `app.js` conecta health, auth y requests; cada módulo define sus endpoints. | `src/app.js`: `app.use(healthRoutes)`, `app.use('/auth', ...)`, `app.use('/requests', authenticate, ...)`. | Ninguna en los módulos inspeccionados. |
| Módulos | `src/modules/auth/`, `src/modules/requests/`, `src/modules/users/` | Separan rutas y servicios de auth/requests; users aporta acceso y mapeo de usuarios. | Archivos `*.routes.js`, `*.service.js`, `requests.store.js`, `users.store.js` y `user.mapper.js`. | No revisé en detalle todos los archivos de users. |
| Middleware global | `src/app.js`, `src/middleware/` | Aplica CORS, request ID, logging, parser JSON, autenticación en requests, 404 y errores en ese orden. | Orden explícito de `app.use(...)` en `src/app.js`. | Auth aplica además middleware dentro de `/auth` para `/me`. |
| Autenticación | `src/middleware/authenticate.js`, `src/modules/auth/token.js` | Verifica Bearer JWT y asigna `{ userId, role }` a `req.auth`. | `authenticate()` llama a `verifyToken()`; `token.js` verifica algoritmo, issuer, audience y expiración. | No inspeccioné la configuración efectiva más allá de las variables y defaults del código. |
| Autorización (policies) | `src/modules/requests/request.policy.js` | Expone reglas puras por rol/propiedad; el service las consulta antes de operaciones protegidas. | Funciones `canViewRequest`, `canEditContent`, `canChangeStatus`, `canClaimRequest`; llamadas en `requests.service.js`. | `getRequest()` tiene temporalmente deshabilitada la comprobación de visibilidad (comentario `TEMP(REQ-442)`). |
| Services | `src/modules/auth/auth.service.js`, `src/modules/requests/requests.service.js` | Coordina reglas de aplicación, policies, acceso a datos, transacciones y mapeo; no define respuestas HTTP. | Funciones exportadas de ambos services; comentarios de responsabilidad al inicio de cada archivo. | Ninguna sobre esta separación observada. |
| Stores / acceso a datos | `src/modules/requests/requests.store.js`, `src/modules/users/users.store.js` | Ejecuta consultas PostgreSQL y devuelve filas; requests usa parámetros para valores. | `requests.store.js`: `findAll`, `findById`, `insertRequest`, `updateRequest`, `findHistory`, `assignRequest`; valores `$1` etc. | `users.store.js` no se leyó en detalle. |
| Conexión PostgreSQL | `src/database/pool.js`, `src/database/transaction.js` | Mantiene un pool compartido; `withTransaction()` presta un cliente para una unidad transaccional. | `pool.js`: `new Pool`; `transaction.js`: `BEGIN`, `COMMIT`/`ROLLBACK` y `release()`. | La disponibilidad real se comprobó con `/ready`; no se inspeccionó la consola de Supabase. |
| Manejo de errores | `src/app-error.js`, `src/middleware/error-handler.js`, `src/middleware/not-found.js` | Traduce errores a respuestas JSON consistentes y asigna status según categoría; captura errores inesperados centralmente. | `errorHandler()` devuelve `{ error: { code, message }, requestId }`; `app.js` lo monta después de rutas. | Ninguna para las categorías revisadas. |
| Logging | `src/middleware/request-logger.js`, `src/logging/logger.js` | Escribe eventos JSON al finalizar una petición; incluye campos permitidos y evita headers, bodies, tokens y query strings. | `requestLogger()` usa lista explícita de campos; `logger.js` serializa timestamp, level y event. | Los logs vistos durante las pruebas incluyen eventos de requests; no se revisó persistencia externa porque no se configura aquí. |
| Health / readiness | `src/routes/health.routes.js` | `/health` confirma que el proceso responde; `/ready` consulta PostgreSQL y puede responder 503. | `createHealthRouter()`: `/health` sin query y `/ready` con `SELECT 1`; curl respondió 200 en ambos durante esta sesión. | Solo se observó el camino exitoso de `/ready`. |
| Pruebas | `test/*.test.js` | Cubre auth, requests, errores, health, policies, detalle, regresión e instrumentación/trazabilidad. | Suite `npm test`: 64 tests, 59 pass, 0 fail, 5 todo. | Hay cinco pruebas `todo`, no fallos. |
| Scripts operativos | `package.json`, `scripts/` | Provee doctor, migraciones, seed, validadores, preparación de evaluación y generación de secreto. | Scripts `doctor`, `db:migrate`, `db:seed`, `validate:class-09`, etc.; implementaciones en `scripts/`. | `db:seed` no se ejecutó en esta sesión. |
| Dependencias externas | `package.json` | Runtime: Express, `pg`, `jose`, `dotenv`; desarrollo/pruebas: `supertest`; requiere Node `>=20`. | `dependencies`, `devDependencies` y `engines` en `package.json`. | No verifiqué aquí las versiones instaladas de Node/npm. |

## 3. Request trace

Recorrido de `GET /requests/:id`:

1. **Router:** `src/modules/requests/requests.routes.js:28-31` define
   `router.get('/:id', ...)`; `src/app.js:38` lo monta bajo `/requests`.
2. **Middlewares:** antes del router pasan `corsPolicy`
   (`src/middleware/cors.js:8-23`), `requestId`
   (`src/middleware/request-id.js:14-22`), `requestLogger`
   (`src/middleware/request-logger.js:13-38`) y `express.json()`
   (`src/app.js:28`). Para `/requests` corre además `authenticate`
   (`src/middleware/authenticate.js:13-44`); si falla, el router no se
   ejecuta.
3. **Validación del `id`:** el handler llama `parseIdParam(req.params.id)`
   (`requests.routes.js:29`); la función vive en `src/http/parse-id.js:16-21`,
   exige `/^[1-9][0-9]{0,17}$/` y lanza `INVALID_REQUEST_ID` (400) antes de
   cualquier SQL.
4. **Identidad autenticada:** `authenticate` exige `Authorization: Bearer`,
   verifica el JWT con `verifyToken` (`src/modules/auth/token.js:35-41`:
   firma HS256, `iss`, `aud` y `exp`) y publica `req.auth = { userId:
   payload.sub, role: payload.role }` (`authenticate.js:43`). Es la única
   fuente de identidad; query y body no participan.
5. **Policy consultada:** `getRequest` **no** consulta la policy. En
   `src/modules/requests/requests.service.js:90-92` hay un
   `TEMP(REQ-442)` que devuelve el mapper sin llamar a `canViewRequest`.
   La regla sí existe y es pura en
   `src/modules/requests/request.policy.js:20-23`; `patchRequest`
   (`requests.service.js:162`) y `getHistory` (`requests.service.js:224`)
   ya la usan. Ese es BUG-901.
6. **Service:** `getRequest(actor, id)` (`requests.service.js:86-93`) llama
   `findById(id)`; si no hay fila lanza `notFound(id)` (`resource`,
   `REQUEST_NOT_FOUND`, 404); si hay, devuelve `mapRequestRow(row)`.
7. **Store y query:** `findById` (`src/modules/requests/requests.store.js:50-56`)
   ejecuta `SELECT id, title, description, priority, status, assigned_to,
   created_by, created_at, updated_at FROM requests WHERE id = $1` con el id
   como parámetro; devuelve la fila o `null`.
8. **Fila → JSON:** `mapRequestRow` (`src/modules/requests/request.mapper.js:5-17`)
   convierte snake_case a camelCase, `id` a `Number`, `assigned_to` ausente a
   `null` y expone `assignedTo`, `createdBy`, `createdAt`, `updatedAt`.
9. **Respuesta y errores:** el handler responde `200` con el objeto
   (`requests.routes.js:30`). Un error lanzado por el handler es capturado
   por Express 5 y traducido por `errorHandler`
   (`src/middleware/error-handler.js:33-77`): `auth` → 401, `contract` →
   400, `resource` → 404; el cuerpo siempre es
   `{ error: { code, message }, requestId }`.
10. **Pruebas existentes:** `test/request-detail.test.js` cubre 401, 404 de
    id inexistente, owner 200 con schema congelado y agent 200;
    `test/requests.test.js:26-37` cubre la lectura del owner;
    `test/errors.test.js` cubre ids inválidos/inexistentes;
    `test/traceability.test.js` cubre `requestId`. Antes del fix, los dos
    casos de regresión de `test/request-detail.test.js:69,77` y los tres de
    `test/request-access-policy.test.js:19,24,29` seguían en `todo`: no
    cubrían el acceso ajeno todavía.

## 4. Database inventory

| Tabla | Claves y restricciones | Migración |
| --- | --- | --- |
| `users` | `id UUID PK DEFAULT gen_random_uuid()`; `email` UNIQUE; `password_hash` NOT NULL; `role` DEFAULT `requester` con CHECK `requester`/`agent`; `created_at` | `001_create_users.sql` |
| `requests` | `id BIGINT IDENTITY PK`; `title VARCHAR(200) NOT NULL`; `description TEXT`; `priority` DEFAULT `medium` con CHECK `low`/`medium`/`high`; `status` DEFAULT `open` con CHECK `open`/`in_progress`/`resolved`/`closed`/`cancelled`; `created_by UUID NOT NULL FK users ON DELETE RESTRICT`; `assigned_to UUID FK users`; timestamps | `002_create_requests.sql`; CHECKs e índices en `004`; `assigned_to` en `005` |
| `request_history` | `id BIGINT IDENTITY PK`; `request_id BIGINT NOT NULL FK requests`; `type` CHECK `status_changed`/`priority_changed`/`request_claimed`; pares `from_/to_status` y `from_/to_priority`; `changed_by UUID FK users`; `created_at` | `003_create_request_history.sql`; el CHECK se amplía en `005` |
| `schema_migrations` | `name TEXT PK`; `applied_at`; la crea el runner | `scripts/migrate.js:20-25` |

`scripts/migrate.js:27-66` aplica los `.sql` en orden lexicográfico, uno por
transacción, y salta los que ya están en `schema_migrations`; por eso una
segunda ejecución imprime `SKIPPED` y no reescribe migraciones aplicadas.

`scripts/seed.js` es repetible: crea o conserva los 3 usuarios
`*.seed@example.test`, borra **solo** las solicitudes e historial de esos
usuarios (`seed.js:64-72`) y recrea 6 solicitudes con 15 eventos (cada una
nace `open`, más el historial declarado en `SEED_REQUESTS`). Todo va en una
transacción con `ROLLBACK` en error (`seed.js:44-137`).

**Evidencia real (2026-10-23 10:05 -04):** `npm run db:migrate` → `001`–`005`
`[SKIPPED]`; `npm run db:seed` → 2 requesters, 1 agent, 6 requests, 15
history events y 1 solicitud ya asignada.

**Query del recorrido y mapper.** `findById`
(`src/modules/requests/requests.store.js:50-56`) usa
`SELECT ... FROM requests WHERE id = $1`; el id viaja como parámetro, nunca
interpolado. `mapRequestRow` (`src/modules/requests/request.mapper.js:5-17`)
traduce la fila snake_case al JSON público de 9 claves: `id`, `title`,
`description`, `priority`, `status`, `assignedTo`, `createdBy`, `createdAt`
y `updatedAt`.

**Pruebas como mapa.** `test/request-detail.test.js:19-67` documenta el
contrato sin leer el service: 401 sin token, 404 de id inexistente, 200 del
owner con las 9 claves congeladas y 200 del agent. Antes del fix, los dos
casos de visibilidad (`test/request-detail.test.js:69,77`) seguían como
`todo`: la asimetría entre una policy correcta y un endpoint sin red es
información, no ruido.

## 5. Authentication and authorization

**Autenticación.** `authenticate` (`src/middleware/authenticate.js:13-44`)
exige el esquema `Bearer`, verifica el token con `jwtVerify`
(`src/modules/auth/token.js:35-41`) usando `JWT_SECRET` (HS256) y valida
`iss`, `aud` y `exp`. Si falta el header, está vacío o el token no verifica,
lanza `AUTHENTICATION_REQUIRED` o `INVALID_TOKEN` (401). El payload solo
aporta identidad y rol; `req.auth` queda como `{ userId: payload.sub, role:
payload.role }` (`authenticate.js:37-43`). `token.js:8-10` hace fallar el
arranque si falta `JWT_SECRET`.

**Autorización.** Las reglas viven en
`src/modules/requests/request.policy.js`, funciones puras sobre `actor` y
`request`, sin Express ni SQL. La matriz está documentada en
`request.policy.js:6-14`. Ejemplo: `canViewRequest` devuelve `true` para
`agent` y para el `requester` cuyo `userId` coincide con `createdBy`
(`request.policy.js:20-23`); `canViewHistory` delega en ella
(`request.policy.js:25-27`). `getHistory` la consulta
(`requests.service.js:223-224`) y `patchRequest` usa `canViewRequest` antes
de editar (`requests.service.js:161-162`). `getRequest` **no** la consulta:
BUG-901.

**Pruebas.** `test/request-policy.test.js` prueba `canClaimRequest` sin
infraestructura; `test/request-access-policy.test.js` contiene los tres
casos puros de `canViewRequest` pero aún en `todo`. `test/auth.test.js`
cubre registro/login/`/auth/me` y `test/request-detail.test.js` cubre el
401 del detalle.

## 6. Errors, logs and operational checks

**Formato de error.** El único traductor es
`src/middleware/error-handler.js:33-77`. Toda respuesta de error tiene
`{ error: { code, message }, requestId }`; el status sale de la categoría
de `AppError` (`error-handler.js:18-24`): `contract` 400, `auth` 401,
`forbidden` 403, `resource` 404, `domain` 409. JSON inválido → 400
`INVALID_JSON`; base inalcanzable → 503 `DATABASE_UNAVAILABLE`; error
inesperado → 500 `INTERNAL_ERROR` con mensaje genérico, mientras nombre,
mensaje y stack van solo al log (`error-handler.js:65-74`).

**requestId.** `src/middleware/request-id.js:14-22` toma `X-Request-Id`
solo si cumple `^[A-Za-z0-9._-]{1,64}$`; si no, genera `req_<uuid>`. Lo
devuelve en el header y lo usa en el cuerpo de error y en los logs.

**Qué se registra y qué no.** `logger.js:9-25` escribe una línea JSON con
`timestamp`, `level` y `event`. `requestLogger` registra una allowlist:
`requestId`, `method`, `path`, `status`, `durationMs`, `userId` (si hubo
autenticación) y `errorCode` (`request-logger.js:21-29`). Nunca registra
headers, body, query, tokens ni contraseñas; `traceability.test.js:87-99`
lo verifica buscando el token y `Bearer` en las líneas capturadas.

**`/health` vs `/ready`.** `src/routes/health.routes.js:27-29` responde
`200 {"status":"ok"}` sin tocar PostgreSQL (liveness: si la base cae, el
proceso sigue vivo). `health.routes.js:31-45` ejecuta `SELECT 1` y responde
`200 {"status":"ready","database":"available"}` o `503
{"status":"not_ready","database":"unavailable"}`, registrando solo el
código del error. La comprobación es inyectable (`createHealthRouter`), por
eso `test/health.test.js:35-47` simula la caída sin tocar la base real.
Evidencia real: `curl /health` → 200; `curl /ready` → 200.

## 7. Minimum-practices audit

Clasificación registrada antes de aplicar el fix (2026-10-23 10:11 -04);
por eso Ownership sigue marcado `DOES_NOT_COMPLY` en este expediente.
Clasificaciones permitidas: COMPLIES · PARTIAL · DOES_NOT_COMPLY ·
NOT_FOUND · NOT_UNDERSTOOD. Cada fila cita evidencia o reconoce duda.

| Área | Pregunta | Clasificación | Evidencia / duda |
| --- | --- | --- | --- |
| Configuración | ¿Los secretos están fuera del código? | COMPLIES | `.env` está en `.gitignore:2`; `.env.example` deja `DATABASE_URL` y `JWT_SECRET` vacíos; `token.js:8-10` falla si falta el secreto. El seed usa contraseñas de demostración, no secretos reales. |
| Entrada | ¿Se validan datos externos? | COMPLIES | `parseIdParam` (`parse-id.js:16-21`), validación de title/priority/status (`requests.service.js:105-152`) y rechazo de campos del servidor (`requests.service.js:47-54`). |
| SQL | ¿Las consultas están parametrizadas? | COMPLIES | Consultas parametrizadas en `requests.store.js:43-45,51-54,62-67,83-89,97-103,109-115,122-128`; los nombres de columna son fijos del archivo. |
| Identidad | ¿El JWT se verifica? | COMPLIES | `jwtVerify` con algoritmos, issuer, audience y exp (`token.js:35-41`); el rol se valida contra `ROLES` (`authenticate.js:11,37-40`). |
| Permisos | ¿Existe autorización además de autenticación? | PARTIAL | Hay policies puras y se usan en create/patch/history/claim, pero `getRequest` no consulta `canViewRequest` (`requests.service.js:86-93`). |
| Ownership | ¿Se limita el acceso al propietario cuando corresponde? | DOES_NOT_COMPLY | Reproducción 2026-10-23 10:11: un requester ajeno obtuvo `200` con el id de otro; owner y agent también `200`. El service no llama la policy (`requests.service.js:90-92`). |
| Dominio | ¿Los campos del servidor están protegidos? | COMPLIES | `rejectServerControlledFields` (`requests.service.js:47-54`), transiciones (`requests.service.js:181-190`) y `createdBy`/`changedBy`/`assignedTo` desde `req.auth` (`118,125,201,210,260`). |
| Consistencia | ¿Las escrituras relacionadas usan transacción? | COMPLIES | `withTransaction` en create (`requests.service.js:113-128`), patch (`157-214`) y claim (`240-270`); el historial va en la misma transacción. |
| Errores | ¿Existe un formato consistente? | COMPLIES | `errorHandler` central con el mismo shape y sin stack/mensaje interno (`error-handler.js:33-77`); pruebas en `errors.test.js`. |
| Logs | ¿Ayudan a investigar sin exponer secretos? | COMPLIES | Allowlist en `request-logger.js:21-29`; `traceability.test.js:87-99` verifica que no aparezcan el token ni `Bearer`. |
| Pruebas | ¿Existen casos positivos y negativos? | PARTIAL | Hay positivos/negativos para auth, errores e historial, pero el acceso ajeno del detalle no está cubierto: 5 `todo` entre `request-detail.test.js` y `request-access-policy.test.js`. |
| Migraciones | ¿El esquema está versionado? | COMPLIES | `001`–`005` más `schema_migrations`; runner idempotente (`scripts/migrate.js:27-66`); evidencia `SKIPPED`. |
| Seed | ¿Puede repetirse de forma controlada? | COMPLIES | `scripts/seed.js:44-137` es transaccional, borra solo datos seed y es repetible; evidencia real de la ejecución. |
| Arquitectura | ¿HTTP, reglas y SQL están separados razonablemente? | COMPLIES | Router sin SQL (`requests.routes.js`), service sin HTTP/SQL (`requests.service.js:1-4`), store solo SQL (`requests.store.js:1-4`), policy pura (`request.policy.js:1-4`), mapper aislado (`request.mapper.js:1-3`). |
| Operación | ¿Health y readiness tienen propósitos distintos? | COMPLIES | `/health` sin base vs `/ready` con `SELECT 1` y 503 (`health.routes.js:27-45`); pruebas en `health.test.js`. |

## 8. Change impact

Completado antes de modificar código (2026-10-23 10:11 -04).

### Observable behavior

Hoy un `requester` autenticado obtiene `200` con el detalle de una solicitud
creada por otro usuario, incluso añadiendo `?userId=<owner>`. La
reproducción (2026-10-23 10:11 -04) dio: ajeno `200` (id 169), ajeno con
`?userId` `200`, owner `200`, agent `200`, inexistente `404
REQUEST_NOT_FOUND`, sin token `401 AUTHENTICATION_REQUIRED`.

Después del fix, el requester ajeno debe recibir `404
REQUEST_NOT_FOUND`, indistinguible de una solicitud inexistente. Owner y
agent conservan `200` y exactamente el mismo schema de 9 claves. No cambian
el 401 sin token, el 400 de id inválido, la lista, el historial, `patch`,
`claim` ni el formato de errores.

### Files likely affected

- `src/modules/requests/requests.service.js`: único cambio de producción;
  consultar `canViewRequest` dentro de `getRequest` después de mapear la
  fila y antes de devolverla, reutilizando `notFound(id)`.
- `test/request-detail.test.js`: activar los 2 `todo` de regresión.
- `test/request-access-policy.test.js`: activar los 3 `todo` de la policy.
- `activities/class-09/system-dossier.md` y `work-log.md`: evidencia y
  registro.
- No se toca el schema, el router, la policy, el store ni el mapper.

### Rule to protect

Un `requester` solo puede ver las solicitudes que creó; un `agent` puede ver
cualquiera. Una solicitud existente pero no visible se responde como
inexistente (`404`) para no confirmar su existencia.

### Data required

`actor.userId` y `actor.role` desde `req.auth` (token verificado);
`request.createdBy` desde la fila ya cargada por `findById`. No se necesitan
`userId`, `createdBy` ni `assignedTo` del query/body.

### Status codes

| Caso | Status | Código |
| --- | --- | --- |
| Sin token / token inválido | 401 | `AUTHENTICATION_REQUIRED` / `INVALID_TOKEN` |
| `id` no entero positivo | 400 | `INVALID_REQUEST_ID` |
| `id` inexistente | 404 | `REQUEST_NOT_FOUND` |
| Requester ajeno (aunque mande `userId`/`createdBy`) | 404 | `REQUEST_NOT_FOUND` |
| Owner requester | 200 | — |
| Agent | 200 | — |

### Tests to add or change

- Convertir `test/request-detail.test.js:69` (requester ajeno → 404, mismo
  código que inexistente) y el caso de `userId`/`createdBy` en query o body
  (no conceden acceso).
- Convertir `test/request-access-policy.test.js:19,24,29` (agent true,
  owner true, stranger false).
- Mantener el test de schema (`request-detail.test.js:47-50`) y la suite de
  regresión (`regression.test.js`) como contrato congelado.
- Ejecutar `npm run test:policy`, `npm run test:detail` y `npm test`.

### Behavior that must remain unchanged

- El schema de la respuesta autorizada: `assignedTo`, `createdAt`,
  `createdBy`, `description`, `id`, `priority`, `status`, `title`,
  `updatedAt` (9 claves).
- La lista sigue scoped en SQL para requesters (`requests.service.js:76-83`,
  `requests.store.js:34-40`).
- `GET /requests/:id/history` sigue aplicando `canViewHistory` y devolviendo
  404 al ajeno (`requests.service.js:219-227`).
- `POST /requests`, `PATCH /requests/:id` y `POST /requests/:id/claim`
  conservan sus reglas y transacciones.
- El formato de error y el `requestId` no cambian.

### Risks

- Responder `403` en vez de `404` rompería la decisión del sistema y
  confirmaría la existencia.
- Consultar la policy con datos del body/query en vez de `req.auth`
  reabriría el bypass.
- Bloquear al agent por error al aplicar la regla.
- Cambiar el mapper o el schema al tocar el service.
- Añadir una migración o una capa nueva, prohibido por el ticket.
- Mitigación: usar la policy pura existente, el mismo `notFound(id)` y
  ejecutar los tests de contrato y la suite completa antes de cerrar.

### Unknowns

- Por qué `TEMP(REQ-442)` desactivó la visibilidad y cuándo puede retirarse.
- Si soporte necesita un rol que vea solicitudes ajenas sin ser agent.
- Si `claim` debería consultar visibilidad además de rol/estado (hoy un
  agent ya puede ver todo).
- Si el orden `findById` → policy deja algún canal lateral (tiempo/errores)
  que el 404 no cubre.

## 9. Unknowns and questions

- ¿Cuál es el alcance real de `TEMP(REQ-442)`? No sé quién lo pidió, qué
  audita ni cuándo se retira; el comentario no lo explica.
- ¿El negocio necesita que un requester vea solicitudes de su equipo? Hoy
  la matriz solo permite owner o agent; si aparece ese caso, habría que
  añadir un rol/regla, no relajar `canViewRequest`.
- ¿`claim` debe comprobar visibilidad además de rol/estado? En la práctica
  un agent ve todo, pero la policy de claim no recibe `canViewRequest`.
- ¿La decisión 404-para-ajeno introduce diferencias de tiempo o de logs que
  permitan inferir existencia? El cuerpo es idéntico; el tiempo de
  `findById` existe en ambos casos, pero no lo he medido.
- ¿Por qué la suite anterior no cubría el acceso horizontal? La prueba del
  requester ajeno existía solo como stub `todo`; la policy estaba sana,
  pero el endpoint no la consultaba. No sé si fue intencional o un olvido,
  y esa asimetría es la duda que dejo abierta.
- ¿El `userId` del query se usa en algún otro endpoint? En el detalle no;
  conviene revisar que ningún módulo futuro lo tome como identidad.
