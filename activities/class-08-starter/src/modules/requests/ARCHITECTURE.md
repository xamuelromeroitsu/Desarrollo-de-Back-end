# Módulo Requests — Arquitectura y Refactor Clase 8

## Visión general

Este módulo implementa la API de solicitudes siguiendo **arquitectura en capas** con **flechas en una dirección**:

```
HTTP (routes) → Caso de uso (service) → Datos (store) → PostgreSQL
                    ↓
              Policy (reglas puras)
                    ↓
              Mapper (serialización)
```

**Principio rector**: *Un archivo cambia por una sola razón.* Si necesitas "y también" para describirlo, hay acoplamiento.

---

## Estructura de archivos

| Archivo | Responsabilidad | Cambia cuando... | Dependencias |
|---------|-----------------|------------------|--------------|
| `requests.routes.js` | Capa HTTP: params, query, body, status codes | Nuevo endpoint, contrato HTTP | `requests.service.js`, `parseIdParam` |
| `requests.service.js` | Orquesta caso de uso: policy + store + mapper + transacciones | Nueva regla de negocio, flujo | `store`, `policy`, `mapper`, `request-status`, `transaction` |
| `request.policy.js` | **Funciones puras** de autorización (sin I/O) | Cambian permisos/roles | **Ninguna** (hoja) |
| `requests.store.js` | SQL parametrizado, transacciones, scopes en BD | Cambia esquema, índices, queries | `pool` (solo implementación) |
| `request.mapper.js` | snake_case (BD) → camelCase (HTTP) | Cambia JSON público | **Ninguna** (hoja) |
| `request-status.js` | Máquina de estados + transiciones válidas | Cambia lifecycle | **Ninguna** (hoja) |

---

## Flujo de una petición (ejemplo: `PATCH /:id`)

```mermaid
sequenceDiagram
    participant Client
    participant Routes as requests.routes.js
    participant Service as requests.service.js
    participant Policy as request.policy.js
    participant Store as requests.store.js
    participant Mapper as request.mapper.js
    participant DB as PostgreSQL

    Client->>Routes: PATCH /requests/42 {status: "in_progress"}
    Routes->>Routes: parseIdParam("42") → 42
    Routes->>Service: patchRequest(actor, 42, {status: "in_progress"})
    Service->>Policy: canChangeStatus(actor) → true/false
    Service->>Store: findById(42, client) → row
    Service->>Mapper: mapRequestRow(row) → request
    Service->>Policy: canViewRequest(actor, request)
    Service->>Service: Validar transición (open → in_progress)
    Service->>Store: updateRequest(42, {status}, client) → row
    Service->>Store: insertHistoryEvent({type: "status_changed"...}, client)
    Service->>Mapper: mapRequestRow(row) → response
    Service-->>Routes: request object
    Routes-->>Client: 200 OK {id: 42, status: "in_progress", ...}
```

---

## 🚨 Violación conocida: `GET /:id/history` (líneas 38-97 de routes.js)

### Qué hace hoy (TODO en el handler)

```mermaid
flowchart TD
    A[routes.js: GET /:id/history] --> B[Validar id HTTP]
    A --> C[pool.query SELECT requests]
    A --> D[Policy inline: role + owner check]
    A --> E[pool.query SELECT request_history]
    A --> F[Mapping inline duplicado]
    A --> G[res.status(200).json]
```

### Responsabilidades mezcladas

| Responsabilidad | Código actual | Debería estar en |
|-----------------|---------------|------------------|
| Validar `id` HTTP | L39-45 | routes ✅ |
| **SQL: buscar request** | L48-56 | **store.findById** ❌ |
| **Policy: visibilidad** | L58-64 | **policy.canViewHistory** ❌ |
| **SQL: buscar history** | L67-73 | **store.findHistory** ❌ |
| **Mapping JSON** | L76-93 | **mapper.mapHistoryEventRow** ❌ (duplicado) |
| Responder 200 | L96 | routes ✅ |

### Por qué rompe la arquitectura

1. **Importa `pool` directamente** (L9) → capa HTTP conoce BD
2. **Duplica mapping** → mismo código que `mapper.mapHistoryEventRow`
3. **Reescribe policy a mano** → misma lógica que `policy.canViewHistory`
4. **4+ razones de cambio** → HTTP, SQL, policy, mapping

---

## Snippet ANTES: Handler actual en routes.js (líneas 38-97)

```javascript
// ─────────────────────────────────────────────────────────────────────
// GET /:id/history — the handler that does EVERYTHING.
// HTTP, visibility rules, SQL, mapping and response, all in one place.
// ─────────────────────────────────────────────────────────────────────
router.get('/:id/history', async (req, res) => {
  // Reading and validating the path parameter (HTTP).
  const raw = req.params.id;
  if (typeof raw !== 'string' || !/^[1-9][0-9]{0,17}$/.test(raw)) {
    throw new AppError('contract', 'INVALID_REQUEST_ID',
      'Request id must be a positive integer.');
  }
  const id = Number(raw);

  // Fetching the request (SQL, in the middle of a route).
  const requestResult = await pool.query(
    `SELECT id, title, description, priority, status, created_by, created_at, updated_at
     FROM requests WHERE id = $1`,
    [id]
  );
  const requestRow = requestResult.rows[0];
  if (!requestRow) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }

  // Deciding visibility (a business rule, re-written here by hand).
  const isAgent = req.auth.role === 'agent';
  const isOwner = requestRow.created_by === req.auth.userId;
  if (!isAgent && !isOwner) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }

  // Fetching the history (more SQL).
  const historyResult = await pool.query(
    `SELECT id, type, from_status, to_status, from_priority, to_priority, created_at
     FROM request_history
     WHERE request_id = $1
     ORDER BY created_at, id`,
    [id]
  );

  // Building the representation (mapping, duplicated from the mapper).
  const events = historyResult.rows.map((row) => {
    if (row.type === 'priority_changed') {
      return {
        id: Number(row.id),
        type: row.type,
        fromPriority: row.from_priority,
        toPriority: row.to_priority,
        createdAt: row.created_at
      };
    }
    return {
      id: Number(row.id),
      type: row.type,
      fromStatus: row.from_status,
      toStatus: row.to_status,
      createdAt: row.created_at
    };
  });

  // Answering (HTTP again).
  res.status(200).json(events);
});
```

---

## Snippet DESPUÉS: Refactor objetivo

### 1. `requests.service.js` — Nueva función `getHistory`

```javascript
// Agregar al final de requests.service.js
import { findHistory } from './requests.store.js';
import { canViewHistory } from './request.policy.js';
import { mapHistoryEventRow } from './request.mapper.js';

export async function getHistory(actor, id) {
  const requestRow = await findById(id);
  if (!requestRow) throw notFound(id);

  const request = mapRequestRow(requestRow);
  if (!canViewHistory(actor, request)) throw notFound(id);

  const historyRows = await findHistory(id);
  return historyRows.map(mapHistoryEventRow);
}
```

### 2. `requests.routes.js` — Handler limpio

```javascript
// Eliminar: import { pool } from '../../database/pool.js';
// Eliminar: import { AppError } from '../../app-error.js';
// Agregar: import { getHistory } from './requests.service.js';

router.get('/:id/history', async (req, res) => {
  const id = parseIdParam(req.params.id);
  const events = await getHistory(req.auth, id);
  res.status(200).json(events);
});
```

### 3. Archivos que YA tienen lo necesario (no tocar)

| Archivo | Función existente | Lista |
|---------|-------------------|-------|
| `requests.store.js` | `findHistory(requestId, db?)` | L105-116 |
| `request.policy.js` | `canViewHistory(actor, request)` | L25-27 |
| `request.mapper.js` | `mapHistoryEventRow(row)` | L18-36 |

---

## Grafo de dependencias: ANTES vs DESPUÉS

### ANTES (con violación)

```mermaid
flowchart LR
    Routes[requests.routes.js]
    Service[requests.service.js]
    Store[requests.store.js]
    Policy[request.policy.js]
    Mapper[request.mapper.js]
    Pool[(pool)]
    DB[(PostgreSQL)]

    Routes --> Pool
    Routes --> Service
    Service --> Store
    Service --> Policy
    Service --> Mapper
    Store --> Pool
    Pool --> DB

    style Routes fill:#ffcccc,stroke:#ff0000
    style Pool fill:#ffcccc,stroke:#ff0000
```

### DESPUÉS (arquitectura limpia)

```mermaid
flowchart LR
    Routes[requests.routes.js]
    Service[requests.service.js]
    Store[requests.store.js]
    Policy[request.policy.js]
    Mapper[request.mapper.js]
    Pool[(pool)]
    DB[(PostgreSQL)]

    Routes --> Service
    Service --> Store
    Service --> Policy
    Service --> Mapper
    Store --> Pool
    Pool --> DB

    style Routes fill:#ccffcc,stroke:#00aa00
    style Service fill:#ccffcc,stroke:#00aa00
    style Store fill:#ccffcc,stroke:#00aa00
    style Policy fill:#ccffcc,stroke:#00aa00
    style Mapper fill:#ccffcc,stroke:#00aa00
```

---

## Checklist post-refactor

- [ ] `routes.js` **no importa** `pool` ni `AppError`
- [ ] `service.js` **no conoce** `express`, `req`, `res`
- [ ] `policy.js` sigue **sin deps salientes**
- [ ] `GET /:id/history` en routes < 15 líneas
- [ ] Tests `class-06` y `class-07` pasan sin cambios
- [ ] `request-status.js` sin tocar (reglas de dominio intactas)

---

## Referencias por clase

| Clase | Concepto | Archivo(s) |
|-------|----------|------------|
| 03 | Estados y transiciones | `request-status.js` |
| 04 | SQL, migraciones, pool | `requests.store.js` |
| 05 | AuthZ, policy | `request.policy.js` |
| 06 | Onboarding, tests, mapper | `request.mapper.js` |
| 07 | Diagnóstico, INC-701 | `parse-id.js` (validación ID) |
| 08 | Refactor `GET /:id/history` | **Este documento** |

---

## Nota de estudio

> La arquitectura no se logra creando archivos, se logra **agrupando por razón de cambio**.
>
> - `policy.js` no tiene flechas de salida → se prueba en milisegundos sin mocks
> - `store.js` solo conoce SQL → cambiar esquema no rompe HTTP
> - `routes.js` solo conoce HTTP → cambiar status code no toca SQL
>
> **Un módulo se entiende cuando puedes leer sus flechas sin encontrar ciclos.**