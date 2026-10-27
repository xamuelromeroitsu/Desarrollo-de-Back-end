# 10 — Requisitos no funcionales

## Seguridad

- passwords y device keys hasheadas;
- JWT firmado y expirado;
- refresh rotation si se implementa;
- consultas parametrizadas;
- validación de entrada;
- CORS con allowlist por ambiente (no `*` con credenciales);
- headers seguros;
- rate limiting por endpoint y contexto;
- logs sin secretos;
- permisos en backend;
- pruebas cross-tenant.
- denegación por defecto y contextos separados de usuario, dispositivo y público;
- `tenant_id` aplicado por el backend a cada lectura/escritura operativa;
- claves foráneas compuestas para impedir relaciones entre tenants;
- no confiar en tenant, identidad, precio, stock, estado ni ownership del cliente;
- credenciales de DB y Supabase solo en el servidor y con privilegio mínimo;
- errores externos sin SQL, stack traces, tokens ni configuración interna;
- request IDs y logs estructurados con redacción de datos sensibles;
- tamaños máximos de body, timeouts y límites explícitos de paginación.

## Confiabilidad

- transacciones en operaciones acopladas;
- idempotencia;
- timeouts;
- retries controlados;
- estados explícitos;
- reconciliación;
- shutdown ordenado;
- errores consistentes.

## Rendimiento

- índices documentados;
- paginación;
- evitar N+1 evidente;
- reportes con filtros;
- payloads limitados;
- catálogo público cacheable sin comprometer stock final.

No fijar números irreales. Medir localmente y documentar.

## Mantenibilidad

- módulos cohesionados;
- monolito modular por defecto; no introducir microservicios sin necesidad operativa demostrada;
- routes sin SQL;
- services sin Express;
- reglas comprobables;
- nombres consistentes;
- documentación de decisiones;
- dependencias justificadas.

Los límites recomendados son route/controller → service/use case → policy y
store/repository. Mantén una capa solo si posee una responsabilidad real; evita
capas vacías y dependencias circulares entre módulos.

## Observabilidad

- requestId;
- logs JSON;
- eventos importantes;
- health;
- readiness;
- métricas mínimas;
- auditoría.

## Accesibilidad y UX

- admin usable con teclado;
- contraste suficiente;
- feedback de carga/error;
- buyer mobile-first;
- estado de compra comprensible;
- no depender solamente del color;
- simulator visible en pantalla desktop.

## Configuración

- `.env.example`;
- validación al iniciar;
- valores por ambiente;
- no secretos en frontend;
- URLs configurables;
- timezone explícita.
- `.env` fuera de Git y credenciales rotables con acceso mínimo;
- fallar al iniciar ante configuración obligatoria inválida, sin imprimir el valor.

## Documentación operativa

- instalación;
- migraciones;
- seed;
- ejecución;
- pruebas;
- cuentas demo;
- recuperación;
- limitaciones.
