# 00 — README ・ Yoghurt Store API ・ Tienda de Yogures

> Documento fundacional / Foundational doc. Todo lo demás cuelga de aquí.
> (EN) Everything else hangs from this file. (ES) Todo lo demás cuelga de aquí.

---

## Visión ・ Vision

**EN:** A REST API for an online yoghurt shop. A customer browses the catalog,
places orders and pays for their own orders; an admin manages the catalog and
moves orders from payment to delivery. Every change is recorded in an audit
history, payments are idempotent, and stock can never go negative.

**ES:** Una API REST para un negocio de yogures en línea. El cliente (customer)
recorre el catálogo, crea pedidos y paga solo los suyos; el administrador (admin)
gestiona el catálogo y lleva los pedidos del pago a la entrega. Todo cambio queda
en un historial de auditoría, los pagos son idempotentes y el stock jamás es
negativo.

---

## Stack ・ Stack

| Capa ・ Layer | Tecnología |
| --- | --- |
| Runtime | Node.js (20+) |
| Web | Express (API REST, JSON) |
| Base de datos ・ DB | PostgreSQL |
| Auth | JWT (Bearer) + bcrypt (hash de contraseñas) |
| Entorno ・ Env | dotenv (`.env`, nunca en git) |
| Tests | node:test + supertest |
| Cliente API | Bruno (colección `test-api/`) |

---

## Estructura ・ Structure

```
projects/ecommerce-api/
├── docs/                    # documentación sobre roca (este árbol)
├── src/
│   ├── app.js               # crea la app Express (sin puerto)
│   ├── server.js            # arranca app.js
│   ├── database/            # pool.js, transaction.js, migraciones/seeds
│   ├── http/                # respond-error.js (traductor único de errores)
│   ├── middleware/          # authenticate.js (autenticación Bearer)
│   └── modules/
│       ├── auth/            # registro, login, me, token
│       ├── shop/            # productos (products)
│       └── orders/          # pedidos, pagos, eventos
├── database/
│   ├── migrations/*.sql     # esquema versionado
│   └── seed.js              # datos iniciales (admin + yogures)
├── test/ + helpers/         # suite + test-data, test-auth, cleanup
├── scripts/validate-ecommerce.js   # validador 12 checks
├── test-api/                # colección Bruno
└── NOTES.md                 # notas breves EN/ES
```

---

## Cómo correr ・ How to run

```bash
npm install
cp .env.example .env          # configurar DATABASE_URL y JWT_SECRET
npm run db:migrate            # aplicar migraciones
npm run db:seed               # sembrar admin + productos
npm run dev                   # arrancar con --watch (http://localhost:3000)
```

### Calidad ・ Quality

```bash
npm test                                  # suite (node --test)
npm run validate:ecommerce                # validador final (12 checks)
```

---

## Convenciones ・ Conventions

- errores tipados `{ "error": { "code", "message" } }`.
- Listas vacías con filtro válido → **200 `[]`** (no 404).
- Recurso ajeno responde **igual que inexistente** (no se revela existencia).
- Dinero siempre en **céntimos** (`price_cents`) en la base; el API expone decimal.
- Ningún secreto ni hash en respuestas ni en git.

---

## Roadmap v1 → v2 ・ Roadmap

**v1 (ahora):** catálogo plano, pedidos, pago idempotente, historial, roles customer/admin.
**v2 (futuro, sin romper contrato):** `variants` de producto (sabor/tamaño como entidad),
cupones, gastos de envío, inventario por almacén, rol de soporte (`agent`), webhooks.

> Cualquier cambio v2 debe agregar tablas/endpoints — nunca modificar contratos v1.