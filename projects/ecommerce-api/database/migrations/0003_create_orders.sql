-- =====================================================================
-- EN: Migration 0003 - orders table. Depends on users (0001). The status
-- column implements the order state machine pending -> paid -> shipped ->
-- delivered / cancelled, guarded by CHECK. total_cents is server-computed.
-- ES: Migración 0003 - tabla orders. Depende de users (0001). La columna
-- status implementa la máquina de estados del pedido pending -> paid ->
-- shipped -> delivered / cancelled, protegida por CHECK. total_cents lo
-- calcula el servidor.
-- =====================================================================

create table orders (
  id           bigint generated always as identity primary key,
  customer_id  uuid not null references users(id),
  status       text not null default 'pending'
               check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_cents  int not null check (total_cents >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);