# 02 — Roles y permisos ・ Roles & permissions

> Basado en el patrón de políticas `can*` y la matriz RBAC+ownership del curso.
> Los roles se validan del payload del JWT (`role`). Autorización SIEMPRE tras
> autenticación: `401` si no hay identidad; `403` si hay identidad sin permiso;
> `404` como protección de existencia.

---

## Definición ・ Definition

### `customer` ・ Cliente
- **EN:** Registers, browses the catalog, creates orders and pays for **only their
  own** orders. Cannot manage products or see other customers' orders.
- **ES:** Se registra, recorre el catálogo, crea pedidos y paga **solo los suyos**.
  No administra productos ni ve pedidos de otros.

### `admin` ・ Administrador
- **EN:** Store operator/manager. Manages the product catalog and sees **every**
  order (global scope). Moves orders through the state machine and can cancel
  any order in `pending`/`paid`.
- **ES:** Encargado de la tienda. Administra el catálogo y ve **todos** los pedidos
  (scope global). Avanza la máquina de estados (`paid→shipped→delivered`) y puede
  cancelar cualquier pedido en `pending`/`paid`.

> **Puente con el curso ・ Bridge to the course:** `admin` ≈ `agent` de clase 06
> (mismo patrón de política, otro nombre de dominio). `customer` ≈ `requester`.
> **Solo existen DOS roles** en la implementación: `customer` y `admin`.

---

## Matriz de control de acceso ・ Access control matrix (RBAC + Ownership)

| Operación ・ Operation | Anónimo | `customer` | `admin` |
| :--- | :---: | :---: | :---: |
| `POST /auth/register` | Sí | Sí | Sí |
| `POST /auth/login` | Sí | Sí | Sí |
| `GET /auth/me` | No | Sí | Sí |
| `GET /products` (catálogo activo) | Sí | Sí | Sí |
| `GET /products/:id` (activo) | Sí | Sí | Sí |
| `POST /products` | No | No | Sí |
| `PATCH /products/:id` | No | No | Sí |
| `POST /orders` | No | Sí | No |
| `GET /orders` | No | Propias | Todas |
| `GET /orders/:id` | No | Propias | Todas |
| `GET /orders/:id/history` | No | Propias | Todas |
| `POST /orders/:id/pay` | No | Propias (en `pending`) | No |
| `PATCH /orders/:id/status` | No | No | Sí |
| `PATCH /orders/:id/cancel` | No | Propias (en `pending`/`paid`) | Sí (en `pending`/`paid`) |

> **Leyenda de reglas de seguridad:**
> * **Propias:** el servidor valida que `customer_id` del recurso sea idéntico al
>   `sub` del JWT (`req.auth.userId`). Se aplica en la consulta y al leer por id.
> * **"en `pending`/…" (Propia y abierta):** propiedad **Y** estado permitido por la
>   máquina de estados (mismo espíritu que "Propia y abierta" del curso: propiedad +
>   condición de estado).
> * **Todas:** el actor ve toda la colección, incluidas órdenes de cualquier dueño.
> * **Anónimo:** sin token. Solo auth y catálogo activo.
> * **Separación de funciones ・ Segregation of duties:** `admin` no crea ni paga
>   pedidos (es proveedor logístico, no comprador); `customer` no administra el
>   catálogo ni fuerza transiciones.

---

## Campos controlados por el servidor ・ Server-controlled fields

Nunca deben llegar desde el body. Su fuente de verdad es el servidor; enviarlos →
**`400 SERVER_CONTROLLED_FIELD`** (rechazo explícito, jamás se ignoran en silencio).

### En el Registro (`POST /auth/register`)
* `role`: el servidor asigna forzosamente `customer`. Nunca del body.
* `id`, `createdAt`, `updatedAt`: generados por la base/servidor.

### En Productos (`POST/PATCH /products`)
* `id`, `createdAt`, `updatedAt`: inmutables desde la petición.
* (stock/price/active/others los controla `admin` vía body; no son server-owned).

### En Pedidos (`POST /orders`)
* `customerId`: extraído únicamente del JWT verificado (`req.auth.userId`), nunca del body.
* `status`: en la creación, el servidor asigna forzosamente `pending`.
* `totalCents`: calculado por el servidor desde el snapshot de precios.
* `id`, `createdAt`, `updatedAt`, `changedBy`: inmutables desde la petición.

### En Pagos / Transiciones (`POST /orders/:id/pay`, `PATCH .../status`, `.../cancel`)
* `amountCents` (calculado), `paidAt` (servidor), `orderId` (de la ruta).
* `status` (lo decide la máquina de estados), `changedBy` (del JWT), `id`, `updatedAt`.

> **Validación estricta (implementada):** allowlist de campos; si llega un campo
> controlado → `400 SERVER_CONTROLLED_FIELD` en lugar de aplicarlo o ignorarlo —
> ignorar en silencio permitiría escalación de rol.

---

## Productos desactivados / no-revelación ・ Inactive products / no-leak

* **¿Quién los ve?** Nadie por lectura pública: `GET /products` y `GET /products/:id`
  solo alcanzan `active:true`; un `active:false` responde **`404 PRODUCT_NOT_FOUND`
  idéntico** a un inexistente (no revelamos que existió).
* **Excepción operativa:** `PATCH /products/:id` (admin) SÍ encuentra el registro
  inactivo para poder reactivarlo.

**¿Por qué el 404 idéntico?** Si el público distinguiera "no existe" de "está
desactivado", filtraría información interna del catálogo (data leak) — mismo
principio del `404` anti-enumeración del curso para registros ajenos/huérfanos.

---

## Ciclo de vida por actor ・ Lifecycle per actor

- **customer:** `crear → pagar → (ver historial)` ; `cancelar` suyo en `pending`/`paid`.
- **admin:** `preparar catálogo → transicionar paid→shipped→delivered` ; `cancelar` cualquiera.
- **sistema ・ system:** registra un `order_events` por cada acción anterior.

---

## Reglas de asignación ・ Assignment rules

- El registro (`/auth/register`) crea SIEMPRE `customer`.
- `admin` se otorga únicamente por el **seed** (o un helper de test que promueve su
  propio usuario sintético). **Jamás se auto-registra.**
- El payload del JWT lleva `role`; `authenticate.js` valida que esté en
  `['customer', 'admin']` y lo deja en `req.auth = { userId, role }`.

---

## Mapeo a políticas (implementación futura) ・ Mapping to policies

```
shop.canManageProducts(actor)    → admin
orders.canCreateOrder(actor)     → customer
orders.canViewOrder(actor, order)→ customer -> own · admin -> any
orders.canPayOrder(actor, order) → customer && own
orders.canReadHistory(actor, order) → canViewOrder
orders.canTransition(actor, order, to) → admin + transición válida
orders.canCancel(actor, order)   → (customer && own) || admin; solo pending/paid
```

> Reutilizar la política de VER para el HISTORIAL garantiza coherencia
> (misma regla, cero divergencia de seguridad).