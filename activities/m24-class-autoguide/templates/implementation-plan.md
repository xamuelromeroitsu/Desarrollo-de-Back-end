# Implementation plan

Student: Xamuel Romero
Student ID: xamuelromero
Email: xamuelromero.itsu@gmail.com
Repository: `projects/m24-vending-platform/` (iniciado; confirmar remoto personal antes de publicar)
Commit: Pendiente; no crear hasta tener una vertical ejecutable y verificada.

## 1. Proposed structure

Monorepo sencillo, sin añadir herramientas de workspace hasta que hagan falta:

```text
projects/m24-vending-platform/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── database/
│   │       ├── middleware/
│   │       ├── modules/
│   │       │   ├── machines/
│   │       │   ├── health/
│   │       │   └── machines/
│   │       ├── shared/
│   │       ├── config.js
│   │       ├── app.js
│   │       └── server.js
│   ├── admin-web/
│   └── vending-web/
├── database/
│   ├── migrations/
│   └── seed/
├── docs/
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

La primera entrega se concentra en `apps/api`, `database` y pruebas de API; las interfaces empiezan mínimas para demostrar la vertical. Mantener el código M24 separado del `package.json` raíz del curso y del proyecto `projects/ecommerce-api`.

Stack inicial: Node.js 20 o superior, Express 5 y PostgreSQL mediante `pg`, compatible con Supabase. El proyecto M24 tiene manifiesto independiente. La estructura implementada comienza con health y catálogo; se agregan módulos de inventory, orders, payments y dispensing al construir esas verticales. Mantener rutas/controladores, servicios, policies y stores sin crear capas vacías.

## 2. First vertical slice

Construir primero esta secuencia:

```text
seed de tenant, ubicación, máquina, producto y slot
→ GET /api/v1/public/machines/:publicCode/catalog
→ crear una orden con precio calculado por el servidor
→ reservar stock transaccionalmente
→ aprobar pago simulado de forma idempotente
→ crear un único trabajo de despacho
→ simulador reclama y completa el trabajo
→ consumir reserva, registrar movimiento y completar orden
```

La primera ruta de negocio es `GET /api/v1/public/machines/:publicCode/catalog`. Ya existen `GET /health`, readiness, una migración inicial y seed de dos tenants de demostración. La ruta consulta por `publicCode`, deriva el tenant de la máquina y expone únicamente productos activos con stock disponible. Falta ejecutar la integración contra PostgreSQL para dar por probado el aislamiento en la base real.

## 3. Database migrations

Usar migraciones SQL versionadas y ejecutables en orden; el script registra qué versiones se aplicaron y falla con un error visible si una migración no puede completarse. El seed es repetible, transaccional y usa identificadores/códigos estables para datos de demostración sin resetear inventario existente.

Orden inicial de esquema:

1. `tenants`
2. `locations`
3. `vending_machines`
4. `products`
5. `machine_slots`
6. `inventory_movements`
7. `orders`, `order_items`, `inventory_reservations` e `idempotency_records`
8. `payments` y `dispense_jobs`
9. `audit_events` e índices que requieran los recorridos.

Las tablas operativas incluyen `tenant_id`. Añadir restricciones para cantidades no negativas, `reserved <= on_hand <= capacity`, unicidad dentro del tenant y claves foráneas que impidan combinar entidades de tenants distintos (por ejemplo, claves únicas compuestas con `tenant_id`). Dinero en unidades menores enteras y moneda explícita. No guardar secretos en migraciones, seed ni documentación.

## 4. Modules

- `health`: health y readiness.
- `machines`: consulta pública de máquina y catálogo.
- `inventory`: slots, reservas, movimientos y reglas de stock.
- `orders`: creación, consulta pública y cancelación/expiración.
- `payments`: pago simulado e idempotencia.
- `dispensing`: credenciales de dispositivo, jobs y transiciones.
- `tenants`: contexto y helpers de aislamiento, sin aceptar el tenant del cliente como autoridad.
- `audit`: eventos críticos.

Las rutas validan el contrato HTTP, los servicios coordinan reglas/transacciones, las policies implementan reglas puras y los stores contienen SQL parametrizado. Ningún frontend se conecta directamente a PostgreSQL.

## 5. Tenant context strategy

En rutas públicas no se acepta `tenantId`: se busca la máquina por su `publicCode` aleatorio y el tenant se deriva de la máquina encontrada. Cada consulta posterior se limita al `tenant_id` derivado y a los IDs correspondientes. Para rutas privadas, el tenant activo se obtiene de una membresía validada en el servidor; nunca se confía en un ID de tenant enviado libremente por el navegador. El contexto del dispositivo se deriva de su credencial autenticada y queda asociado a una máquina y tenant.

Usar `404` para recursos inexistentes o invisibles cuando corresponda para no revelar su existencia, siguiendo el contrato.

## 6. Authentication strategy

MVP público: el catálogo no requiere login, y la orden se consulta mediante un token público aleatorio que no sea un ID secuencial; guardar el hash del token. No implementar login de administración como prerrequisito de la primera vertical. Antes de habilitar operaciones administrativas, incorporar autenticación de usuario, memberships, tenant activo validado y permisos RBAC en el backend.

## 7. Device authentication strategy

Mantener la identidad de dispositivo separada de la sesión de usuario. Asociar una credencial fuerte con una única máquina; almacenar su hash, autenticarla en el backend y derivar de esa autenticación `deviceId`, `machineId` y `tenantId`. El simulador no enviará libremente esos identificadores para determinar qué jobs puede operar. No imprimir ni versionar la credencial en claro.

## 8. State machines

Implementar transiciones explícitas de acuerdo con `specification/05-STATE-MACHINES.md`:

- Orden: `awaiting_payment → paid → dispensing → completed`; contemplar `cancelled`, `expired` y `failed`.
- Pago: `pending → approved` o `declined`; no convertir un intento declinado en aprobado.
- Reserva: `active → consumed`, `released` o `expired`.
- Job: `queued → processing → dispensed` o `failed`, con retry autorizado y limitado.

Rechazar transiciones inválidas y registrar eventos para las transiciones críticas. Estados terminales no se reabren mediante rutas normales.

## 9. Transactions and concurrency

Crear orden, líneas e inventario reservado dentro de una transacción. Proteger la última unidad con una actualización condicional/lock apropiado y comprobar las filas afectadas; si no hay stock suficiente, hacer rollback. Usar `Idempotency-Key` y guardar hash de la solicitud para crear órdenes, simular pagos y confirmar despachos: misma clave y mismo cuerpo devuelve el resultado previo; misma clave con otro cuerpo da conflicto.

La aprobación del pago y creación única del job deben ser atómicas. La finalización del despacho consume la reserva, registra el movimiento y actualiza job/orden en una sola transacción. Una confirmación repetida no puede descontar inventario dos veces.

## 10. Test strategy

- Unitarias: reglas de stock y transiciones de estado.
- Integración con PostgreSQL: migraciones, seed repetible, transacciones e idempotencia.
- API: health/readiness, catálogo activo e inexistente, orden, pago y despacho.
- Aislamiento: preparar dos tenants A y B con máquina, producto y stock distintos. Consultar el catálogo A solo muestra datos A; usar una máquina/slot/order/job de B dentro de un contexto A no devuelve ni modifica datos B (404/403 según contrato). Probar también el acceso cruzado a reportes y rutas privadas cuando se implementen.
- Concurrencia: dos compras simultáneas para la última unidad; solo una reserva debe completarse.
- Reintentos: repetir creación, pago y finalización con la misma clave no duplica orden, pago, job ni movimiento.
- E2E: ejecutar el recorrido completo y verificar estado de orden, job, reserva y stock final.

No usar únicamente mocks para afirmar que el aislamiento o las transacciones de PostgreSQL funcionan.

## 11. Risks

- La guía no entrega todavía una app M24 ejecutable: este plan crea un proyecto separado; confirmar la ruta final antes de inicializarlo.
- Credenciales o configuración de Supabase faltantes pueden bloquear pruebas integradas; no copiar secretos a reportes, capturas, commits o chats.
- Construir las tres interfaces antes de cerrar el flujo API puede retrasar el MVP.
- Confiar en un tenant, precio, stock o machine ID enviados por el cliente puede causar exposición cruzada o inconsistencias.
- El test de contrato con store aislado no sustituye la integración de aislamiento sobre PostgreSQL real.
- Carreras en reserva, aprobación y finalización pueden causar sobreventa o doble descuento si las transacciones y la idempotencia son incompletas.
- El pago y la máquina son simulados; no presentar el MVP como integración bancaria ni hardware real.

## 12. Questions

- Student ID y repositorio remoto personal: completar al confirmar la información.
- Confirmar si la entrega debe usar una estructura distinta de `projects/m24-vending-platform/`.
- Confirmar disponibilidad de un proyecto PostgreSQL/Supabase y acceso seguro a sus variables.
- Acordar contrato de error y formato de paginación antes de ampliar endpoints; mantener consistencia con las especificaciones.

## Weekly checkpoints

| Checkpoint | Expected result | Verification | Status |
|---|---|---|---|
| Foundation | API runs, health/readiness and DB connection work | README commands; `/health`; readiness with/without DB | In progress |
| Data model | Initial tenant-scoped schema and repeatable seed | Apply migrations from empty DB; run seed twice | In progress |
| Access control | User tenant context and permissions | Cross-tenant negative API tests | Planned |
| Inventory | Slots, movements and reservations remain consistent | Concurrent requests for last unit; ledger assertions | Planned |
| Purchase | Order and simulated payment work | API flow; amount computed server-side; idempotency retries | Planned |
| Dispensing | Simulator receives and completes one job | End-to-end test; repeat completion; verify one movement | Planned |
| Reporting | Tenant-scoped reports reconcile with seed | Compare known totals across tenants | Planned |
| Hardening | Tests, safe logs, docs and validator results recorded | Full relevant suite; clean setup; common validator | Planned |
