# Ruta práctica para completar el MVP de M24

Este documento convierte las especificaciones de M24 en un orden de trabajo. La meta es completar primero un recorrido funcional y demostrable, no construir todas las pantallas ni todos los módulos al mismo tiempo.

La implementación inicial vive separada de la guía en
[`../../projects/m24-vending-platform/`](../../projects/m24-vending-platform/).
El código actual cubre health/readiness, migración/seed de catálogo y la ruta
pública; órdenes, pagos, despacho e interfaces todavía están pendientes.

## 1. Qué cuenta como MVP

El MVP demuestra, con datos de prueba y de extremo a extremo, que una máquina vending puede publicar su catálogo, aceptar una compra, simular el pago y el despacho, y dejar el inventario consistente.

```text
Tenant y datos de demostración
→ ubicación y máquina activa
→ producto, slot e inventario
→ catálogo público por publicCode
→ orden con reserva de stock
→ pago simulado
→ trabajo recibido y completado por el simulador
→ orden e inventario actualizados
```

### Incluido en el MVP

- API backend y PostgreSQL/Supabase con migraciones y seed repetible.
- Dos tenants de demostración para comprobar aislamiento; el modelo y las consultas deben conservar `tenant_id` desde el principio.
- Ubicación, máquina, producto, slot e inventario de demostración.
- Catálogo público de una máquina mediante `publicCode`.
- Creación de orden con precio calculado en el servidor y reserva de inventario.
- Pago simulado aprobado y creación de un único trabajo de despacho.
- Identidad de dispositivo separada de la identidad de usuario, aunque el simulador sea una interfaz mínima.
- Simulador que reclama y completa el trabajo.
- Pruebas para el camino feliz, aislamiento entre tenants, stock insuficiente, reintentos y doble confirmación.
- Instrucciones reproducibles para arrancar y verificar el proyecto.

### Puede esperar después del MVP

- Panel administrativo completo, permisos configurables y gestión avanzada de usuarios.
- Todos los reportes, filtros y dashboards.
- Pagos reales, hardware real, notificaciones y aplicación móvil nativa.
- Automatizaciones y operación de producción no necesarias para demostrar el recorrido.

No se deben posponer las invariantes de seguridad o consistencia para “después”: aislamiento por tenant, consultas parametrizadas, validación del servidor, operaciones transaccionales e idempotencia crítica pertenecen al MVP.

## 2. Pasos para empezar hoy

1. **Confirma el repositorio y el estado de trabajo.** Desde la raíz de tu repositorio:

   ```powershell
   git status --short
   git remote -v
   node --version
   npm --version
   ```

   Asegúrate de estar en tu repositorio y no incluyas archivos `.env`, contraseñas, tokens ni claves en commits o conversaciones.

2. **Lee solo las especificaciones que guían la primera vertical:**
   - `specification/01-PRODUCT-SCOPE.md`
   - `specification/02-SYSTEM-ARCHITECTURE.md`
   - `specification/03-DATA-MODEL.md`
   - `specification/06-API-CONTRACT.md`
   - `specification/07-BUSINESS-RULES.md`
   - `specification/05-STATE-MACHINES.md`

3. **Escribe tu decisión inicial** en `templates/implementation-plan.md`: estructura, lenguaje y framework, conexión a PostgreSQL, estrategia para migraciones, primera vertical y cómo vas a probar el aislamiento.

4. **Separa la aplicación del material de clase.** Implementa M24 en `projects/m24-vending-platform/`, manteniendo `activities/m24-class-autoguide/` como guía y especificación. El `package.json` de la raíz corresponde al curso y no configura por sí solo las aplicaciones M24.

5. **Crea una base ejecutable antes de sumar funciones.** Añade el backend, una ruta `GET /health`, configuración validada desde variables de entorno, conexión a base de datos, migración inicial y seed. Usa `.env.example` para documentar nombres de variables; no pongas valores secretos allí.

6. **Construye en capas verticales**, siguiendo las fases de abajo. Cada fase termina con una evidencia: prueba, petición reproducible, salida de comando o captura sin secretos.

7. **Registra las decisiones y bloqueos** en `templates/architecture-decisions.md`, `templates/ai-usage.md` y `templates/evidence.md`, según corresponda.

8. **Valida antes de ampliar el alcance.** Ejecuta las pruebas del proyecto y, cuando la API cumpla el contrato requerido, configura y ejecuta el validador descrito en `validator/README.md`.

## 3. Ruta de implementación del MVP

### Fase 0 — Preparar el repositorio

**Construir**

- Mantener un monolito modular: `apps/api`, `apps/admin-web`, `apps/vending-web`, `database/migrations`, `database/seed`, `docs` y `tests`. Inicia solo los componentes que necesita la vertical.
- Definir comandos para desarrollo, pruebas, migraciones y seed.
- Documentar las variables necesarias en `.env.example`.
- Añadir `GET /health` y una comprobación de readiness que informe si la base de datos está disponible.
- Mantener PostgreSQL accesible solo desde el backend; no exponer credenciales en las apps web.

**Verificar**

- Una persona puede instalar dependencias y arrancar la API siguiendo el README.
- `GET /health` responde aunque la base de datos no esté disponible; readiness sí refleja la indisponibilidad.
- No se necesitan credenciales reales dentro del repositorio.
- Configuración inválida falla al iniciar sin imprimir el valor de los secretos.

### Fase 1 — Esquema y datos de demostración

**Construir primero**

- `tenants`
- `locations`
- `vending_machines`
- `products`
- `machine_slots`

Incluye claves foráneas, timestamps, unicidad de `public_code`, unicidad de códigos dentro del tenant y checks que impidan cantidades negativas o violaciones de `reserved <= on_hand <= capacity`. Usa claves foráneas compuestas para que máquina, ubicación, producto y slot no puedan relacionarse entre tenants distintos.

El seed debe crear al menos un tenant, una ubicación, una máquina activa, un producto y un slot con stock. Guarda en la documentación los valores públicos de demostración, como `publicCode`; no guardes claves de dispositivo reales en claro.

**Verificar**

- La migración puede ejecutarse sobre una base vacía y el estado resultante es comprobable.
- Ejecutar el seed más de una vez no duplica datos ni deja la base inconsistente.
- Una referencia de una máquina, producto o slot de otro tenant no se acepta.

### Fase 2 — Catálogo público

**Construir**

- `GET /api/v1/public/machines/:publicCode`
- `GET /api/v1/public/machines/:publicCode/catalog`

Resuelve la máquina usando el `publicCode` y deriva de ella el tenant. Devuelve únicamente datos públicos necesarios para mostrar la máquina y los productos disponibles. No aceptes `tenantId`, precio o stock como autoridad enviada por el navegador.

**Verificar**

- Máquina activa: catálogo correcto.
- Código inexistente, máquina suspendida o tenant no operativo: respuesta coherente con el contrato.
- El resultado no muestra registros de otra máquina ni información privada.

### Fase 3 — Órdenes y reserva de stock

**Construir**

- Tablas de órdenes, líneas de orden, reservas e idempotencia.
- `POST /api/v1/public/machines/:publicCode/orders`.
- Validación de cantidades y slots, precio calculado por el servidor y snapshot del producto/precio.
- Creación de orden y reserva en una transacción.
- Expiración o cancelación que libere la reserva sin duplicar movimientos.

Usa `Idempotency-Key`: repetir la misma petición debe devolver el resultado existente; reutilizar la clave con un cuerpo diferente debe producir un conflicto documentado.

**Verificar**

- Stock insuficiente no crea una orden parcial ni deja una reserva huérfana.
- Dos solicitudes simultáneas intentando comprar la última unidad no pueden reservar ambas.
- Alterar el precio en la petición no altera el precio de la orden.
- Repetir una solicitud con la misma clave no duplica orden ni reserva.

### Fase 4 — Pago simulado

**Construir**

- Registro de pagos con proveedor `simulation`.
- `POST /api/v1/public/orders/:publicToken/payments/simulate`.
- Escenario aprobado como recorrido MVP; conserva respuestas de rechazo y timeout como pruebas negativas.
- Transacción que registra el pago aprobado, avanza la orden y crea exactamente un trabajo de despacho.

El total se obtiene de la orden en la base de datos, nunca del cuerpo del cliente. El token público de la orden debe ser aleatorio y persistirse de forma segura, de acuerdo con la especificación.

**Verificar**

- El pago rechazado no crea un trabajo.
- El importe no se puede manipular desde el cliente.
- Reintentar un pago aprobado no crea otro pago efectivo ni otro trabajo.
- Orden, pago y trabajo no quedan en estados incompatibles si ocurre un error.

### Fase 5 — Identidad del dispositivo y despacho simulado

**Construir**

- Endpoints de dispositivo necesarios: autenticación, consulta/reclamo de trabajo, inicio y finalización.
- Credencial de dispositivo almacenada como hash y contexto de dispositivo asociado a una máquina.
- Simulador mínimo que pueda consultar un trabajo y reportar éxito; puede ser una página sencilla o cliente de desarrollo.
- Finalización transaccional: consumir la reserva, registrar movimiento de inventario, completar el trabajo y completar la orden.

No confíes en un `machineId` o `tenantId` libre enviado después de autenticar el dispositivo. El servidor obtiene esa identidad del contexto autenticado.

**Verificar**

- Un dispositivo no puede consultar ni completar trabajos de otra máquina.
- Un trabajo solo puede reclamarse una vez.
- Una confirmación repetida no descuenta stock ni crea movimientos duplicados.
- Un despacho fallido conserva estado y evidencia; no se registra como venta completada.

### Fase 6 — Interfaz mínima y demo de extremo a extremo

**Construir**

- Web del comprador: mostrar catálogo, seleccionar cantidad, crear orden, simular pago y consultar el estado.
- Simulador de vending: mostrar la máquina y ejecutar el despacho pendiente.
- Administración mínima: usa seed o una pantalla restringida para configurar datos de demo; no amplíes todavía a un panel CRUD completo si eso retrasa la ruta crítica.

**Verificar**

Completa el flujo con el navegador y muestra la misma operación en la base de datos/API:

```text
catálogo → orden → reserva → pago aprobado → trabajo → despacho
→ reserva consumida → inventario reducido → orden completada
```

### Fase 7 — Endurecer, documentar y entregar el MVP

**Construir**

- Tests unitarios para reglas de estado y políticas.
- Tests de integración para persistencia, transacciones e idempotencia.
- Tests de API para respuestas y errores.
- Pruebas negativas entre dos tenants y entre dos dispositivos.
- README con prerequisitos, instalación, variables, migración, seed, ejecución y pruebas.
- Evidencia del flujo, decisiones conocidas y limitaciones.

**Verificar**

- Migraciones y seed funcionan desde una base limpia.
- Suite de pruebas en verde.
- El validador común pasa las verificaciones compatibles con el MVP; reporta y documenta claramente cualquier sección todavía fuera de alcance.
- Una persona distinta puede reproducir la demo siguiendo el README.

## 4. Orden de dependencias

```text
Repositorio y configuración
  → modelo base, migraciones y seed
  → catálogo público
  → órdenes y reservas
  → pago simulado
  → autenticación de dispositivo y despacho
  → interfaz mínima
  → pruebas, evidencia y validación
```

No construyas primero las tres interfaces completas: la API y las invariantes deben funcionar antes de invertir tiempo en pulir pantallas.

## 5. Criterio de terminado del MVP

El MVP está listo cuando todas estas afirmaciones se pueden demostrar:

- [ ] El proyecto arranca desde instrucciones limpias.
- [ ] La base puede crearse con migraciones y cargarse con seed repetible.
- [ ] El catálogo de una máquina se obtiene mediante `publicCode`.
- [ ] El servidor calcula el precio y reserva stock correctamente.
- [ ] Las compras concurrentes no sobre-venden la última unidad.
- [ ] Una orden pagada produce un solo trabajo de despacho.
- [ ] Solo el dispositivo de la máquina correspondiente puede reclamar y completar ese trabajo.
- [ ] Completar el trabajo actualiza orden e inventario exactamente una vez.
- [ ] Hay pruebas para errores, reintentos y aislamiento.
- [ ] La demo y sus limitaciones están documentadas sin secretos.

## 6. Después del MVP: completar la entrega M24

Cuando el recorrido vertical esté estable, continúa con la especificación completa:

1. Login, memberships, selección de tenant y permisos RBAC.
2. Administración de tenants, usuarios, ubicaciones, máquinas, productos y slots.
3. Abastecimiento, ajustes de inventario y ledger completo.
4. Expiración automática de reservas, reintentos y reconciliación.
5. Reportes, auditoría navegable, filtros y permisos.
6. Manejo uniforme de errores, rate limiting, logs sanitizados, health/readiness e índices.
7. Pruebas de aceptación, demo de dos tenants, documentación final y tag `m24-final-submission`.

Usa `specification/11-ACCEPTANCE-CRITERIA.md`, `specification/12-TEST-MATRIX.md` y `specification/13-WEEKLY-ROADMAP.md` como checklist de esta ampliación. El MVP no sustituye los requisitos de entrega final: define el primer resultado integrado y verificable.
