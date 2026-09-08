# Contrato de autenticación — Request API v5

Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
(código HTTP + `error.code`).

## Resumen de acceso

| Método y ruta | Acceso | Necesita token |
| ------------- | ------ | :------------: |
| `POST /auth/register` | Público (Anónimo) | No |
| `POST /auth/login` | Público (Anónimo) | No |
| `GET /auth/me` | Protegido | Sí (`Bearer`) |
| `GET /requests` | Protegido | Sí (`Bearer`) |
| `GET /requests/:id` | Protegido | Sí (`Bearer`) |
| `GET /requests/:id/history` | Protegido | Sí (`Bearer`) |
| `POST /requests` | Protegido | Sí (`Bearer`) |
| `PATCH /requests/:id` | Protegido | Sí (`Bearer`) |

La autorización sobre `/requests` se decide DESPUÉS de la autenticación, según
rol y propiedad (ver `docs/http-contract.md` y la matriz de acceso). Aquí solo
se documentan los endpoints de auth.

## Controles del servidor

Campos que el cliente JAMÁS debe enviar: su valor lo decide el backend, nunca
el body. Enviarlos produce `400 SERVER_CONTROLLED_FIELD` — rechazo explícito,
no se ignoran en silencio.

| Campo | Fuente de verdad | Si el cliente lo envía |
| ----- | ---------------- | ---------------------- |
| `role` | servidor, siempre `requester` | `400 SERVER_CONTROLLED_FIELD` |
| `id` | base de datos (UUID) | `400 SERVER_CONTROLLED_FIELD` |
| `createdAt` / `updatedAt` | servidor | `400 SERVER_CONTROLLED_FIELD` |
| `createdBy` | payload verificado del JWT (`req.auth.userId`) | `400 SERVER_CONTROLLED_FIELD` |
| `changedBy` | payload verificado del JWT | `400 SERVER_CONTROLLED_FIELD` |
| `passwordHash` | servidor (hash derivado) | `400 SERVER_CONTROLLED_FIELD` |
| `status` | servidor: `open` al nacer, máquina de estados después | `400 SERVER_CONTROLLED_FIELD` |

La identidad que da valor a `createdBy`/`changedBy` proviene del token
verificado en el middleware (`authenticate.js`), el único origen confiable —
nunca del body.

## POST /auth/register

* Acceso: **Público** — no requiere token.
* Body permitido: `email`, `password`. **Allowlist**: cualquier otro campo
  (en especial `role`, `id`, `createdAt`, `updatedAt`, `createdBy`,
  `passwordHash`) produce `400 SERVER_CONTROLLED_FIELD`. Rechazo explícito,
  nunca se ignora en silencio.
* `email`: requerido, formato básico (trim + lowercase antes de almacenar)
  → `400 INVALID_EMAIL`.
* `password`: string de 15 a 128 caracteres (code points), Unicode y espacios
  permitidos, sin reglas arbitrarias → `400 INVALID_PASSWORD`. Nunca se loguea.
* El rol SIEMPRE se asigna en el servidor como `requester`. La promoción a
  `agent` es operación docente (SQL), nunca desde el body.
* Éxito: `201` → `{ "id": "<uuid>", "email": "…", "role": "requester", "createdAt": "…" }`.
* Email duplicado (conflicto): `409 ACCOUNT_CANNOT_BE_CREATED` con mensaje
  genérico — la respuesta no confirma que el email exista (anti-enumeración).

## POST /auth/login

* Acceso: **Público** — no requiere token.
* Body permitido: `email`, `password`.
* Éxito: `200` →

```json
{ "accessToken": "<jwt>", "tokenType": "Bearer", "expiresIn": 3600 }
```

* Cualquier fallo (email inexistente, password incorrecta, cuenta no
  disponible) responde invariablemente `401 INVALID_CREDENTIALS` con mensaje
  idéntico byte a byte: `"Email or password is incorrect."`. La respuesta nunca
  dice qué dato falló.

## GET /auth/me

* Acceso: **Protegido** — requiere `Authorization: Bearer <token>`.
* Sin header, con esquema distinto a `Bearer` (por ejemplo `Basic …`), o con
  `Bearer ` vacío → `401 AUTHENTICATION_REQUIRED`.
* Token presente pero no verificable (firma alterada, vencido, emisor o
  audiencia distintos, firmado con otra clave) → siempre `401 INVALID_TOKEN`.
  Una sola respuesta: nunca explica cuál chequeo falló.
* Éxito: `200` → `{ "id": "<uuid>", "email": "…", "role": "requester" }`.
* Nunca devuelve password, hash, salt ni material de firma.

## Semántica de errores

El `error.code` va siempre dentro de `{ "error": { "code", "message" } }`.

| Código HTTP | Criterio | `error.code` de auth |
| ----------- | -------- | -------------------- |
| `400` | El cliente rompió el contrato: campo controlado por el servidor, email/password inválidos, filtro inválido | `SERVER_CONTROLLED_FIELD`, `INVALID_EMAIL`, `INVALID_PASSWORD`, `INVALID_FILTER` |
| `401` | **No hay identidad confiable.** Sin credenciales válidas, sin esquema Bearer, token inválido/vencido/manipulado, o credenciales de login fallidas | `AUTHENTICATION_REQUIRED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` |
| `403` | **Hay identidad, pero la operación está prohibida para ese actor.** Solo se evalúa tras autenticar | `FORBIDDEN` |
| `404` | **El recurso no existe, o no conviene revelar que existe.** Un recurso ajeno responde idéntico a uno inexistente | `REQUEST_NOT_FOUND` |
| `409` | **Conflicto con el estado actual del recurso** | `ACCOUNT_CANNOT_BE_CREATED`, `INVALID_STATUS_TRANSITION`, `REQUEST_IN_TERMINAL_STATUS` |
| `500` | Error inesperado (sin stack ni secretos) | `INTERNAL_ERROR` |
| `503` | Base de datos inaccesible | `DATABASE_UNAVAILABLE` |

Criterio de frontera entre 401 y 403:
* `401` cuando el servidor NO puede decir quién eres (autenticación).
* `403` cuando SÍ sabe quién eres pero el rol/propiedad no habilita esa
  operación (autorización). Ejemplo: `agent` creando una solicitud → `403`;
  `requester` cambiando prioridad/estado → `403`.
* `404` se usa además como protección de existencia: ID ajeno e ID inexistente
  responden exactamente igual.