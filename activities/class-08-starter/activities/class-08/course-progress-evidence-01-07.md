# course-progress-evidence-01-07

Paquete de evidencia para el diagnóstico acumulativo 7 en 1.
Generado automáticamente — completa las secciones marcadas con [COMPLETAR] antes de ejecutar el prompt.

## Metadata

* studentId: Xamuelromero.itsu@gmail.com
* promptVersion: ITSU-CHECKPOINT-01-07-1.0
* rubricVersion: BACKEND-01-07-R1
* generatedAt: 2026-09-29T14:36:31.747Z (EXECUTED_NOW)
* repoRoot: Desarrollo-de-Back-end
* commit: 0e10f15 (EXECUTED_NOW)
* repositorioRemoto: https://github.com/xamuelromeroitsu/Desarrollo-de-Back-end.git (EXECUTED_NOW) — verifica que sea TU repositorio antes de continuar
* modeloUtilizado: [COMPLETAR después de ejecutar el prompt]

### Contexto de git (informativo, EXECUTED_NOW)

El curso se trabaja en computadoras compartidas: el historial local puede
estar incompleto o pertenecer a otra sesión sin que falte trabajo real.
Este contexto NO es evidencia requerida — la evidencia son los archivos
del repositorio remoto del estudiante y sus respuestas. La ausencia de
commits aquí no debe interpretarse como evidencia faltante.

```text
0e10f15 Merge branch 'master' of https://github.com/xamuelromeroitsu/Desarrollo-de-Back-end
6cf0f81 class 8 proyecto del repo test de estudiante
6087236 pruebas con bruno
6df7319 fix INC-701: validar ID inválido antes de consultar SQL
8500a01 docs INC-701: validar y ver los sintomas como las hipotesis ID inválido antes de consultar SQL
52ad493 analisis: comentarios explicando rutas de requests y causa de INC-701
fd8b20f evidencia: screenshot INC-701 reproducido manualmente del primer bug
47493a7 Merge branch 'master' of https://github.com/xamuelromeroitsu/Desarrollo-de-Back-end
```

## Evidencia por clase

Los archivos listados existen en el repositorio (FOUND). Un archivo de salida guardado, como validation-evidence.txt, es TEXTO: demuestra que se guardó, no que se ejecutó (NOT_VERIFIED como ejecución).

### Clase 01 — Fundamentos de backend

* FOUND: activities/class-01/README.md
* FOUND: activities/class-01/clasificacion.md
* FOUND: activities/class-01/src/server.js

Extracto de activities/class-01/README.md (redactado automáticamente):

```text
# Clase 01: servidor HTTP con Node.js

## Objetivo

Construir un servidor HTTP sin Express para entender cómo Node.js recibe una petición, identifica la ruta y construye una respuesta.

## Ejecución

Requisito: Node.js 18 o superior.

```powershell
cd activities/class-01
node src/server.js
```

El servidor queda disponible en `http://localhost:3000`. Deténlo con `Ctrl + C`.

## Solución desarrollada

El servidor implementa estas rutas:

| Método | Ruta | Resultado esperado |
| --- | --- | --- |
| GET | `/` | Mensaje de bienvenida, estado 200 |
| GET | `/health` | JSON con `status: "ok"` y tiempo activo |
| GET | `/api/info` | JSON con nombre, versión y autor |
| GET | Cualquier otra | JSON de error, estado 404 |

## Evidencia reproducible

[... 45 líneas más]
```

### Clase 02 — HTTP y contratos

* FOUND: activities/class-02/README.md
* FOUND: activities/class-02/package-lock.json
* FOUND: activities/class-02/package.json
* FOUND: activities/class-02/src/server.js
* FOUND: activities/class-05/request-api-v5-starter/docs/http-contract.md

Extracto de activities/class-05/request-api-v5-starter/docs/http-contract.md (redactado automáticamente):

```text
# Contrato HTTP — Request API v5 (solución de referencia)

## Qué cambió respecto de la v4

* Tres endpoints nuevos: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
* **Todos los endpoints de `/requests` ahora exigen `Authorization: Bearer <token>`.**
* La conversación de los endpoints existentes conserva su forma, pero cada respuesta
  depende ahora de QUIÉN pregunta (rol y propiedad). Aparece `createdBy` en la
  representación y `changedBy` en el historial.
* Códigos nuevos: `401`, `403` y los códigos de contrato de auth.
* Forma de error invariable: `{ "error": { "code", "message" } }`.

## Actores

Dos roles exactos: `requester` (crea y sigue sus solicitudes) y `agent` (las atiende).
El registro SIEMPRE crea `requester`; la promoción a `agent` es una operación docente
controlada (SQL), nunca un endpoint.

## Matriz de acceso (baseline fija del taller)

| Operación | Anónimo | Requester | Agent |
| --------- | ------: | --------: | ----: |
| `POST /auth/register` | Sí | Sí | Sí |
| `POST /auth/login` | Sí | Sí | Sí |
| `GET /auth/me` | No | Sí | Sí |
| `GET /requests` | No | Propias | Todas |
| `GET /requests/:id` | No | Propia | Todas |
| `GET /requests/:id/history` | No | Propia | Todas |
| `POST /requests` | No | Sí | No |
| Editar título/descripción | No | Propia y abierta | No |
[... 92 líneas más]
```

Extracto de activities/class-02/README.md (redactado automáticamente):

```text
# Clase 02: Request API Lite

Una API pequeña construida con Express que administra **solicitudes de mantenimiento**.
Todo vive en un solo archivo (`src/server.js`) y los datos se guardan en memoria: cada vez que
reinicias el servidor, la lista vuelve a su estado inicial.

## Objetivo

Practicar una API REST mínima, el middleware JSON, los parámetros de ruta y la creación de
recursos en memoria.

Cada solicitud tiene esta forma:

```json
{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "open",
  "priority": "high"
}
```

## Requisitos

* Node.js 18 o superior (`node --version`).
* Conexión a internet la primera vez, para instalar Express.

## Instalación

[... 100 líneas más]
```

### Clase 03 — Recursos, estado y reglas

* NOT_FOUND: ningún artefacto esperado de esta clase

### Clase 04 — PostgreSQL y persistencia

* FOUND: activities/class-04/docs/Sql_tools.md
* FOUND: activities/class-04/docs/assents/Creando_bd.png
* FOUND: activities/class-04/docs/assents/env.png
* FOUND: activities/class-04/docs/assents/parametros_de_sql_tools.png
* FOUND: activities/class-04/docs/assents/pgtools_herramientas.png
* FOUND: activities/class-04/docs/env.md
* FOUND: activities/class-04/docs/estructura.md
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/001_create_requests.sql
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/002_create_request_status_history.sql
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/003_create_users.sql
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/004_add_request_ownership.sql
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/005_add_history_actor.sql
* … 24 archivo(s) más con el mismo patrón

Extracto de activities/class-04/docs/Sql_tools.md (redactado automáticamente):

```text
# Guía: Conectar Supabase a SQLTools (VS Code)

Esta guía documenta el proceso y la explicación de los campos para agregar una conexión de **Supabase** en **SQLTools** dentro de Visual Studio Code.

---

## 1. Proceso de Conexión

1. Abre Visual Studio Code.
2. Ve a la extensión **SQLTools** en la barra lateral izquierda e instala.

![](./assents/pgtools_herramientas.png)

3. Haz clic en **Add New Connection** y selecciona el driver de **PostgreSQL**.
4. Completa los campos del asistente con la información de tu proyecto de Supabase.
5. Introduce la contraseña cuando la alerta flotante de *SQLTools Driver Credentials* la solicite.
6. Haz clic en **Test Connection** y, tras confirmar el éxito, selecciona **Save Connection**.

---

## 2. Explicación de los Campos Requeridos

### **Credenciales Principales (`Connection Settings`)**

- **Connection name\***: Un nombre identificador para la conexión (ej. `Supabase - Proyecto`).
- **Connection group**: *(Opcional)* Para agrupar diferentes conexiones en la interfaz.
- **Connect using\***: Mantener en `Server and Port`.
- **Server Address\***: El Host de tu base de datos de Supabase (ej. `db.xxxxxx.supabase.co` o el host del pooler `aws-0-xxxx.pooler.supabase.com`). Reemplaza `localhost`.
- **Port\***: `5432` para conexión directa o `6543` si utilizas el Connection Pooler.
- **Database\***: `postgres` (nombre por defecto de la base de datos en Supabase).
[... 8 líneas más]
```

### Clase 05 — Autenticación y autorización

* FOUND: activities/class-05/request-api-v5-starter/.gitignore
* FOUND: activities/class-05/request-api-v5-starter/README.md
* FOUND: activities/class-05/request-api-v5-starter/activities/ai-asage-1.png
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/README.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/access-matrix.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/ai-usage.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/auth-contract.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/decision-log.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/reflection.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/threat-cases.md
* FOUND: activities/class-05/request-api-v5-starter/activities/class-05/validation-evidence.md — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/class-05/request-api-v5-starter/database/migrations/001_create_requests.sql
* … 33 archivo(s) más con el mismo patrón

Extracto de activities/class-05/request-api-v5-starter/activities/class-05/auth-contract.md (redactado automáticamente):

```text
# Contrato de autenticación — Request API v5

Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
(código HTTP + `error.code`).

## Resumen de acceso

| Método y ruta | Acceso | Necesita token |
| ------------- | ------ | :------------: |
| `POST /auth/register` | Público (Anónimo) | No |
| `POST /auth/login` | Público (Anónimo) | No |
| `GET /auth/me` | Protegido | Sí (`Bearer`) |
| `GET /requests` | Protegido | Sí (`Bearer`) |
| `GET /requests/:id` | Protegido | Sí (`Bearer`) |
| `GET /requests/:id/history` | Protegido | Sí (`Bearer`) |
| `POST /requests` | Protegido | Sí (`Bearer`) |
| `PATCH /requests/:id` | Protegido | Sí (`Bearer`) |

La autorización sobre `/requests` se decide DESPUÉS de la autenticación, según
rol y propiedad (ver `docs/http-contract.md` y la matriz de acceso). Aquí solo
se documentan los endpoints de auth.

## Controles del servidor

Campos que el cliente JAMÁS debe enviar: su valor lo decide el backend, nunca
el body. Enviarlos produce `400 SERVER_CONTROLLED_FIELD` — rechazo explícito,
no se ignoran en silencio.

| Campo | Fuente de verdad | Si el cliente lo envía |
[... 99 líneas más]
```

Extracto de activities/class-05/request-api-v5-starter/activities/class-05/validation-evidence.md (redactado automáticamente):

```text
# Evidencia de validación — Clase 05

Pega aquí la salida del validador al cerrar cada estación (SIN secretos: el
validador ya evita imprimirlos, no agregues capturas de tu `.env`).

## stage setup

## stage access-design

```text
CLASS 05 VALIDATION — stage: access-design

[01/03] access-matrix.md completed ....... PASS
[02/03] auth-contract.md completed ....... PASS
[03/03] threat-cases.md completed ........ PASS

RESULT: 3/3

Checkpoint class-05-access-design reached.
Your access design is on record — AI assistance is now allowed.
```

## stage register
CLASS 05 VALIDATION — stage: register

[01/02] Public registration .............. PASS
[02/02] Role escalation protection ....... PASS

RESULT: 2/2
## stage password
[... 37 líneas más]
```

### Clase 06 — Onboarding y pruebas

* FOUND: activities/class-06-starter/.gitignore
* FOUND: activities/class-06-starter/NOTES-class-06-history.md
* FOUND: activities/class-06-starter/README.md
* FOUND: activities/class-06-starter/activities/class-06/README.md
* FOUND: activities/class-06-starter/activities/class-06/validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/class-06-starter/activities/class-06/work-log.md
* FOUND: activities/class-06-starter/database/migrations/001_create_users.sql
* FOUND: activities/class-06-starter/database/migrations/002_create_requests.sql
* FOUND: activities/class-06-starter/database/migrations/003_create_request_history.sql
* FOUND: activities/class-06-starter/database/migrations/004_add_constraints_and_indexes.sql
* FOUND: activities/class-06-starter/package-lock.json
* FOUND: activities/class-06-starter/package.json
* … 63 archivo(s) más con el mismo patrón

Extracto de activities/class-06-starter/activities/class-06/work-log.md (redactado automáticamente):

```text
# Class 06 work log

## Environment

What did I configure?
Which command confirmed that it worked?

> 📌 Ejercicio de lectura: **siguiendo la ruta de `src/app.js` y los imports** se
> verifica por dónde pasa una petición. Abajo está el mapa ya corregido y verificado
> contra el código real de la clase 06 (no supuesto).

<a href="https://html-css-js-course-wheat.vercel.app/lab-viewer.html?lab=materias%2Fdesarrollo-backend%2Fclases%2Fclass-06%2Fsesiones%2F07-explorar-proyecto%2Fresources%2Flabs%2Fmapa-recorrido%2Flab.json&back=https%3A%2F%2Fhtml-css-js-course-wheat.vercel.app%2Fviewer.html%3Fsection%3Dmaterias%252Fdesarrollo-backend%252Fclases%252Fclass-06%252Fsesiones%252F07-explorar-proyecto%26start%3D2" target="_blank">
  <button style="background-color: #0070f3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
    🚀 Abrir Lab - Clase 06
  </button>
</a>

---

# 📋 Work-log · Recorrido de una petición

> **Consigna:** completa cada fila indicando el archivo (y la función, si aplica)
> donde ocurre cada responsabilidad. Rastrea una petición desde que entra hasta
> que se prueba — sin suponer: ve al código y cita la línea.

## 🗺️ Mapa de responsabilidades (corregido y verificado contra `class-06-starter/src`)

| # | Pregunta | 📂 Archivo · función | 📍 Línea |
| --- | --- | --- | --- |
| 1 | 🚪 ¿Dónde entra la petición? | `src/server.js` (`app.listen`) → `src/app.js` (montaje de middlewares y routers) | `app.js:11-22` |
[... 238 líneas más]
```

Extracto de activities/class-06-starter/activities/class-06/validation-evidence.txt (redactado automáticamente):

```text
Pega aqui la salida final de: npm run validate:class-06
(la salida no contiene secretos; no agregues capturas de tu .env)

PS C:\Users\user\Desktop\Desarrollo-de-Back-end\activities\class-06-starter> npm run validate:class-06

> class-06-request-api@6.0.0 validate:class-06
> node scripts/validate-class-06.js

CLASS 06 FINAL VALIDATION

Environment
[01/12] Database is reachable .............. PASS
[02/12] Migrations are complete ............ PASS
[03/12] Seed data is available ............. PASS

Regression
[04/12] Valid empty collection returns 200 .. FAIL

Expected:
A valid filter with zero matches answers 200.

Received:
GET /requests?status=closed answered 404.

Review:
- the difference between a missing resource and an empty collection
- where the collection route decides what to do with an empty array
- the class 3 contract for collections

[05/12] Empty collection returns [] ........ FAIL
[... 92 líneas más]
```

### Clase 07 — Diagnóstico y errores

* FOUND: activities/class-07-starter/.gitignore
* FOUND: activities/class-07-starter/README.md
* FOUND: activities/class-07-starter/activities/amsdm.md
* FOUND: activities/class-07-starter/activities/class-07/701-error-request-not-a-number.png
* FOUND: activities/class-07-starter/activities/class-07/README.md
* FOUND: activities/class-07-starter/activities/class-07/incident-report.md
* FOUND: activities/class-07-starter/activities/class-07/validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/class-07-starter/database/migrations/001_create_users.sql
* FOUND: activities/class-07-starter/database/migrations/002_create_requests.sql
* FOUND: activities/class-07-starter/database/migrations/003_create_request_history.sql
* FOUND: activities/class-07-starter/database/migrations/004_add_constraints_and_indexes.sql
* FOUND: activities/class-07-starter/incidents/INC-701-invalid-request-id.md
* … 54 archivo(s) más con el mismo patrón

Extracto de activities/class-07-starter/activities/class-07/incident-report.md (redactado automáticamente):

```text
# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

Which command confirmed the starting state?
npm run class-07:doctor  # 7/7 PASS
npm test                 # 20 pass, 17 todo

## Incident 701

### Report
Soporte reporta que algunas solicitudes devuelven 500 cuando se consultan con identificadores que no son números.

### Reproduction
- Method: GET
- Path: /requests/not-a-number
- User: Ana (requester)
- Headers: Authorization: Bearer <token válido>

### Expected result
400 Bad Request
```json
{
  "error": {
    "code": "INVALID_REQUEST_ID",
    "message": "Request id must be a positive integer."
  }
[... 96 líneas más]
```

Extracto de activities/class-07-starter/activities/class-07/validation-evidence.txt (redactado automáticamente):

```text
Pega aquí la salida REAL y COMPLETA de:

    npm run validate:class-07

Debe incluir las 12 verificaciones con sus secciones (Baseline, Input and
errors, Traceability, Operation), la línea de Cleanup y el FINAL RESULT.

Antes de guardar, revisa que no haya ninguna credencial pegada por error:
ni DATABASE_URL, ni JWT_SECRET, ni tokens. Si aparece algo así,
reemplázalo por [configured].



agregando los comandos y resultados de las migraciones


n class-07:doctor

> class-07-request-api@7.0.0 class-07:doctor
> node scripts/check-environment.js

CLASS 07 ENVIRONMENT CHECK

[01/07] Environment configured ............... PASS
[02/07] Database connection established ...... PASS
[03/07] Migrations available ................. PASS
[04/07] Seed data available .................. PASS
[05/07] Application can be imported .......... PASS
[06/07] Test runner available ................ PASS
[07/07] Incident fixtures available .......... PASS
[... 85 líneas más]
```

## Estado previo a la clase 8

* Validadores disponibles (clases 1-7): activities/class-05/request-api-v5-starter/scripts/validate-class-05.js, activities/class-06-starter/scripts/validate-class-06.js, activities/class-07-starter/scripts/validate-class-06.js, activities/class-07-starter/scripts/validate-class-07.js, activities/class-08-starter/scripts/validate-class-06.js, activities/class-08-starter/scripts/validate-class-07.js
* Carpetas de pruebas: activities/class-06-starter/test, activities/class-07-starter/test, activities/class-08-starter/test
* Último commit antes del taller: 0e10f15

## Cuestionario diagnóstico (responde aquí, 3-6 líneas cada una)

Sé específico: cita archivos o rutas concretas de TU proyecto cuando puedas. La extensión no suma.

### Pregunta clase 01

Describe qué ocurre desde que una petición llega al backend hasta que sale una respuesta y explica por qué el servidor debe permanecer activo.

Respuesta: lo que ocurre en el ciclo del software, cuando la peticion el msj se envia desde el cliente a cuando llega al backend, el servidor es el siguiente en base a la class-01.

llega la peticion http un metodo de red, que se usa en estos ciclos y get post delete... entontoces se envia con el formato de MENSAJERIA json o otra  entidad o body, cuando la peticion llega al backend el la procesa y la transforma para poder recopilar la informacion dentro de la peticion.

el servidor debe permanecer activo escuchando para poder resivir la informacion y guardar los datos 

### Pregunta clase 02

Elige un endpoint del proyecto y explica cómo método, ruta, body y status forman su contrato.

Respuesta: el endpoint de post, de los metodos http este es uno de los principales para poder crear una solicitud en el body van los formaatos o las reglas dependiendo de la entidad en el cazo de las practicas se uso el formato Json, en el status hay van "en donde y como esta" en estatus del endpont trabajos con abierto, en progreso, culminado? , cerrado
open in progress close falta uno no lo recuerdo pero son 5 solo en dos estados no se puede cambiar pero en los otros si los podemos repetir o mover 

### Pregunta clase 03

Explica, usando una solicitud del proyecto, la diferencia entre representación, dato inválido y transición incompatible con el estado actual.

Respuesta: la representacion es lo que habia mencionado antes como entidad, la representacion es como el formato que se envia la peticion en formato Json, html JSONB, listas de sql hay otros formatos que se usan pero el que andamos trabajando es Json, dato invalido es que dentro de la representacion estes pidiento un tipo de dato int y pongas letras o que no cumpla con los parametros, entiendo por transicion incompatible que los datos no son compatibles con lo que se esta pidiendo 

### Pregunta clase 04

Explica la diferencia entre migración, seed y transacción, e indica dónde aparece cada concepto en el proyecto.

Respuesta: las migraciones son las tablas de la base de datos que son cambiadas o ajustadas con el paso del tiempo y se van gardando los ajustes o cambios que se hagan en las columnas tablas...
mientras que el seed son semillas de datos mokeados o para usarlos en pruebas, ahi puede entrar como ejemplo correos status datos dependiendo de lo que se lleve en las migraciones tablas 
estas dos cosas se trabajaron por la clase 6 en adelante donde usamos supabase y el motor de postgres sql

### Pregunta clase 05

Explica la diferencia entre autenticación y autorización y por qué un JWT decodificado todavía debe verificarse.

Respuesta: la autenticacion es cuando el usuario se registra y obtiene una llave, el ejemplo que se uso es el de una persona va a un parque y le dan una tarjeta o un id de auth para poder pasar y autorizacion es cuando pasa a a zonas restringidas dependiendo de ese id que se le de el tiene disponivilidad de entrar a zonas privadas, asi mismo en el codigo registro y autorizacion 

jwt debe verificarse por que puede estar clonado por una haker o un script malisioso, por eso aparte de encriptar la contrasena en un b-697 o algo asi que es como se cambia la clave formato texto a un codigo cifrado y se le pone el tiempo para verificacion para que solo la persona que se registre tenga la oportunidad de usar esa clave y no los demas en cazo de que se filtre.

### Pregunta clase 06

Elige una prueba del proyecto, identifica preparación, acción y comprobación, y explica qué regresión protege.

Respuesta: elegi request history que son las historias de las peticiones de los usuarios en class 7 test/requests-history.test.js

en este archivo esta los imports luego los async como se conecta con la base de datos await pool y la creacion de datos.

entramos a la parte de Prepacion del test los request el 
que se usara y como respondera seria la accion que esta en la constante eje const response 
las comprobaciones serian como el resultado de lo respondido si va acorde.
### Pregunta clase 07

Describe un fallo investigado distinguiendo síntoma, hipótesis y causa; luego indica qué señal correspondería a health o readiness.

Respuesta: [COMPLETAR]

---
Nota de seguridad: este paquete fue generado excluyendo .env y redactando
posibles secretos. Revisa una vez más antes de pegarlo en un modelo:
si ves una credencial real, reemplázala por [REDACTED] y avisa al docente.
