# 02 — Arquitectura del sistema

## Topología

```text
Admin web ─────────────┐
                      │
Buyer web ─────────────┼── REST API ─── PostgreSQL/Supabase
                      │       │
Machine simulator ────┘       ├── audit/logs
                              └── scheduled maintenance jobs
```

## Repositorio recomendado

```text
apps/
├── api/
├── admin-web/
└── vending-web/

database/
├── migrations/
└── seed/

docs/
scripts/
tests/
```

No es obligatorio usar monorepo tooling. La estructura debe ser ejecutable y comprensible.

## Estilo arquitectónico

Empieza como **monolito modular**: una API desplegable y una base de datos,
organizadas por capacidades del dominio. No se requieren microservicios,
mensajería distribuida ni tooling de monorepo para el MVP. Mantén las
interfaces admin, comprador y simulador como clientes de la API; ninguna
interfaz accede directamente a PostgreSQL.

Las dependencias apuntan hacia el dominio y los casos de uso:

```text
HTTP route/controller → application service/use case → domain policy
                                             ↓
                                      store/repository → PostgreSQL
```

La route traduce HTTP y valida el contrato; el service orquesta el caso de uso
y la transacción; la policy contiene reglas puras; el store encapsula SQL
parametrizado y recibe el cliente de transacción cuando corresponda. No añadas
una capa si no protege un límite real. Los módulos se comunican mediante
contratos estrechos; no importan internals de otros módulos.

## Backend modular

```text
src/
├── app.js
├── server.js
├── config/
├── db/
├── middleware/
├── shared/
└── modules/
    ├── auth/
    ├── tenants/
    ├── access-control/
    ├── users/
    ├── locations/
    ├── machines/
    ├── products/
    ├── inventory/
    ├── orders/
    ├── payments/
    ├── dispensing/
    ├── reports/
    └── audit/
```

## Responsabilidades

### Route/controller

- protocolo HTTP;
- params, query y body;
- llamada al caso de uso;
- status y response.

### Service/use case

- coordinación;
- reglas de aplicación;
- transacciones;
- estados;
- dependencias mediante funciones o interfaces claras.

### Policy

- permisos;
- ownership;
- reglas puras;
- sin Express ni SQL.

### Store/repository

- SQL parametrizado;
- mapeo de datos;
- tenant filter;
- uso del transaction client recibido.

No exigir un archivo por cada concepto si no añade claridad.

## Límites de módulos

- `auth` y `access-control`: identidad de usuario, memberships y permisos.
- `tenants`: estado y contexto de organización.
- `locations`, `machines` y `products`: configuración del catálogo.
- `inventory`: slots, reservas, movimientos y concurrencia.
- `orders`, `payments` y `dispensing`: ciclo de compra, con transiciones y
  transacciones explícitas.
- `reports` y `audit`: consultas y evidencia, siempre tenant-scoped.
- `health`: liveness y readiness operacionales.

Mantén la primera entrega enfocada en health/readiness y catálogo público.
Añade órdenes, pagos, identidad de dispositivo y aplicaciones de interfaz por
verticales verificables, no como scaffolding vacío.

## Contextos de seguridad

### Admin context

```text
userId
activeTenantId
membershipId
permissions
requestId
```

### Device context

```text
deviceId
machineId
tenantId
devicePermissions
requestId
```

### Public context

No tiene tenant suministrado. Se deriva de `publicCode` u order public token.

Para catálogo, la consulta deriva `tenant_id` desde una máquina activa localizada
por `publicCode`; no acepta `tenantId` en query, body ni headers como autoridad.
Cada join operativo conserva igualdad de `tenant_id`. Para órdenes públicas, se
deriva la máquina y tenant desde el token opaco validado.

## Persistencia y aislamiento

- Incluye `tenant_id` en entidades operativas.
- Refuerza relaciones tenant-scoped con claves foráneas compuestas
  `(tenant_id, id)` además de comprobaciones en servicios/stores.
- Aplica el tenant en cada lectura, escritura, reporte y transición; nunca
  dependas de ocultar datos solo en la interfaz.
- Usa queries parametrizadas, constraints para invariantes y transacciones en
  cambios que actualizan más de una entidad.
- Usa una cuenta de base de datos con privilegios mínimos. Si se habilita RLS,
  pruébala como una capa adicional; no sustituye la autorización del backend.

## Seguridad por defecto

- Deniega por defecto y separa los contextos de usuario, dispositivo y público.
- No confíes en identidad, tenant, precio, stock, status u ownership enviados
  por clientes.
- Almacena hashes de contraseñas y credenciales de dispositivos; tokens públicos
  deben ser impredecibles y almacenarse de forma segura.
- Mantén secretos solo en el entorno de ejecución; nunca en frontend, seed,
  logs, capturas, commits o respuestas de error.
- Devuelve errores públicos estables y genéricos; conserva request IDs y
  diagnósticos internos sanitizados.
- Aplica validación de entrada, límites de payload, CORS allowlist, headers
  seguros y rate limiting según la superficie de cada endpoint.
- Usa idempotencia y límites transaccionales para operaciones repetibles o
  concurrentes.

## Integración entre apps

- Admin web consume API privada.
- Buyer web consume API pública.
- Simulator consume API de dispositivo.
- Ninguna web se conecta directamente a PostgreSQL.
- Supabase se utiliza como PostgreSQL administrado, no como bypass del backend.
- No expongas `service_role` ni credenciales de PostgreSQL en una aplicación web.

## Trabajos internos

Puede utilizarse un script ejecutable o scheduler externo para:

- expirar reservas;
- marcar máquinas offline;
- reconciliar órdenes;
- limpiar idempotency records vencidos.

No es obligatorio implementar una cola externa.
