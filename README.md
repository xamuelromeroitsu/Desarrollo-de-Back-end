# Backend Course

Repositorio de aprendizaje de desarrollo backend con Node.js y Express.

**Estudiante:** Xamuel Romero

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)
2. flat-square (compacta, esquinas rectas):

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)
3. plastic (brillo degradado):

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=plastic&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=plastic&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=plastic&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=plastic&logo=sqlite&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=plastic&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=plastic&logo=github&logoColor=white)
4. for-the-badge (rectángulos grandes llamativos):

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
Pega los cuatro seguidos en badge-preview.md, ábrelo con Ctrl+Shift+V y elige el que más te guste.

## Propósito

Este repositorio reúne actividades semanales y un proyecto transversal. Cada entrega explica qué se construyó, cómo ejecutarlo, qué casos se probaron, qué conceptos se aprendieron y qué decisiones pueden mejorarse.

## Proyecto transversal

Consulta el [proyecto transversal](project/README.md), su [arquitectura](project/docs/architecture/README.md) y las carpetas reservadas para código y pruebas.

## Seguimiento de entregas

Marca cada casilla cuando la actividad esté subida con su tag (en GitHub puedes hacer clic directamente).

- [x] [Clase 01](activities/class-01/README.md) — Servidor HTTP con Node.js · `class-01-submission`
- [x] [Clase 02](activities/class-02/README.md) — API REST con Express · `class-02-submission`
- [ ] Clase 03 — Diseño de API predecible: recursos, contratos y estado
- [ ] Clase 04 — Asincronía, concurrencia conceptual y eventos
- [ ] Clase 05 — Persistencia, SQL y patrón Repository
- [ ] Clase 06 — Validación, errores y responsabilidades transversales
- [ ] Clase 07 — Capas, módulos, cohesión y acoplamiento
- [ ] Clase 08 — Autenticación y autorización
- [ ] Clase 09 — Pruebas, límites y diagnóstico
- [ ] Clase 10 — Monolito, microservicios, eventos y despliegue
- [ ] Clase 11 — Integración, decisiones y defensa técnica

**Progreso: 2 / 11**

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

