# 05 — Arquitectura ・ Architecture

> El mismo esqueleto del curso: capas con una sola responsabilidad y módulos por
> dominio independientes. Pensado para ESCALAR (v2) sin reescribir ni romper.

---

## Capas ・ Layers

```
routes  (HTTP: verbo+URL, responde con respondError)
   │
   v
service (orquesta: valida input, aplica política, define unidades de trabajo)
   │
   ├── policy   (can*: ¿el actor tiene permiso?) ・ sin SQL ni HTTP
   ├── store    (SQL puro: queries)             ・ sin reglas
   └── mapper   (forma del contrato: camelCase, oculta secrets)
   │
   v
respond-error  (AppError → status HTTP)   ·   authenticate (JWT → req.auth)
```

- **routes** no conoce SQL ni reglas de negocio.
- **service** no conoce SQL ni status HTTP.
- **policy** es una función pura, testeable sin base de datos.
- **store** solo SQL con parámetros ($1,...) — cero concatenación.

---

## Módulos por dominio ・ Domain modules

```
src/modules/
├── auth/     # register, login, me (usuarios + token + middleware authenticate)
├── shop/     # products: store/policy/mapper/service/routes
└── orders/   # orders + payments + events: store/policy/mapper/service/routes
```

Regla de oro: un módulo **no importa el store de otro**; se comunica vía service o
directamente por su store SOLO si comparte tabla base. `auth` aporta `authenticate`
y el patrón de `users`. Los módulos pueden evolucionar sin romper el resto.

---

## Flujo de ejemplo: `POST /orders/:id/pay` ・ Example flow

1. `authenticate` valida el Bearer → `req.auth = { userId, role }`.
2. `routes` → `orders.service.payOrder(auth, id, { paymentRef })`.
3. `service` valida el body (`paymentRef` requerido) y consulta `findOrderById`.
4. Si `!canPayOrder(actor, order)` → `notFound(order.id)` (404 idéntico a ajeno).
5. Si `order.status !== 'pending'` → `AppError 409 ORDER_NOT_PAYABLE`.
6. **`withTransaction`** hace atómicos:
   - buscar el pago por `payment_ref` (si existe → devolver el resultado previo: idempotencia);
   - `INSERT payments` (si `payment_ref` duplica → `ON CONFLICT` → misma respuesta);
   - `UPDATE orders SET status='paid'` + `stock = stock - cantidad` por cada item;
   - `INSERT order_events` (nacimiento→paid, changed_by).
   - Si `stock < 0` por el `CHECK` → rollback → `409 INSUFFICIENT_STOCK`.
7. `mapper` da forma al body → `200`.

---

## Mecanismos clave ・ Key mechanisms

| Mecanismo | Dónde vive ・ Where | Qué garantiza |
| --- | --- | --- |
| `withTransaction` | `src/database/transaction.js` | Pedido/pago/stock/evento atómicos |
| Idempotencia | `UNIQUE(payment_ref)` + `ON CONFLICT` | Pagar 2 veces = mismo resultado |
| Stock seguro | `CHECK (stock >= 0)` + transacción | Nunca negativo |
| Historial | `order_events` insert en cada cambio | Auditoría completa y ordenada |
| Anti-enumeración | policy reutilizada para ver/historial | El 404 no revela existencia |
| Errores tipados | `respond-error.js` (categoría→status) | Contrato estable por fuera |

---

## Escalar a v2 sin romper ・ Growing to v2 without breaking

Regla: **agregar, nunca modificar contratos v1**.

- **`variants` de producto** (sabor/tamaño como entidad): nueva tabla
  `product_variants` + nuevos campos opcionales en `POST /products` (BC: campos
  nuevos opcionales; respuestas v1 intactas).
- **Cupones / envío / impuestos:** nuevas tablas + nuevos endpoints `POST /orders/:id/apply-coupon`…
- **Rol soporte (`agent`):** agregar valor a `role` en DB + contrato `ROLES` del
  authenticate; los `can*` nuevos son funciones nuevas, no cambios de las actuales.
- **Webhooks / notificaciones:** nuevo módulo `notifications`, desacoplado.

Un cambio de contrato solo es lícito para **v2 breaking** con versión en la URL
(`/v2/...`) y deprecación anunciada.

---

## Seguridad ・ Security

- `DATABASE_URL` y `JWT_SECRET` SOLO en `.env` (gitignore). Nunca en respuestas ni logs.
- Contraseñas con `bcrypt.hash`; el API nunca devuelve `password_hash`.
- JWT firmado con `iss`/`aud` propias; el middleware rechaza tokens que no matcheen.
- Errores 500 genéricos afuera; detalle (stack, SQL) solo en consola del servidor.
- SQL siempre parametrizado (sin concatenar inputs).