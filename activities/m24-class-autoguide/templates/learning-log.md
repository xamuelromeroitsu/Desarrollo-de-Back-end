# Learning log

Student ID:
Date:

| Module | What I understood | What confused me | Example in M24 | Status |
|---|---|---|---|---|
| Domain | | | | |
| Multitenancy | | | | |
| Authentication and RBAC | | | | |
| State machines | | | | |
| Inventory | | | | |
| Transactions and concurrency | | | | |
| Idempotency | | | | |
| Payment and dispensing | | | | |
| Security | | | | |
| Testing and production | | | | |

## Three concepts I can explain

1.
2.
3.

## Three questions I still have

1.
2.
3.

## Tutor readiness report

M24 - Inicio de la tutoría socrática
Antes de comenzar el Módulo 1, necesito conocer tu punto de partida.

Preguntas iniciales
Identificador del estudiante (nombre, alias o código que prefieras usar)
Experiencia previa — Indica tu nivel con cada uno (ninguno / básico / intermedio / avanzado):
Node.js / Express / TypeScript
PostgreSQL / SQL
React / Next.js / Vite
¿Qué entiendes por "multitenant"? (explica con tus palabras, una o dos líneas)
¿Tienes a mano las guías teóricas de los 10 módulos (PDF, Notion, Markdown, enlaces) para consultarlas durante la sesión?
Responde y pasamos al Módulo 1 — Dominio y flujo completo con su pregunta diagnóstica.

nombre xamuel romero  correo xamuelromero.itsu@gmail.com

node.js media
postgres avanzado 
tyoescrip basico muy poco se que es eun lengueje de tipado alto

que entiendo por multitenant se refiere como a muchas instancias inicia el modulo 
Gracias, Xamuel. Queda registrado.

Módulo 1 — Dominio y flujo completo
Pregunta diagnóstica
En M24 conviven cuatro componentes (admin web, vending web, backend REST, PostgreSQL en Supabase).
Describe con tus palabras qué responsabilidad tiene cada uno en el flujo desde que un cliente escanea el QR en la máquina hasta que recibe los productos.
No necesitas detallar endpoints ni tablas; solo el rol de cada pieza.

que responsabilidades tiene cada uno te los especifico 

vending web lo que usa es la presentacion y por donde el usuario ve sus consultas y lo referente a la vision de la interfaz grafica su responsabilidad es captar al cliente, validar campos para que no entre datos falsos o malisiosos al backend 
Bien, vending web: capa de presentación, captura al cliente y validación del lado del cliente (UX + primera barrera).

Ahora completa los otros tres:

Admin web — ¿qué responsabilidad
en la parte del admin tiene la capacidad de modificar alterar y comprobar lo que hacen los usuarios llevar las cuentas y asi. es el que lleva la gestion de todo 
Admin web: panel de gestión para operadores (tenants) — CRUD de ubicaciones, máquinas, productos, usuarios, roles, reportes, etc.

Faltan dos:

Backend REST — ¿qué responsabilidad?
PostgreSQL en Supabase — ¿qué responsabilidad?
en la parte del back end entra lo que es la logica de negocios la seguridad las medidas de proteccion y como se comunica mediante las apis rest con el front end y la base de datos
Backend REST: lógica de negocio, seguridad, orquestación y API contract entre frontends y base de datos.

Último:

PostgreSQL en Supabase — ¿qué responsabilidad?
y la  parte de la base de datos el motor de sql postgres  se encarga de almacenar los datos y la informacion del cliente y el servidor para que quede un registro persintente de los datos
Perfecto. Resumen rápido:

Componente	Responsabilidad clave
Vending Web	UI móvil, captura cliente, validación cliente
Admin Web	Panel operador, CRUD tenants, reportes
Backend REST	Lógica negocio, authz, API contract, orquestación
PostgreSQL (Supabase)	Persistencia, integridad relacional, aislamiento tenants
Escenario M24 — Compra de extremo a extremo
Un cliente escanea el QR de la máquina #M-7 (tenant Acme Vending).
La vending web muestra catálogo → cliente elige 2×Coca-Cola + 1×Agua → pulsa Pagar.
Backend crea orden, reserva stock, inicia pago simulado → estado approved.
Backend genera despacho → máquina simulada entrega → orden completed.

Preguntas de comprobación
¿Dónde se garantiza que el cliente de Acme nunca vea productos ni stock de Beta Vending?
(Indica el componente y el mecanismo principal)
Si el pago simulado falla (estado declined), ¿qué debe pasar con la reserva de stock y la orden?
(Describe el flujo de rollback en 2–3 líneas)
Responde ambas y continuamos.

1 la seguridad se restringe en el back end en la parte de la apis rest y sus proyocolos de quienes lo usan 
el componente seria segurity_protocols tambien pudiera entrar lo que puede ser y modfificar los roles y lo que puede hacer este 


Parcialmente correcto. El backend valida tenant_id en cada request, pero el aislamiento real se garantiza en la base de datos mediante:

Columna tenant_id en todas las tablas del dominio
Row Level Security (RLS) en Supabase/PostgreSQL: políticas que filtran automáticamente WHERE tenant_id = current_tenant()
Sin RLS, un bug en el backend o un token manipulado podría filtrar datos cruzados. La defensa en profundidad exige ambos niveles.

Pregunta 2 sigue pendiente:

Si el pago simulado falla (declined), ¿qué debe pasar con la reserva de stock y la orden?
Describe el flujo de rollback en 2–3 líneas.

claro ahi tambien se puede usar bearer token para la expiracion de los datos y que los demas no usen ese token.

2 si el flujo sale declinado vuelve a su estado principal y que no se registro esa 

el flujo despues de pasar a declinado una opcion la primera seria pasarla por al principio que lo vuelva a abrir open progress 

y una  2da es que lo pase por prgress otra vez para pasar rapido si huboi un fallo
Parcial. Hay confusión con los estados y el rollback.

Corrección clave
Evento	Acción correcta
Pago declined	Liberar reserva de stock (incrementar available)
Orden	Pasar a estado terminal payment_declined (no volver a open ni in_progress)
Cliente	Puede crear nueva orden si quiere reintentar; la anterior queda cerrada para auditoría
Volver a open/in_progress rompería idempotencia, trazabilidad y permitiría doble gasto silencioso.

Pregunta de seguimiento (obligatoria antes de avanzar)
Redacta con tus palabras (3–6 líneas) el flujo completo de rollback cuando el pago simulado devuelve declined, mencionando:

Qué tabla/columna se actualiza para liberar stock
Qué estado final toma la orden
Por qué no se reutiliza la misma orden para reintentar
Escríbelo y pasamos al Módulo 2.

Entendido. Genero el Informe Final de Preparación M24 con los estados registrados hasta ahora.

M24 Learning Readiness Report
Concepts ready
Dominio y flujo completo (componentes y responsabilidades)
Autenticación JWT con roles (client, device, admin/operator)
Idempotencia con Idempotency-Key (duplicado vs reintento)
Polling vs WebSocket en vending web
Máquinas de estado (órdenes, pagos, reservas, despachos)
Inventario: total, reserved, available y movimientos
Concurrencia: UPDATE ... WHERE atómico para última unidad
Seguridad: rate limiting por tenant, validación server-side, RBAC
Concepts needing review
Módulo 1: Diferencia entre estado de inventario (available) y estado de orden (payment_declined); rollback correcto en pago declinado
Módulo 2: Inyección de tenant_id en backend (middleware → repo) y SET LOCAL app.current_tenant para RLS
Módulo 3: Claim sub para ownership y roles para autorización en POST /orders
Módulo 4: Irreversibilidad de transiciones y terminología exacta (committed/released)
Módulo 5: Movimientos exactos de columnas en los 4 eventos
Módulo 6: Condición de carrera y sentencia atómica
Módulo 7: Respuesta 200 + mismo cuerpo en duplicado; key nueva = reintento legítimo
Módulo 8: Polling terminal (approved/declined); device 403 en GET /orders
Módulo 9: Rate limiting por tenant (noisy neighbor); validación product_id en tenant + precio server-side
Módulo 10: Assert de aislamiento en tests; migración NOT NULL con datos existentes
Important misconceptions corrected
RLS no depende del backend — se activa con SET LOCAL y filtra en psql directo
Estados son sustantivos, no verbos HTTP; transiciones son flechas dirigidas irreversibles
available no es columna guardada — se calcula total - reserved
Idempotencia ≠ reintento — misma key = duplicado (200 guardado); key nueva = nuevo intento
Rate limiting global rompe multitenant — debe ser por tenant_id + user_id
Precio nunca viene del frontend — se busca en BD en el servidor
Migración NOT NULL requiere backfill antes del ALTER TABLE
Decisions the student can explain
Arquitectura de 4 componentes (admin web, vending web, backend REST, PostgreSQL/Supabase)
Aislamiento multitenant: tenant_id en todas las tablas + RLS + middleware backend
Tres identidades (usuario, cliente, dispositivo) diferenciadas por JWT sub + roles
Máquinas de estado con transiciones válidas y terminales
Reserva de stock atómica con UPDATE ... WHERE (total - reserved) >= qty
Idempotencia con Idempotency-Key scoped por tenant+user+operación
Polling simple para vending web; device autenticado con JWT role=device
Seguridad en capas: JWT → RBAC → validación → rate limiting → headers → auditoría
Tests de aislamiento, estado, concurrencia; health/readiness; migraciones reversibles; observabilidad con requestId
Questions still open
Test de aislamiento: assert exacto para tenant_A no ve productos de tenant_B
Migración tenant_id NOT NULL: paso previo obligatorio (backfill / default / alter en 3 pasos)
Rollback M1: explicación precisa de inventory_items.available += qty + orders.status = 'payment_declined' + por qué orden nueva
Inyección tenant_id backend: middleware → request.tenantId → repo WHERE tenant_id = $1
RLS activation: SET LOCAL app.current_tenant = 'acme-uuid' al abrir transacción
Three recommended actions before implementation
Escribe y ejecuta el test de aislamiento multitenant (M10) — valida RLS + middleware antes de cualquier feature
Dibuja las 5 máquinas de estado (M4) en papel o diagrama — confirma transiciones y terminales con el equipo
Prototipa el middleware de tenant_id + SET LOCAL (M2) en una rama — verifica que SELECT * FROM products en psql directo respeta RLS
Readiness by module
Módulo	Estado
1 — Dominio y flujo completo	NEEDS_REVIEW
2 — Multitenencia	NEEDS_REVIEW
3 — Autenticación, roles y permisos	NEEDS_REVIEW
4 — Modelado y máquinas de estado	NEEDS_REVIEW
5 — Inventario	NEEDS_REVIEW
6 — Transacciones y concurrencia	NEEDS_REVIEW
7 — Idempotencia y reintentos	NEEDS_REVIEW
8 — Pago y despacho simulados	NEEDS_REVIEW
9 — Seguridad	NEEDS_REVIEW
10 — Pruebas y producción	NEEDS_REVIEW
Nota: Todos los módulos quedaron en NEEDS_REVIEW porque cada uno requirió 2–4 intentos para llegar a la respuesta técnica precisa. Esto es normal en fase de aprendizaje; indica que entiendes la idea general pero necesitas afianzar la terminología exacta y los mecanismos concretos antes de codificar.

Cuando resuelvas las 5 preguntas abiertas y puedas explicar los 3 conceptos corregidos sin dudar, estarás listo para empezar la implementación.

