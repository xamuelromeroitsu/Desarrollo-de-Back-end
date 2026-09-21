-- =====================================================================
-- EN: Migration 0002 - products table (catalog). Independent of users;
-- placed second only to keep a stable ordering. Money is integer cents,
-- stock is guarded by CHECK, and inactive products are hidden from the
-- public catalog (active flag).
-- ES: Migración 0002 - tabla products (catálogo). Independiente de users;
-- va segunda solo por mantener un orden estable. El dinero va en céntimos
-- enteros, el stock se protege con CHECK y los productos inactivos se
-- ocultan del catálogo público (flag active).
-- =====================================================================

create table products (
  id           bigint generated always as identity primary key,
  sku          text not null unique,
  title        text not null,
  flavor       text,
  size_ml      int,
  price_cents  int not null check (price_cents > 0),
  stock        int not null default 0 check (stock >= 0),
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);