-- =====================================================================
-- EN: Migration 0006 - order_events table (audit log). Depends on orders
-- (0003) and users (0001). Immutable: every order change appends a row
-- (type, from -> to, changed_by from the JWT subject).
-- ES: Migración 0006 - tabla order_events (bitácora de auditoría).
-- Depende de orders (0003) y de users (0001). Inmutable: cada cambio de
-- un pedido agrega una fila (type, de -> a, changed_by desde el subjunto
-- del JWT).
-- =====================================================================

create table order_events (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references orders(id),
  type        text not null,
  from_status text,
  to_status   text,
  changed_by  uuid references users(id),
  created_at  timestamptz not null default now()
);