Segunda semana en el equipoCompletaste tu primer ticket y ahora mantienes la API de solicitudes junto al resto del equipo. El lunes te espera esto:


De: soporte@equipo
Para: guardia-backend
Asunto: usuarios reciben errores raros


Hola. Desde el viernes tenemos quejas:


1. "Some request identifiers return an
   internal server error."
2. "Updating some priorities produces an
   internal server error."
3. Cuando un usuario nos reenvía el error,
   no podemos encontrar QUÉ pasó: los
   mensajes del terminal no se pueden
   relacionar con ninguna petición.


¿Pueden investigar? Gracias.
Lo que soporte NO te dio
La causa (eso lo averiguas tú)
El archivo culpable
La certeza de que sea UN solo problema
Piensa
¿Qué parte del reporte es un hecho y qué parte es interpretación?
¿"A veces funciona y a veces no" es información útil? ¿Qué pregunta harías?
Un backend confiable no solo responde cuando todo funciona. También explica de forma segura qué ocurrió cuando algo falla.
Based on my analysis, here's the comprehensive plan to resolve all three incidents and implement OPS-703 traceability:

Plan: Class 07 Incident Response
Context
Three incidents from support:

INC-701: Invalid request IDs (text, decimals, zero, negative) → 500 instead of 400
INC-702: Invalid priorities → 500 instead of 400
OPS-703: No request IDs in responses/logs → can't correlate errors
Implementation Tasks (in dependency order)
1. Request ID Middleware (src/middleware/request-id.js)
Read X-Request-Id header, validate format: alphanumeric + ._-, max 64 chars
Generate req_${randomUUID()} if invalid/missing
Store in req.requestId, set res.set('X-Request-Id', ...), call next()
2. Request Logger Middleware (src/middleware/request-logger.js)
Record start: process.hrtime.bigint()
On res.on('finish'): build allowlist fields (requestId, method, path, status, durationMs, userId from req.auth, errorCode from res.locals.errorCode)
Log: logger.error('request_failed', fields) for status ≥500, else logger.info('request_completed', fields)
Call next() immediately (non-blocking)
3. Error Handler Middleware (src/middleware/error-handler.js)
If res.headersSent → return next(error)
AppError → map category to status, respond { error: { code, message }, requestId }
error.type === 'entity.parse.failed' → 400 INVALID_JSON
DB unreachable (INFRASTRUCTURE_CODES) → 503 DATABASE_UNAVAILABLE (log w/o connection string)
Else → 500 INTERNAL_ERROR (log full error, generic response)
Always set res.locals.errorCode for logger
4. Not-Found Middleware (src/middleware/not-found.js)
next(new AppError('resource', 'ROUTE_NOT_FOUND', 'The requested resource was not found.'))
5. Health Routes (src/routes/health.routes.js)
GET /health → 200 { status: 'ok' } (no DB)
GET /ready → injectable checkDatabase (default SELECT 1), success → 200 { status: 'ready', database: 'available' }, failure → 503 { status: 'not_ready', database: 'unavailable' } (no internals leaked)
6. Wire Middlewares in app.js (correct order)
corsPolicy
express.json()
requestId          ← NEW (before routes)
requestLogger      ← NEW (before routes)
/auth routes
/authenticate
/requests routes
notFound           ← NEW (after routes, before errorHandler)
errorHandler       ← NEW (last)
7. INC-701 Fix: Validate request ID in routes
In requests.routes.js: validate req.params.id is a positive integer before calling service
Reject non-numeric, decimals, zero, negatives → 400 INVALID_REQUEST_ID
This prevents SQL execution with invalid IDs
8. INC-702 Fix: Validate priority in service
In requests.service.js: add priority validation in createRequest and patchRequest before transaction/SQL
Valid: ['low', 'medium', 'high'] → throw AppError('contract', 'INVALID_PRIORITY', ...)
Also validates on creation (POST /requests)
Validation Steps
# 1. Reproduce incidents (should all show REPRODUCED)
npm run incidents:reproduce

# 2. Run test suite
npm test

# 3. Final validator (must pass 12/12)
npm run validate:class-07
Key Design Decisions
Request ID: Not a secret; JWT ≠ request ID (token identifies user, request ID identifies one HTTP exchange)
Logger allowlist: Never log headers/body (leaks tokens); explicit fields only
Error shape: Every error body = { error: { code, message }, requestId } — consistent for support
Validation timing: Input validation before DB (contract errors ≠ 500)
Health vs Ready: Liveness (process alive) ≠ Readiness (can serve traffic)
Questions for You
Priority validation location: Should INVALID_PRIORITY be validated in routes (like request ID) or in service (current plan)? Service keeps domain logic centralized but runs after auth; routes fails faster.
Request ID format: The skeleton suggests req_${randomUUID()}. Any preference for a different prefix/format?
Health check injection: The validator replaces pool.query. Is the current createHealthRouter({ checkDatabase }) pattern acceptable, or do you want a different DI approach?
Ready to implement when you confirm.

explicame en espanol
Plan: Respuesta a Incidentes - Clase 07
Los 3 Incidentes
INC-701: IDs inválidos (texto, decimales, 0, negativos) → 500 en lugar de 400
INC-702: Prioridades inválidas → 500 en lugar de 400
OPS-703: Sin request IDs en respuestas/logs → no se pueden correlacionar errores
Tareas de Implementación (orden de dependencia)
#	Archivo	Qué hace
1	src/middleware/request-id.js	Genera/valida X-Request-Id, lo guarda en req.requestId, lo devuelve en header
2	src/middleware/request-logger.js	Log JSON por request (allowlist: requestId, method, path, status, durationMs, userId, errorCode)
3	src/middleware/error-handler.js	Único lugar que convierte errores → HTTP. Maneja AppError, JSON inválido, DB down, inesperados
4	src/middleware/not-found.js	404 JSON consistente cuando no hay ruta
5	src/routes/health.routes.js	/health (liveness, sin DB) + /ready (readiness, checkea DB)
6	src/app.js	Registra middlewares en orden correcto
7	src/modules/requests/requests.routes.js	Valida ID antes de llamar al servicio (rechaza no enteros positivos)
8	src/modules/requests/requests.service.js	Valida prioridad antes de SQL (en create y patch)
Orden en app.js
corsPolicy
express.json()
requestId          ← nuevo (primero, antes de rutas)
requestLogger      ← nuevo
/auth routes
/authenticate
/requests routes
notFound           ← nuevo (después de rutas, antes de errorHandler)
errorHandler       ← nuevo (último)
Decisiones Clave
Request ID: No es secreto; JWT ≠ request ID (token = usuario, request ID = una petición HTTP)
Logger: Allowlist explícita — nunca loguear headers/body (filtra tokens)
Shape de error: Siempre { error: { code, message }, requestId } — consistente para soporte
Validación: Contrato antes de BD (errores 4xx ≠ 500)
Health vs Ready: Proceso vivo ≠ listo para servir tráfico
Validación
npm run incidents:reproduce  # Debe mostrar REPRODUCED x3
npm test                     # Suite completa
npm run validate:class-07    # 12/12 checks deben pasar
Preguntas antes de implementar
¿Dónde validar prioridad? En routes (falla más rápido) o en service (lógica centralizada, actual)?
Formato request ID: req_${randomUUID()} está bien o prefieres otro prefijo?
Health check DI: El patrón createHealthRouter({ checkDatabase }) ¿te parece bien o quieres otro enfoque?
la base de datos esta conectada
Entendido. La base de datos está lista.

¿Quieres que empiece a implementar el plan? Los pasos son:

Middlewares nuevos (request-id, request-logger, error-handler, not-found)
Health routes (/health, /ready)
Wire en app.js (orden correcto)
Fix INC-701: validar ID en requests.routes.js
Fix INC-702: validar prioridad en requests.service.js
¿Alguna preferencia en las 3 preguntas que dejé abiertas, o arranco con la implementación tal como está planificada?

lee el .env
El .env ya está configurado:

DATABASE_URL: Supabase pooler (puerto 6543) - mismo proyecto que clase 06
JWT_SECRET: Generado y listo
PORT: 3000
La base de datos está conectada y lista para usar.

¿Arranco con la implementación del plan? (middlewares → health routes → app.js → fixes INC-701/702)

npm run class-07:doctor LASS 07 ENVIRONMENT CHECK

[01/07] Environment configured ............... PASS
[02/07] Database connection established ...... PASS
[03/07] Migrations available ................. PASS
[04/07] Seed data available .................. PASS
[05/07] Application can be imported .......... PASS
[06/07] Test runner available ................ PASS
[07/07] Incident fixtures available .......... PASS


Environment ready for incident response.


use la misma confi qyue el 6 como lo hago para enviar o revisar que si este con el otro proyecto ejemplo que se le halla cambiado la clave
Los 3 incidentes se reproducen correctamente. El environment check y el seed confirman que usa la misma BD/proyecto Supabase que la clase 06 (DATABASE_URL idéntico, seed users funcionan, JWT_SECRET válido).

Plan de Implementación (Read-Only - sin cambios aún)
Estado actual
✅ BD conectada, migraciones aplicadas, seed cargado
✅ 3 incidentes reproducidos (INC-701, INC-702, OPS-703)
❌ Fixes pendientes
Orden de implementación
Paso	Archivo	Acción
1	src/middleware/request-id.js	Implementar: leer/validar X-Request-Id, generar req_${uuid}, set header
2	src/middleware/request-logger.js	Implementar: log JSON en finish con allowlist (requestId, method, path, status, durationMs, userId, errorCode)
3	src/middleware/error-handler.js	Implementar: handler central 4 params, mapear AppError → status, JSON inválido → 400, DB down → 503, otros → 500 genérico, set res.locals.errorCode
4	src/middleware/not-found.js	Implementar: next(new AppError('resource', 'ROUTE_NOT_FOUND', 'The requested resource was not found.'))
5	src/routes/health.routes.js	Implementar: GET /health (200 ok, sin DB), GET /ready (check DB inyectable, 200/503)
6	src/app.js	Registrar middlewares en orden: requestId → requestLogger → routes → notFound → errorHandler
7	src/modules/requests/requests.routes.js	Validar req.params.id = entero positivo antes de llamar al service (rechazar texto, decimales, 0, negativos → 400 INVALID_REQUEST_ID)
8	src/modules/requests/requests.service.js	Validar prioridad en createRequest y patchRequest antes de transacción (valores: low/medium/high → 400 INVALID_PRIORITY)
Validación final
npm run incidents:reproduce  # Debe mostrar RESOLVED x3
npm test                     # Suite completa
npm run validate:class-07    # 12/12 checks PASS
Preguntas antes de ejecutar
Prioridad: ¿Validar en routes (falla rápido) o en service (centralizado, plan actual)?
Request ID format: req_${randomUUID()} ¿ok o prefieres otro?
¿Procedo con la implementación completa? (8 archivos, ~200 líneas de código nuevo)
como creo una llave jwt
Antes de escribir código: Checklist Diagnóstico Profesional
Ya hiciste el paso 1 (reproducir). Ahora pasos 2-4 son obligatorios:

✅ Lo que YA tienes hecho
npm run class-07:doctor → 7/7 PASS (baseline)
npm test → 20 pass, 17 todo (suite verde)
npm run incidents:reproduce → 3 REPRODUCED
incident-report.md → Baseline + INC-701 Report/Reproduction/Expected/Actual
🔴 Lo que FALTA antes de tocar código
Paso	INC-701	INC-702	OPS-703
Hypotheses (≥2 c/u con comprobación)	✅ Te la di	❌ Tú la escribes	❌ Pendiente
Evidence (logs, código, REPL)	✅ Te la di	❌ Tras tus hypotheses	❌ Pendiente
Confirmed Cause (archivo + línea)	✅ Te la di	❌ Tras evidence	❌ Pendiente
Correction (cambio mínimo)	✅ Te la di	❌ Tras cause	❌ Pendiente
Regression Test (qué test valida)	✅ Te la di	❌ Tras correction	❌ Pendiente
Tu tarea AHORA: Completar INC-702 Hypotheses
Lee estos archivos solo para formar hypotheses (no para fixear):

# 1. ¿Dónde se valida priority?
cat src/modules/requests/requests.service.js | head -80

# 2. ¿Qué pasa en el store?
cat src/modules/requests/requests.store.js | grep -A 20 updateRequest

# 3. ¿Qué constraint hay en BD? (mira migraciones)
cat src/database/migrations/002_create_requests.sql 2>/dev/null || echo "ver migraciones"
Escribe en tu incident-report.md (solo INC-702 Hypotheses):
### Hypotheses

H1: _______________________________________________________________
Comprobación: _____________________________________________________

H2: _______________________________________________________________
Comprobación: _____________________________________________________

H3 (opcional): ____________________________________________________
Comprobación: _____________________________________________________
Pista para tus hypotheses INC-702
Pregunta	Dónde buscar
¿Se valida priority en el router?	requests.routes.js
¿Se valida en el service?	requests.service.js líneas 120-200
¿Se valida en el store/BD?	requests.store.js + migración SQL
¿Qué valores acepta la BD?	Constraint CHECK en requests table
Cuando termines las hypotheses de INC-702
Me las muestras → te doy la Evidence guiada → tú escribes Cause/Correction/Test → repetimos para OPS-703.

¿Quieres que espere mientras escribes las 2-3 hypotheses de INC-702?