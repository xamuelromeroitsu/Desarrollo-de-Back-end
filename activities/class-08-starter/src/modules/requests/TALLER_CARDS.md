# Tarjetas del Taller — Referencia de Estudio

Estas 5 tarjetas son **herramientas de análisis**, no generadores de código. Úsalas en orden cuando la IA proponga estructura o cuando analices código.

---

## 1. Reducir la propuesta
> **Úsala SIEMPRE que la IA proponga estructura.**

> Propusiste N capas/archivos para este cambio.
> Para cada uno responde:
> 1. ¿Qué problema PRESENTE resuelve (no hipotético)?
> 2. ¿Qué costo agrega al lector?
> Elimina de tu propia propuesta todo lo que no resuelva un problema presente y muestra la versión mínima.

**Regla:** "Podría servir después" no es una razón — es un costo hoy por un beneficio imaginario.

---

## 2. Clasificar (análisis, no código)
> Aquí va un handler. Clasifica cada bloque en:
> HTTP / aplicación / negocio / persistencia / presentación / observabilidad.
> **NO propongas refactor todavía: solo el mapa.**

**Objetivo:** Ver qué responsabilidades conviven en un archivo antes de decidir mover algo.

---

## 3. Detectar acoplamiento
> ¿Qué sabe este archivo que no le corresponde?
> Lista cada detalle ajeno (columnas, status, req/res) y di a qué capa pertenece.
> **No reescribas nada.**

**Ejemplo en routes.js:**
- `pool.query` → persistencia (no le corresponde a HTTP)
- `req.auth.role` → autorización (negocio)
- `res.status(200)` → HTTP (sí le corresponde)

---

## 4. Planificar pasos
> Propón un plan de refactor en pasos PEQUEÑOS y REVERSIBLES.
> Después de cada paso la suite debe seguir verde.
> **Prohibido:** cambiar rutas, status, bodies o permisos.

**Ejemplo para GET /:id/history:**
1. Añadir `getHistory(actor, id)` en service (delega a store + policy + mapper)
2. Cambiar handler en routes para llamar a service
3. Eliminar `import { pool }` de routes
4. Tests verdes en cada paso

---

## 5. Revisar el refactor (después del diff)
> Aquí va mi diff de refactor. Busca cambios OBSERVABLES accidentales:
> rutas, status, bodies, permisos, códigos de error.
> Lista cada uno con su línea. **No sugieras mejoras de estilo.**

**Qué revisar:**
- ¿Cambió algún status code?
- ¿Cambió la forma del JSON de respuesta?
- ¿Cambió algún código de error (`INVALID_REQUEST_ID`, `FORBIDDEN`, etc.)?
- ¿Cambió qué usuario puede ver qué?

---

## Patrón común de uso

> **Pedir análisis con prohibiciones explícitas.**
> Cuando la respuesta incluye código que no pediste, esa es la señal para volver a la tarjeta.

---

## Aplicación a tu módulo `requests`

| Tarjeta | Qué reveló en tu código |
|---------|------------------------|
| **Clasificar** | `routes.js` mezclaba HTTP + persistencia + negocio + presentación |
| **Detectar acoplamiento** | `routes.js` conoce `pool`, columnas SQL, policy inline, mapping duplicado |
| **Reducir la propuesta** | 0 archivos nuevos, 0 capas — solo conectar lo que ya existe |
| **Planificar pasos** | 1) service.getHistory 2) routes delega 3) borrar pool import |
| **Revisar refactor** | Verificar que tests class-06/07 pasan sin cambios observables |

---

## Preguntas de verificación (auto-evaluación)

1. ¿Por qué una interfaz con una sola implementación es un costo neto?
2. ¿Qué convierte a la `policy` en estructura justificada y al `EventBus` en sobrearquitectura?
3. ¿Qué tienen en común las cinco tarjetas?

> **Respuesta 3:** Todas son **análisis con prohibiciones** — ninguna dice "escribe código". Todas obligan a mirar antes de tocar.