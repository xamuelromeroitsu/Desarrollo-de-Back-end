-- =====================================================================
-- EN: Migration 0004 - order_items table. Depends on orders (0003) and
-- products (0002). Keeps a price SNAPSHOT (unit_price_cents) so later
-- price changes never alter an existing order; product_id is nullable on
-- purpose (NULL if the product is removed later).
-- ES: Migración 0004 - tabla order_items. Depende de orders (0003) y de
-- products (0002). Guarda un SNAPSHOT del precio (unit_price_cents) para
-- que subir el precio luego no altere un pedido ya creado; product_id es
-- nullable a propósito (NULL si el producto se borra después).
-- =====================================================================

create table order_items (
  id                bigint generated always as identity primary key,
  order_id          bigint not null references orders(id),
  product_id        bigint references products(id),
  quantity          int not null check (quantity > 0),
  unit_price_cents  int not null check (unit_price_cents > 0)
);