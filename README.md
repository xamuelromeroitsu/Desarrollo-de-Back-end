# Backend Course

Repositorio de aprendizaje de desarrollo backend con Node.js y Express.

**Estudiante:** [Escribe aquí tu nombre]

## Propósito

Este repositorio reúne actividades semanales y un proyecto transversal. Cada entrega explica qué se construyó, cómo ejecutarlo, qué casos se probaron, qué conceptos se aprendieron y qué decisiones pueden mejorarse.

## Proyecto transversal

Consulta el [proyecto transversal](project/README.md), su [arquitectura](project/docs/architecture/README.md) y las carpetas reservadas para código y pruebas.

## Seguimiento de entregas

Marca cada actividad a medida que la subas y etiquetes. El tag `class-NN-submission` se crea sobre el commit de la entrega original y no se mueve después.

| # | Clase | Tema | Estado | Tag |
| --- | --- | --- | --- | --- |
| 01 | [Clase 01](activities/class-01/README.md) | Servidor HTTP con Node.js | ✅ Entregada | `class-01-submission` |
| 02 | [Clase 02](activities/class-02/README.md) | API REST con Express | ✅ Entregada | `class-02-submission` |
| 03 | Clase 03 | Diseño de API predecible: recursos, contratos y estado | ⬜ Pendiente | — |
| 04 | Clase 04 | Asincronía, concurrencia conceptual y eventos | ⬜ Pendiente | — |
| 05 | Clase 05 | Persistencia, SQL y patrón Repository | ⬜ Pendiente | — |
| 06 | Clase 06 | Validación, errores y responsabilidades transversales | ⬜ Pendiente | — |
| 07 | Clase 07 | Capas, módulos, cohesión y acoplamiento | ⬜ Pendiente | — |
| 08 | Clase 08 | Autenticación y autorización | ⬜ Pendiente | — |
| 09 | Clase 09 | Pruebas, límites y diagnóstico | ⬜ Pendiente | — |
| 10 | Clase 10 | Monolito, microservicios, eventos y despliegue | ⬜ Pendiente | — |
| 11 | Clase 11 | Integración, decisiones y defensa técnica | ⬜ Pendiente | — |

Ritmo de entrega: commit progresivo → actualizar README → verificar que ejecuta desde cero → push → crear el tag de la semana.

## Rúbrica de evaluación

La nota de cada actividad semanal se compone así:

| Criterio | Peso | Evidencia esperada |
| --- | ---: | --- |
| Funcionamiento y cumplimiento | 35% | La actividad arranca y cumple sus endpoints o requisitos indicados. |
| Comprensión y explicación conceptual | 25% | README y comentarios explican decisiones, flujo HTTP y conceptos nuevos con palabras propias. |
| Pruebas, evidencia y diagnóstico | 20% | Comandos reproducibles, respuestas observadas, casos exitosos y fallas diagnosticadas. |
| Organización e historial del repositorio | 10% | Estructura consistente, nombres claros, cambios pequeños y commits descriptivos. |
| Puntualidad | 10% | Entrega antes del inicio de la clase siguiente; tardías máx. 70%, recuperación máx. 50%. |

### Autoevaluación por entrega

Antes de entregar, revisa el checklist incluido en cada README. Una entrega está lista cuando otra persona puede ejecutarla siguiendo solo sus instrucciones y comprobar los resultados con los comandos indicados.

## Requisitos generales

- Node.js 18 o superior.
- Terminal PowerShell, Bash o equivalente.
- `curl` para repetir las evidencias HTTP.

## Ejecución rápida

```powershell
cd activities/class-01
node src/server.js
```

En otra terminal:

```powershell
curl.exe -i http://localhost:3000/health
```

Para la segunda actividad:

```powershell
cd activities/class-02
npm install
node src/server.js
```

Detén cada servidor con `Ctrl + C`. No ejecutes las dos actividades al mismo tiempo porque ambas usan el puerto 3000.

También puedes arrancarlas desde la raíz con los scripts del `package.json`:

```powershell
npm run class-01
npm run class-02
```

