// =====================================================================
// EN: REPRODUCIBLE SEEDER. Creates the demo dataset AFTER the migrations:
// the promoted admin user and the initial yoghurt catalog (YOG-*). It is
// repeatable by design: users are kept if their email exists, products
// are upserted by their unique sku. It never truncates and never touches
// data created by anyone else.
//
// ES: SEEDER REPRODUCIBLE. Crea el dataset demo DESPUÉS de las
// migraciones: el usuario admin promovido y el catálogo inicial de
// yogures (YOG-*). Es repetible por diseño: los usuarios se conservan si
// su email existe, los productos se hacen upsert por su sku único. Nunca
// trunca y nunca toca datos creados por otros.
// =====================================================================

import 'dotenv/config';
import { pool } from '../src/database/pool.js';
import { hashPassword } from '../src/modules/auth/password.js';

// EN: promoted admin. Registration always creates 'customer'; 'admin' can
// only exist via seed (demo data, not a real secret).
// ES: admin promovido. El registro siempre crea 'customer'; 'admin' solo
// puede existir vía seed (dato demo, no es un secreto real).
const SEED_ADMIN = {
  email: 'admin.seed@example.test',
  password: 'admin clave del proyecto 01',
  role: 'admin'
};

// EN: initial catalog. Price in integer cents; flavor + size_ml as plain
// columns on products (v1 keeps products flat; variants arrive in v2).
// ES: catálogo inicial. Precio en céntimos enteros; flavor + size_ml como
// columnas directas en products (v1 mantiene productos planos; las
// variantes llegan en v2).
const SEED_PRODUCTS = [
  { sku: 'YOG-VAN', title: 'Yogur natural', flavor: 'vainilla', size_ml: 120, price_cents: 950, stock: 50 },
  { sku: 'YOG-FRU', title: 'Yogur natural', flavor: 'frutilla', size_ml: 120, price_cents: 1000, stock: 50 },
  { sku: 'YOG-CIT', title: 'Yogur natural', flavor: 'citrico', size_ml: 120, price_cents: 1000, stock: 30 },
  { sku: 'YOG-GRE-DUR', title: 'Yogur griego', flavor: 'durazno', size_ml: 200, price_cents: 1450, stock: 30 },
  { sku: 'YOG-GRE-FRU', title: 'Yogur griego', flavor: 'frutos rojos', size_ml: 200, price_cents: 1550, stock: 20 }
];

async function main() {
  console.log('DATABASE SEED\n');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1 · EN: admin is created only if not present, so re-running the seed
    // never breaks references already pointing to that user.
    //    ES: el admin se crea solo si no existe, para que re-correr el seed
    // nunca rompa referencias que ya apuntan a ese usuario.
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [SEED_ADMIN.email]);
    if (!existing.rows[0]) {
      const adminHash = await hashPassword(SEED_ADMIN.password);
      await client.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)`,
        [SEED_ADMIN.email, adminHash, SEED_ADMIN.role]
      );
      console.log('- admin user created');
    } else {
      console.log('- admin user already exists (kept)');
    }

    // 2 · EN: products are upserted by their unique sku so the seed is
    // idempotent: existing rows get their values refreshed, no duplicates.
    //    ES: los productos se hacen upsert por su sku único para que el seed
    // sea idempotente: las filas existentes refrescan valores sin duplicarse.
    let productCount = 0;
    for (const product of SEED_PRODUCTS) {
      await client.query(
        `INSERT INTO products (sku, title, flavor, size_ml, price_cents, stock)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (sku) DO UPDATE SET
           title = EXCLUDED.title,
           flavor = EXCLUDED.flavor,
           size_ml = EXCLUDED.size_ml,
           price_cents = EXCLUDED.price_cents,
           stock = EXCLUDED.stock,
           updated_at = now()`,
        [product.sku, product.title, product.flavor, product.size_ml, product.price_cents, product.stock]
      );
      productCount += 1;
    }

    await client.query('COMMIT');
    console.log(`- ${productCount} products ready`);
    console.log('\nSeed completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\nSeed failed and was rolled back:', error.code ?? error.message);
    if (error.code === '42P01') {
      console.error('A table is missing. Run the migrations first: npm run db:migrate');
    }
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

try {
  await main();
} finally {
  await pool.end();
}