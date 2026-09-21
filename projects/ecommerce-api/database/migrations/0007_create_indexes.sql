-- =====================================================================
-- EN: Migration 0007 - indexes for the most frequent filters and joins
-- (list by customer, filter by status, payments by ref, events by order
-- and by actor). Safe to run after all tables exist. The UNIQUE
-- constraints for idempotency already live in 0001 (email), 0002 (sku)
-- and 0005 (payment_ref, order_id).
-- ES: Migración 0007 - índices para los filtros y joins más frecuentes
-- (listado por customer, filtro por status, pagos por ref, eventos por
-- pedido y por actor). Seguro de correr una vez que existen todas las
-- tablas. Las restricciones UNIQUE de idempotencia ya viven en 0001
-- (email), 0002 (sku) y 0005 (payment_ref, order_id).
-- =====================================================================

create index idx_orders_customer         on orders(customer_id);
create index idx_orders_status           on orders(status);
create index idx_order_items_order       on order_items(order_id);
create index idx_payments_ref            on payments(payment_ref);
create index idx_order_events_order      on order_events(order_id);
create index idx_order_events_changed_by on order_events(changed_by);