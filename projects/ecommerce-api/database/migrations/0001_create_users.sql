-- =====================================================================
-- EN: Migration 0001 - users table. First step because orders and events
-- reference users(id). Run these files in numerical order through the
-- migration runner (later phase); each applied file is recorded in the
-- schema_migrations ledger.
-- ES: Migración 0001 - tabla users. Primer paso porque los pedidos y los
-- eventos referencian users(id). Ejecuta estos archivos en orden
-- numérico mediante el runner de migraciones (fase posterior); cada
-- archivo aplicado se registra en el ledger schema_migrations.
-- =====================================================================

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  role          text not null check (role in ('customer', 'admin')),
  created_at    timestamptz not null default now()
);