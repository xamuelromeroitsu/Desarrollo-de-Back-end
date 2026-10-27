# M24 Vending Platform

Primer slice ejecutable del proyecto M24. Este proyecto está separado de la raíz del curso y de `projects/ecommerce-api`.

## Alcance actual

- `GET /health`: confirma que el proceso responde sin depender de PostgreSQL.
- `GET /ready`: comprueba que PostgreSQL está disponible.
- `GET /api/v1/public/machines/:publicCode/catalog`: entrega el catálogo activo de una máquina pública.
- Migración inicial y seed repetible con dos tenants de demostración para empezar las pruebas de aislamiento.

Todavía no implementa órdenes, pagos, autenticación de dispositivos ni interfaces web.

Los documentos de kickoff y estado del trabajo están en [`docs/`](docs/):
plan, decisiones arquitectónicas, uso de IA, learning log y checkpoint. El
checkpoint separa explícitamente las pruebas que ya pasaron de las que esperan
una base PostgreSQL de desarrollo.

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 15 o superior (incluye un proyecto PostgreSQL de Supabase).

## Preparación

Desde esta carpeta:

```powershell
npm install
Copy-Item .env.example .env
```

Edita `.env` con una `DATABASE_URL` de desarrollo. No compartas ni confirmes este archivo. Para Supabase usa la cadena PostgreSQL apropiada para tu entorno y SSL.

## Base de datos y ejecución

```powershell
npm run db:migrate
npm run db:seed
npm test
npm run dev
```

`npm test` corre pruebas unitarias/API sin necesitar una base. Para probar las
consultas reales, crea una base **desechable** distinta de producción, configura
`M24_TEST_DATABASE_URL` en `.env`, aplícale migraciones y seed (por ejemplo,
exportando temporalmente ese valor como `DATABASE_URL`) y ejecuta:

```powershell
npm run test:integration
```

La prueba de integración solo lee las máquinas de demostración; no uses una
base compartida ni de producción.

En otra terminal verifica:

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/ready
Invoke-RestMethod http://localhost:3000/api/v1/public/machines/demo-machine-a/catalog
```

El seed crea las máquinas `demo-machine-a` y `demo-machine-b` bajo tenants distintos. Son identificadores públicos de demostración, no credenciales.

## Seguridad de esta primera vertical

- El cliente busca una máquina por `publicCode`; no proporciona un `tenantId`.
- Tenant, máquina, slot y producto se relacionan por claves foráneas compuestas.
- La consulta parametriza el código público y hace cumplir la pertenencia al tenant en los joins.
- Solo se devuelven campos de catálogo; nunca credenciales ni configuración interna.
- `/ready` no expone detalles de conexión y la API no devuelve errores internos.
- Para producción aún se requieren límites de tasa, política CORS por origen, autenticación/autorización para rutas privadas, logging operacional completo y gestión de secretos.

## Prueba de aislamiento

Consulta ambos códigos públicos y comprueba que cada catálogo contiene únicamente la máquina y producto de su tenant. La prueba automatizada valida el contrato HTTP usando un store aislado. La prueba
de integración compara los catálogos de dos tenants en PostgreSQL y requiere
`M24_TEST_DATABASE_URL`, migración y seed ejecutados.

No uses las credenciales de producción para pruebas ni ejecutes fixtures destructivos sobre una base compartida.
