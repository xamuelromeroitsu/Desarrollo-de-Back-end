INSERT INTO tenants (id, slug, name, status)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'demo-a', 'Demo Tenant A', 'active'),
  ('10000000-0000-4000-8000-000000000002', 'demo-b', 'Demo Tenant B', 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO locations (id, tenant_id, code, name, status)
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'HQ-A', 'Demo Location A', 'active'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'HQ-B', 'Demo Location B', 'active')
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO vending_machines (id, tenant_id, location_id, code, public_code, name, status)
VALUES
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'M-001', 'demo-machine-a', 'Demo Machine A', 'active'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'M-001', 'demo-machine-b', 'Demo Machine B', 'active')
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO products (id, tenant_id, sku, name, description, price_minor, currency, status)
VALUES
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'WATER-A', 'Water A', 'Demo product for tenant A', 150, 'USD', 'active'),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'WATER-B', 'Water B', 'Demo product for tenant B', 175, 'USD', 'active')
ON CONFLICT (tenant_id, sku) DO NOTHING;

INSERT INTO machine_slots (id, tenant_id, machine_id, product_id, position, capacity, on_hand, reserved, status)
VALUES
  ('50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'A1', 20, 10, 0, 'active'),
  ('50000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'A1', 20, 8, 0, 'active')
ON CONFLICT (tenant_id, machine_id, position) DO NOTHING;
