const FIND_PUBLIC_CATALOG = `
  SELECT
    m.public_code,
    m.name AS machine_name,
    s.id AS slot_id,
    s.position,
    (s.on_hand - s.reserved)::integer AS available_quantity,
    COALESCE(s.price_override_minor, p.price_minor)::integer AS price_minor,
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.description,
    p.currency
  FROM vending_machines m
  JOIN tenants t
    ON t.id = m.tenant_id
   AND t.status = 'active'
  LEFT JOIN machine_slots s
    ON s.tenant_id = m.tenant_id
   AND s.machine_id = m.id
   AND s.status = 'active'
   AND s.on_hand > s.reserved
  LEFT JOIN products p
    ON p.tenant_id = s.tenant_id
   AND p.id = s.product_id
   AND p.status = 'active'
  WHERE m.public_code = $1
    AND m.status = 'active'
  ORDER BY s.position ASC NULLS LAST
`;

export function createPublicCatalogStore(database) {
  return {
    async findByPublicCode(publicCode) {
      const result = await database.query(FIND_PUBLIC_CATALOG, [publicCode]);
      if (result.rows.length === 0) {
        return null;
      }

      const first = result.rows[0];
      return {
        machine: {
          publicCode: first.public_code,
          name: first.machine_name
        },
        items: result.rows
          .filter((row) => row.product_id !== null)
          .map((row) => ({
            slotId: row.slot_id,
            position: row.position,
            availableQuantity: row.available_quantity,
            priceMinor: row.price_minor,
            product: {
              id: row.product_id,
              sku: row.sku,
              name: row.product_name,
              description: row.description,
              currency: row.currency
            }
          }))
      };
    }
  };
}
