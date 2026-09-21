-- =====================================================================
-- EN: Migration 0005 - payments table (idempotency). Depends on orders
-- (0003). order_id is UNIQUE (one payment per order) and payment_ref is
-- UNIQUE (client-supplied reference): paying twice with the same ref
-- answers the same result without a double charge.
-- ES: Migración 0005 - tabla payments (idempotencia). Depende de orders
-- (0003). order_id es UNIQUE (un pago por pedido) y payment_ref es
-- UNIQUE (referencia enviada por el cliente): pagar dos veces con la
-- misma ref responde el mismo resultado sin doble cargo.
-- =====================================================================

create table payments (
  id           bigint generated always as identity primary key,
  order_id     bigint not null unique references orders(id),
  payment_ref  text not null unique,
  amount_cents int not null,
  paid_at      timestamptz not null default now()
);