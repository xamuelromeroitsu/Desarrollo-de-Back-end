# Preserve request status history
*(Preservar el historial de estados de la solicitud)*

## Context
*(Contexto)*

Since class 03 the backlog carried the requirement "preserve the history of the request".
With persistence in place (class 04), we had to decide whether the system remembers only the
current status of each request or every transition it went through.
*(Desde la clase 03 el *backlog* traía el requisito "preservar el historial de la solicitud". Con la persistencia implementada (clase 04), tuvimos que decidir si el sistema recuerda únicamente el estado actual de cada solicitud o cada transición por la que pasó).*

## Options
*(Opciones)*

### Option 1: Keep only the current status
*(Opción 1: Mantener solo el estado actual)*

Benefits:
*(Beneficios)*

* Less data: one column, no extra table.
  *(Menos datos: una columna, sin tabla adicional).*
* Less code: no second write, no transaction needed for status changes.
  *(Menos código: sin segunda escritura, sin necesidad de transacción para los cambios de estado).*
* Every query stays trivially simple.
  *(Cada consulta se mantiene trivialmente simple).*

Costs:
*(Costos)*

* "When did this move to in_progress?" and "who reopened it?" become unanswerable.
  *(¿"Cuándo pasó a in_progress?" y "¿quién lo reabrió?" se vuelven preguntas imposibles de responder).*
* Auditing and diagnosing a dispute ("it was already resolved last week") is impossible.
  *(Auditar y diagnosticar una disputa ("ya estaba resuelto la semana pasada") es imposible).*
* The information is destroyed at the moment of each change — it cannot be reconstructed later.
  *(La información se destruye en el momento de cada cambio — no se puede reconstruir después).*

### Option 2: Store every status transition
*(Opción 2: Almacenar cada transición de estado)*

Benefits:
*(Beneficios)*

* Complete, queryable history per request, including its birth (`NULL → open`).
  *(Historial completo y consultable por solicitud, incluyendo su nacimiento `NULL → open`).*
* Auditing, diagnosis and future metrics (time in each status) become possible.
  *(La auditoría, el diagnóstico y futuras métricas (tiempo en cada estado) se vuelven posibles).*
* The foreign key ties every event to its request with database-level integrity.
  *(La clave foránea vincula cada evento a su solicitud con integridad a nivel de base de datos).*

Costs:
*(Costos)*

* A second table, a second write on every status change, and the code to keep them aligned.
  *(Una segunda tabla, una segunda escritura en cada cambio de estado y el código para mantenerlos sincronizados).*
* A consistency problem appears: a status change without its history row (or vice versa)
  makes the database lie. This forces the change to run inside a transaction.
  *(Aparece un problema de consistencia: un cambio de estado sin su fila de historial (o viceversa) hace que la base de datos mienta. Esto obliga a que el cambio se ejecute dentro de una transacción).*
* Storage grows with every transition (acceptable at this scale; revisit if it ever isn't).
  *(El almacenamiento crece con cada transición (aceptable a esta escala; se reevaluará si deja de serlo).*

## Decision
*(Decisión)*

Option 2. `request_status_history` stores one row per transition. Creation records
`NULL → open`; every later status change records `previous → new`. The status update and the
history insert run inside a single transaction (same client, `BEGIN`/`COMMIT`/`ROLLBACK`) so
both happen or neither does.
*(Opción 2. `request_status_history` almacena una fila por transición. La creación registra `NULL → open`; cada cambio de estado posterior registra `anterior → nuevo`. La actualización de estado y la inserción en el historial se ejecutan dentro de una sola transacción (mismo cliente, `BEGIN`/`COMMIT`/`ROLLBACK`) para que ambas ocurran o ninguna lo haga).*

## Consequences
*(Consecuencias)*

What do we gain?
*(¿Qué ganamos?)*

* `GET /requests/:id/history` and honest answers about the past.
  *(`GET /requests/:id/history` y respuestas honestas sobre el pasado).*
* Auditability that survives restarts and reaches every instance.
  *(Auditabilidad que sobrevive a reinicios y llega a cada instancia).*

What additional data and code appear?
*(¿Qué datos y código adicionales aparecen?)*

* The 002 migration, `insertStatusHistory` in the store, and the transactional unit in the
  service.
  *(La migración 002, `insertStatusHistory` en el almacén y la unidad transaccional en el servicio).*

What consistency problem must be handled?
*(¿Qué problema de consistencia debe manejarse?)*

* Two writes forming one logical unit — handled with `withTransaction`; a failure in either
  write rolls back both.
  *(Dos escrituras formando una unidad lógica — manejadas con `withTransaction`; un fallo en cualquiera de las escrituras revierte ambas).*

What queries become possible?
*(¿Qué consultas se vuelven posibles?)*

* Full timeline per request; later: time-per-status metrics, reopened-request counts.
  *(Línea de tiempo completa por solicitud; posteriormente: métricas de tiempo por estado, conteo de solicitudes reabiertas).*

What may need to change later?
*(¿Qué puede necesitar cambiar más adelante?)*

* If history grows large, an index on `request_status_history(request_id)` justified by the
  history query, or an archival policy — each as its own documented decision.
  *(Si el historial crece demasiado, un índice en `request_status_history(request_id)` justificado por la consulta de historial, o una política de archivo — cada una como su propia decisión documentada).*
