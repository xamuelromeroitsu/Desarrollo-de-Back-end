# 03 — Modelo de datos ・ Data model

> Esquema versionado en `database/migrations/*.sql` con ledger `schema_migrations`.
> Conceptos aplicados del curso: FKs, `CHECK`, `UNIQUE`, máquina de estados,
> historial de eventos, cleanup en orden de dependencias.

---

## Tablas ・ Tables

### `users`
| columna | tipo | constraints |
| --- | --- | --- |
| `id` | uuid | PK, default gen_random_uuid() |
| `email` | text | UNIQUE, NOT NULL |
| `password_hash` | text | NOT NULL |
| `role` | text | NOT NULL, CHECK (role IN ('customer','admin')) |
| `created_at` | timestamptz | NOT NULL default now() |

### `products`
| columna | tipo | constraints |
| --- | --- | --- |
| `id` | bigint | PK, generado |
| `sku` | text | UNIQUE, NOT NULL |
| `title` | text | NOT NULL |
| `flavor` | text | NULLABLE (v1 plano) ・ flat v1 |
| `size_ml` | int | NULLABLE |
| `price_cents` | int | NOT NULL, CHECK (price_cents > 0) |
| `stock` | int | NOT NULL, CHECK (stock >= 0) ・ **nunca negativo** |
| `active` | boolean | NOT NULL default true |
| `created_at` / `updated_at` | timestamptz | NOT NULL default now() |

### `orders`
| columna | tipo | constraints |
| --- | --- | --- |
| `id` | bigint | PK, generado |
| `customer_id` | uuid | FK → users(id) |
| `status` | text | NOT NULL default 'pending', CHECK (status IN (...)) |
| `total_cents` | int | NOT NULL, CHECK (total_cents >= 0) |
| `created_at` / `updated_at` | timestamptz | NOT NULL |

### `order_items` — snapshot del precio ・ price snapshot
| columna | tipo | constraints |
| --- | --- | --- |
| `id` | bigint | PK |
| `order_id` | bigint | FK → orders(id) |
| `product_id` | bigint | NULLABLE FK → products(id) (snapshot; NULL si se borra) |
| `quantity` | int | NOT NULL, CHECK (quantity > 0) |
| `unit_price_cents` | int | NOT NULL, CHECK (unit_price_cents > 0) ・ **copiado al pagar/crear** |

### `payments` — idempotencia ・ idempotency
| columna | tipo | constraints |
| --- | --- | --- |
| `id` | bigint | PK |
| `order_id` | bigint | **UNIQUE** FK → orders(id) (un pago por pedido) |
| `payment_ref` | text | **UNIQUE** NOT NULL (el cliente lo manda ・ client-supplied) |
| `amount_cents` | int | NOT NULL |
| `paid_at` | timestamptz | NOT NULL default now() |

### `order_events` — historial inmutable ・ immutable audit
| columna | tipo | constraints |
| --- | --- | --- |
| `id` | bigint | PK, generado |
| `order_id` | bigint | FK → orders(id), indexado |
| `type` | text | NOT NULL ・ ej: `status_changed` |
| `from_status` | text | NULLABLE (null = nacimiento) |
| `to_status` | text | NULLABLE |
| `changed_by` | uuid | FK → users(id), indexado |
| `created_at` | timestamptz | NOT NULL default now() |

---

## Relaciones ・ Relations (ASCII)

```
users 1 ── * orders 1 ── * order_items * ── 1 products
              │
              ├── 1 ── 0..1 payments
              └── 1 ── * order_events
```

---

## Máquina de estados ・ State machine

```
pending ──(pay)→ paid ──(ship)→ shipped ──(deliver)→ delivered
   │                │
   └──(cancel)──────┘    cancel permitido solo en pending/paid
```

| De ・ From | To | Actor permitido ・ who |
| --- | --- | --- |
| `pending` | `paid` | customer (pago idempotente) |
| `pending` | `cancelled` | customer (suyo) o admin |
| `paid` | `cancelled` | customer (suyo) o admin |
| `paid` | `shipped` | admin |
| `shipped` | `delivered` | admin |

> Transiciones inválidas → error `INVALID_TRANSITION` (409). Implementado en un
> módulo `order-status.js` (patrón `request-status.js` del curso).

---

## Índices ・ Indexes

- `orders(customer_id)` — listado por customer.
- `orders(status)` — filtros.
- `order_items(order_id)`, `order_events(order_id)`, `order_events(changed_by)`.
- `payments(payment_ref)` — **UNIQUE** da la idempotencia.

---

## Notas de integridad ・ Integrity notes

- Stock: descuento **al pagar** dentro de `withTransaction`; cualquier
  `stock < 0` viola `CHECK` → pedido falla con `INSUFFICIENT_STOCK` (409).
- El seed crea: 1 admin + N yogures de ejemplo (SKUs `YOG-*`).