# 04 — Contrato de API ・ API contract

> Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
> protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
> (código HTTP + `error.code`). Errores tipados `{ "error": { "code", "message" } }`.
>
> Reglas transversales: listas vacías con filtro válido → **200 `[]`**; recurso
> ajeno responde **idéntico** a inexistente (anti-enumeración).

---

## Resumen de acceso ・ Access summary

| Método y ruta ・ Method & route | Acceso | Necesita token |
| --- | --- | :-: |
| `POST /auth/register` | Público ・ Public (Anónimo) | No |
| `POST /auth/login` | Público ・ Public (Anónimo) | No |
| `GET /auth/me` | Protegido ・ Protected | Sí (`Bearer`) |
| `GET /products` | Público ・ Public (catálogo activo) | No |
| `GET /products/:id` | Público ・ Public (solo activos) | No |
| `POST /products` | Protegido + rol `admin` | Sí (`Bearer`) |
| `PATCH /products/:id` | Protegido + rol `admin` | Sí (`Bearer`) |
| `POST /orders` | Protegido + rol `customer` | Sí (`Bearer`) |
| `GET /orders` | Protegido | Sí (`Bearer`) |
| `GET /orders/:id` | Protegido | Sí (`Bearer`) |
| `GET /orders/:id/history` | Protegido | Sí (`Bearer`) |
| `POST /orders/:id/pay` | Protegido + `customer` propietario | Sí (`Bearer`) |
| `PATCH /orders/:id/status` | Protegido + rol `admin` | Sí (`Bearer`) |
| `PATCH /orders/:id/cancel` | Protegido (`customer` propio o `admin`) | Sí (`Bearer`) |

La **autorización** sobre `/orders` se decide DESPUÉS de la autenticación, según
rol y propiedad (`customer_id` del pedido vs `req.auth.userId`) — ver la matriz
en `docs/02-roles-permisos.md`.

---

## 🔐 Especificación y claims del JWT ・ JWT spec & claims

> Payload emitido en el login y verificado en cada petición protegida. Estrictamente
> estos claims (patrón del curso; cambian `iss`, `aud` y los valores de `role`):

| Claim | Significado ・ Meaning |
| --- | --- |
| 🆔 **`sub` (Subject)** | UUID del usuario en la base. Fuente de verdad de ownership (`req.auth.userId`). |
| 👤 **`role`** | `customer` o `admin`. Usado por la autorización. |
| 🏛️ **`iss` (Issuer)** | `yoghurt-api` (identifica al emisor, evita confusión de emisores). |
| 🎯 **`aud` (Audience)** | `yoghurt-client` (destinatario previsto; evita reutilización cruzada). |
| ⏱️ **`iat` (Issued At)** | Timestamp Unix de emisión. |
| ⏳ **`exp` (Expiration)** | Vida de **1 hora** (`3600` s). |

### ⚖️ Decodificar vs. Verificar ・ Decode vs. Verify

> 🔓 **`jwt.decode`**: traduce Base64url → JSON **sin validar firma**. Inseguro solo
> para autenticación: un atacante podría alterar el payload (p. ej. su `role`).
>
> 🔒 **`jwt.verify`**: decodifica Y recalcula la firma con `JWT_SECRET` (`HS256`),
> validando `exp`, `iss`, `aud` y firma. Cualquier incumplimiento → unívocamente
> `401 INVALID_TOKEN`. Es el ÚNICO camino usado por `authenticate.js`.

---

## Controles del servidor ・ Server-controlled fields

La identidad que da valor a `customerId`/`changedBy` proviene del token verificado
en `authenticate.js`, **nunca del body**. Enviar estos campos → **`400 SERVER_CONTROLLED_FIELD`**
(rechazo explícito, jamás se ignoran en silencio — ignorar permitiría escalación).

| Operación ・ Operation | Campos controlados (server-owned) |
| --- | --- |
| `POST /auth/register` | `role` (siempre `customer`), `id`, `createdAt`, `updatedAt` |
| `GET/POST/PATCH /products` | `id`, `createdAt`, `updatedAt` |
| `POST /orders` | `customerId` (del JWT), `status` (nace `pending`), `totalCents` (calculado), `id`, `createdAt`, `updatedAt`, `changedBy` |
| `POST /orders/:id/pay` | `orderId` (de la ruta), `amountCents` (calculado), `paidAt` (servidor), `changedBy` |
| `PATCH /orders/:id/status` · `/cancel` | `status` (máquina de estados), `changedBy` (del JWT), `id`, `updatedAt` |

---

## Detalle por endpoint ・ Per-endpoint contract

### `POST /auth/register` — Crear cuenta
* **Acceso:** Público. Sin token.
* **Body permitido (allowlist):** `email`, `password`. Cualquier otro campo
  (`role`, `id`, `createdAt`, …) → `400 SERVER_CONTROLLED_FIELD`.
* **Reglas:** `email` requerido, formato básico (trim + lowercase) → `400 INVALID_EMAIL`.
  `password` string de 15 a 128 code points → `400 INVALID_PASSWORD`. El rol se
  asigna **siempre `customer`** en el servidor.
* **Éxito `201`:**
  ```json
  { "id": "<uuid>", "email": "ana@greek.example.test", "role": "customer", "createdAt": "..." }
  ```
* **Errores:** `400 SERVER_CONTROLLED_FIELD` · `400 INVALID_EMAIL` · `400 INVALID_PASSWORD` ·
  `409 ACCOUNT_CANNOT_BE_CREATED` (email duplicado, mensaje genérico — anti-enumeración) · `503 DATABASE_UNAVAILABLE`.

### `POST /auth/login` — Iniciar sesión
* **Acceso:** Público.
* **Body:** `email`, `password`.
* **Éxito `200`:**
  ```json
  { "accessToken": "<jwt>", "tokenType": "Bearer", "expiresIn": 3600 }
  ```
* **Errores:** cualquier fallo (email inexistente, password incorrecta) → siempre
  `401 INVALID_CREDENTIALS` con mensaje byte a byte idéntico: `"Email or password is incorrect."` · `503`.

### `GET /auth/me` — Identidad del token
* **Acceso:** Protegido. `Authorization: Bearer <token>`.
* **Sin header / `Basic …` / `Bearer ` vacío → `401 AUTHENTICATION_REQUIRED`.**
* **Token no verificable** (firma/exp/iss/aud) → siempre `401 INVALID_TOKEN` (una sola respuesta).
* **Éxito `200`:** `{ "id": "<uuid>", "email": "...", "role": "customer|admin" }`.
  Nunca devuelve `password_hash` ni material de firma.
* **Errores:** `401 AUTHENTICATION_REQUIRED` · `401 INVALID_TOKEN` · `503`. · `403` no aplica (no hay operación a autorizar).

### `GET /products` — Catálogo activo
* **Acceso:** Público (sin token).
* **Query permitida:** `flavor`, `sizeMl`, `maxPriceCents` (filtros opcionales y compuestos).
* **Éxito `200`:** array de productos `active:true`, ordenados por `title`:
  ```json
  [
    { "id": 5, "sku": "YOG-500-GR", "title": "Yogur Griego Natural 500g",
      "flavor": "natural", "sizeMl": 500, "priceCents": 350, "stock": 120 }
  ]
  ```
  Cero matches → `200 []` (nunca 404).
* **Errores:** `400 INVALID_FILTER` (filtro desconocido/malformado) · `503`.

### `GET /products/:id` — Un producto
* **Acceso:** Público.
* **Éxito `200`:** el producto **activo** con la forma de arriba.
* **Errores:** `404 PRODUCT_NOT_FOUND` para **inexistente o inactivo** (mismo body
  exacto; no se revela si el producto solo fue desactivado) · `400 INVALID_INPUT` si
  `id` no es numérico · `503`. (El admin reactiva vía `PATCH`, que sí encuentra inactivos.)

### `POST /products` — Crear producto (admin)
* **Acceso:** Protegido + `role: admin`.
* **Body (allowlist):** `sku`, `title`, `flavor?`, `sizeMl?`, `priceCents`, `stock?`.
  Campos controlados (`id`, `createdAt`, …) → `400 SERVER_CONTROLLED_FIELD`.
* **Reglas:** `priceCents > 0`, `stock >= 0` → `400 INVALID_INPUT`.
* **Éxito `201`:** producto completo (forma de arriba).
* **Errores:** `400 SERVER_CONTROLLED_FIELD` · `400 INVALID_INPUT` · `401` ·
  `403 FORBIDDEN` (no admin) · `409 SKU_ALREADY_EXISTS` (sku duplicado) · `503`.

### `PATCH /products/:id` — Editar producto / stock (admin)
* **Acceso:** Protegido + `role: admin`.
* **Body parcial (allowlist):** `sku?`, `title?`, `flavor?`, `sizeMl?`, `priceCents?`, `stock?`, `active?`.
* **Éxito `200`:** producto actualizado.
* **Errores:** `400 SERVER_CONTROLLED_FIELD` · `400 INVALID_INPUT` (ej. `stock < 0`) ·
  `401` · `403 FORBIDDEN` · `404 PRODUCT_NOT_FOUND` (inexistente) ·
  `409 SKU_ALREADY_EXISTS` · `503`.

### `POST /orders` — Crear pedido (customer)
* **Acceso:** Protegido + `role: customer`.
* **Body (allowlist):**
  ```json
  { "items": [ { "productId": 5, "quantity": 2 } ] }
  ```
  `customerId`, `status`, `totalCents`, `changedBy` → `400 SERVER_CONTROLLED_FIELD`.
* **Reglas:** `items` requerido, no vacío, `quantity > 0`, productos existentes y **activos**
  → `400 INVALID_INPUT` / `404 PRODUCT_NOT_FOUND`. El stock NO se descuenta aquí.
* **Éxito `201`:**
  ```json
  {
    "id": 41, "status": "pending", "totalCents": 1050,
    "items": [ { "productId": 5, "quantity": 2, "unitPriceCents": 350 } ]
  }
  ```
* **Errores:** `400 SERVER_CONTROLLED_FIELD` · `400 INVALID_INPUT` · `401` ·
  `403 FORBIDDEN` (admin/agente no crea pedidos) · `404 PRODUCT_NOT_FOUND` · `503`.

### `GET /orders` — Lista de pedidos
* **Acceso:** Protegido.
* **Scope:** `customer` → **Propias** (`customer_id = req.auth.userId`, filtrado en SQL);
  `admin` → **Todas**.
* **Query:** `?status=` (cualquier estado válido) · `?minTotalCents=` · descartado por default.
* **Éxito `200`:** array de pedidos con sus ítems. Cero matches → `200 []`.
* **Errores:** `400 INVALID_FILTER` · `401` · `503`.

### `GET /orders/:id` — Un pedido
* **Acceso:** Protegido. `customer` (solo suyo) o `admin` (cualquiera).
* **Éxito `200`:** pedido con ítems.
* **Errores:** `400 INVALID_INPUT` (id no numérico) · `401` ·
  `404 ORDER_NOT_FOUND` — **ajeno e inexistente responden idéntico** (anti-enumeración) · `503`.

### `GET /orders/:id/history` — Historial
* **Acceso:** Protegido. Misma visibilidad que `GET /orders/:id` (se reutiliza la política de ver).
* **Éxito `200`:** array de eventos ordenado cronológicamente (nacimiento primero):
  ```json
  [
    { "type": "status_changed", "fromStatus": null, "toStatus": "pending", "createdAt": "..." },
    { "type": "status_changed", "fromStatus": "pending", "toStatus": "paid", "createdAt": "..." }
  ]
  ```
* **Errores:** `401` · `404 ORDER_NOT_FOUND` (ajeno/inexistente idéntico) · `503`.
  Nunca expone `changed_by` ni material sensible.

### `POST /orders/:id/pay` — Pago idempotente (customer, propio)
* **Acceso:** Protegido + `role: customer` + propietario.
* **Body (allowlist):** `{ "paymentRef": "pay-2026-0001-ana" }` (`paymentRef` requerido).
  `amountCents`, `paidAt`, `orderId`, `changedBy` → `400 SERVER_CONTROLLED_FIELD`.
* **Reglas:** descuenta stock por ítem en transacción; `CHECK stock >= 0` protege contra negativo.
* **Éxito `200`:**
  ```json
  { "status": "paid", "paymentRef": "pay-2026-0001-ana", "paidAt": "..." }
  ```
  **Idempotente:** repetir con el mismo `paymentRef` devuelve la MISMA respuesta; sin doble débito.
* **Errores:** `400 SERVER_CONTROLLED_FIELD` (o `400 INVALID_INPUT` si falta `paymentRef`) ·
  `401` · `403 FORBIDDEN` (role sin permiso) · `404 ORDER_NOT_FOUND` (ajeno o inexistente, idéntico) ·
  `409 ORDER_NOT_PAYABLE` (estado ≠ `pending`) · `409 INSUFFICIENT_STOCK` ·
  `409 PAYMENT_REF_USED_ELSEWHERE` (ref usado en otro pedido) · `503`.

### `PATCH /orders/:id/status` — Transición (admin)
* **Acceso:** Protegido + `role: admin`.
* **Body (allowlist):** `{ "status": "shipped" }`. `changedBy` → `400 SERVER_CONTROLLED_FIELD`.
* **Reglas:** transición válida según la máquina (`paid→shipped→delivered`).
* **Éxito `200`:** el pedido con su nuevo estado.
* **Errores:** `400 SERVER_CONTROLLED_FIELD` · `400 INVALID_INPUT` ·
  `401` · `403 FORBIDDEN` (no admin) · `404 ORDER_NOT_FOUND` ·
  `409 INVALID_TRANSITION` · `503`.

### `PATCH /orders/:id/cancel` — Cancelar
* **Acceso:** Protegido. `customer` (solo suyo) o `admin` (cualquiera). Sin body.
* **Reglas:** solo en `pending`/`paid`; estados terminales (`shipped`, `delivered`, `cancelled`) → rechazo.
* **Éxito `200`:** `{ "id": ..., "status": "cancelled", ... }`.
* **Errores:** `401` · `403 FORBIDDEN` · `404 ORDER_NOT_FOUND` (ajeno/inexistente) ·
  `409 INVALID_TRANSITION` · `503`.

---

## Semántica de errores ・ Error semantics

| Código HTTP | Criterio | `error.code` posibles |
| --- | --- | --- |
| `400` | El cliente rompió el contrato (campos controlados, body inválido, filtro inválido) | `SERVER_CONTROLLED_FIELD`, `INVALID_EMAIL`, `INVALID_PASSWORD`, `INVALID_FILTER`, `INVALID_INPUT` |
| `401` | **No hay identidad confiable.** Sin credenciales, mal esquema, token inválido, login fallido | `AUTHENTICATION_REQUIRED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` |
| `403` | **Hay identidad pero la operación está prohibida** para ese actor (solo tras autenticar) | `FORBIDDEN` |
| `404` | **El recurso no existe, o no conviene revelar que existe.** Ajeno = inexistente | `PRODUCT_NOT_FOUND`, `ORDER_NOT_FOUND` |
| `409` | Conflicto con el estado actual del recurso | `ACCOUNT_CANNOT_BE_CREATED`, `SKU_ALREADY_EXISTS`, `INSUFFICIENT_STOCK`, `INVALID_TRANSITION`, `ORDER_NOT_PAYABLE`, `PAYMENT_REF_USED_ELSEWHERE` |
| `500` | Error inesperado (sin stack ni secretos) | `INTERNAL_ERROR` |
| `503` | Base de datos inaccesible | `DATABASE_UNAVAILABLE` |

### Frontera 401 vs 403 ・ 401 vs 403 boundary
* `401` cuando el servidor **NO puede decir quién eres** (autenticación).
* `403` cuando **SÍ sabe quién eres** pero rol/propiedad no habilita la operación
  (autorización). Ejemplo: `admin` creando un pedido → `403`; `customer` llamando
  `PATCH /orders/:id/status` → `403`.
* `404` como protección de existencia: `ORDER_NOT_FOUND` idéntico para ajeno e inexistente.

---

## Reglas de contrato ・ Contract rules

1. **Colecciones:** `GET /orders?status=X` sin matches → `200 []` (nunca 404).
2. **Anti-enumeración:** `GET /orders/:id` ajeno → `404 ORDER_NOT_FOUND` idéntico a inexistente.
3. **Idempotencia:** repetir `POST /orders/:id/pay` con el mismo `payment_ref` → misma respuesta.
4. **Snapshot:** `order_items.unit_price_cents` no cambia si el producto luego cambia de precio.
5. **No-revelación:** un producto `active:false` responde `404` igual que inexistente en
   `GET /products/:id` (solo `PATCH` de admin lo encuentra para reactivar).
6. **Campos server-owned** enviados por el cliente → `400 SERVER_CONTROLLED_FIELD`, jamás
   silencio ni aplicación del valor.