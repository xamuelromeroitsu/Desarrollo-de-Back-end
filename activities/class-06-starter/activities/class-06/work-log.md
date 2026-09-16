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
| 2 | 🔑 ¿Dónde se verifica el token? | `src/middleware/authenticate.js` (`verifyToken`) invoca la verificación real en `src/modules/auth/token.js` (`jwtVerify` con firma, alg, iss, aud, exp) | `token.js:44` |
| 3 | 🧑‍💻 ¿Dónde aparece el usuario autenticado? | `src/middleware/authenticate.js` → inyecta `req.auth = { userId, role }`; se consume en `src/modules/requests/requests.routes.js` (`req.auth`) | `authenticate.js:25` |
| 4 | 🛡️ ¿Dónde se decide si puede modificar? | `src/modules/requests/request.policy.js` (`canEditContent`, `canChangePriority`, `canChangeStatus`), aplicadas desde `src/modules/requests/requests.service.js` | `policy.js:32-43` · `service.js:167-175` |
| 5 | 🔄 ¿Dónde se valida el cambio de estado? | Reglas de dominio en `src/modules/requests/request-status.js` (`isTerminal`, `canTransition`), invocadas desde `requests.service.js` | `request-status.js:20,24` · `service.js:178-187` |
| 6 | 🗄️ ¿Dónde se ejecuta SQL? | `src/modules/requests/requests.store.js` (`findAll`, `findById`, `insertRequest`, `updateRequest`, `insertHistoryEvent`, `findHistory`) con pool en `src/database/pool.js` | `requests.store.js:19-115` |
| 7 | 📜 ¿Dónde se registra el historial? | `requests.store.js` → `insertHistoryEvent` (`INSERT INTO request_history`), llamado desde `requests.service.js` al crear y al cambiar estado/prioridad | `store.js:92` · `service.js:117,193,202` |
| 8 | 🧪 ¿Dónde se prueba este comportamiento? | `test/requests.test.js` y `test/auth.test.js` (la carpeta `test/` es la especificación ejecutable) | `test/requests.test.js` · `test/auth.test.js` |

### ✅ Correcciones que hicimos

1. **Fila 1:** no es "los imports indican por dónde entra". Los imports solo *declaran*
   (`app.js:3-6`); **entrar** ocurre en `server.js` (`app.listen`) y Express reparte en
   los `app.use` de `app.js:11-22`.
2. **Fila 2:** tu respuesta era válida pero incompleta: `authenticate.js`
   **invoca** la verificación; la **criptografía real** (firma, algoritmo, iss, aud, exp)
   vive en `token.js` → `jwtVerify`.
3. **Fila 3:** el usuario autenticado no "sale del auth service". Se **inyecta** como
   `req.auth` en `authenticate.js` y es lo que las rutas pasan al service.
4. **Fila 4:** no es `request-status.js`. Ahí están las *reglas de dominio* (estados).
   La *autorización* (puede o no modificar según rol) vive en `request.policy.js`.
5. **Fila 6:** el SQL no se ejecuta "en Supabase". Supabase es el **destino de la
   conexión** (`DATABASE_URL` en `pool.js`); los `SELECT/INSERT/UPDATE` se escriben
   en `requests.store.js`.
6. **Fila 7:** en la clase 06 la tabla es **`request_history`**, no la de status de la
   clase 05, y registra `type` (status_changed / priority_changed) con `from/to`.

---

## 🧵 Recorrido narrado · caso `POST /requests` (verificado)

1. 📥 **La petición entra** → `src/server.js` hace `app.listen` y Express recibe la
   petición en `app.js`.
2. 🧰 **Pasa los middlewares de montaje** → `corsPolicy` (`app.js:11`) → `express.json()`
   (`app.js:14`, arma `req.body`) → en `/requests` corre `authenticate` (`app.js:22`).
3. 🔑 **Se verifica el token** → `authenticate.js` lee `Authorization: Bearer <token>`
   y llama `verifyToken` → `token.js` valida firma, algoritmo, iss, aud y expiración.
4. 🧑‍💻 **El actor queda autenticado** → `req.auth = { userId, role }`. Si el token es
   inválido: `401` y `requests.routes.js` **nunca corre**.
5. 🛡️ **Se decide el permiso** → `routes.js` POST / → `createRequest(req.auth, req.body)`
   → service aplica `canCreateRequest` (policy) y rechaza campos controlados
   (`createdBy`/`status` → `400 SERVER_CONTROLLED_FIELD`).
6. ✅ **Se valida el cuerpo** → título no vacío (`TITLE_REQUIRED`) + prioridad válida.
7. 🗄️📜 **Se persiste y se registra el historial** → misma transacción
   (`database/transaction.js`): `insertRequest` (con `created_by` del token) +
   `insertHistoryEvent` (evento de nacimiento con `changed_by` del token).
8. 📤 **Se responde** → se mapea a camelCase (`request.mapper.js`) y `201` con la
   solicitud creada.

---

## 🧭 Guía · cómo mejorar la lectura de rutas (de proyecto chico a sistema complejo)

> Lo que hiciste arriba (seguir `app.js` → imports) es el **primer paso correcto**.
> Para escalar esa técnica a estructuras grandes, usa este método:

### 1️⃣ Entra por el contrato, no por la carpeta
- `package.json` (scripts) te dice **qué comando arranca qué**.
- `src/server.js` es el punto de entrada (abre el puerto).
- `src/app.js` es el **mapa de montaje**: léelo como tabla, nunca renglón por renglón.

| Montaje | Middleware | Router | ¿Qué protege? |
| --- | --- | --- | --- |
| `/auth` | (interno) | `auth.routes.js` | rutas públicas + `/me` |
| `/requests` | `authenticate` | `requests.routes.js` | todo el módulo |

### 2️⃣ Dentro de un módulo: lee en espiral, no en recta
Un verbo HTTP = una operación. Procesa en este orden:
`routes.js` (qué se expone) → `service.js` (el caso de uso y sus reglas) →
`store.js` (dónde vive la verdad). **No saltes capas**: si buscas SQL y no está en
el service, es señal de que estás en la capa equivocada — el SQL está en `store.js`.

### 3️⃣ Herramientas para ampliar la vista sin perderte
- `Ctrl+Click` en un `import` → salta al archivo real (segunda vez: saltar entre usos con `Ctrl+Shift+O`).
- `rg "createRequest" -n src` (o el buscador global) → **quién llama a quién**; eso te
  da el grafo de dependencias real, mejor que leer en orden alfabético.
- Los tests (`test/*.test.js`) son la **especificación ejecutable**: si no entiendes
  qué debería pasar, léelo en el test antes que en el código.

### 4️⃣ En sistemas enormes: lee por "cortes" (capas), no el árbol completo
Cada capa responde una pregunta distinta. Pregunta → capa → archivo:

| Pregunta | Capa | Archivo típico |
| --- | --- | --- |
| ¿Quién entra y quién pasa? | Transporte / middleware | `authenticate.js`, `cors.js` |
| ¿Qué le está permitido a este rol? | Autorización (política) | `request.policy.js` |
| ¿Cuál es el caso de uso y sus reglas? | Aplicación | `requests.service.js` |
| ¿Dónde y cómo se guarda la verdad? | Persistencia | `requests.store.js` + `database/pool.js` |

### 5️⃣ Trampas comunes de lectura (y su señal)
- **Buscar SQL en el service** → no está: separación de capas. Ve al store.
- **Confundir estado con permiso** → `request-status.js` (reglas de dominio) vs
  `request.policy.js` (autorización). Son preguntas diferentes.
- **Pensar que el token se verifica donde se consume** → se verifica en
  `authenticate.js`/`token.js`; se *consume* como `req.auth`.
- **Leer línea por línea sin mapa** → genera deuda de lectura. Primero el mapa
  (app.js + tabla de montaje), después los detalles.

---

## 🔎 Claves de lectura

- Una responsabilidad → un lugar. Si algo existe en dos archivos, es deuda: anótalo.
- El **archivo de pruebas** es la especificación ejecutable: si el código y la prueba
  no coinciden, uno de los dos está mal.

---

## 🤖 AI usage

- ¿Usé IA para completar esta tabla? → Sí, para la **corrección y verificación**.
- ¿Qué sugerencia acepté? → Que SQL/permisos/historial viven en `store`/`policy`/`store`,
  no "en Supabase" ni "en request-status".
- ¿Qué sugerencia rechacé o modifiqué? → todo
- ¿Cómo lo comprobé contra el código? → Leyendo `app.js`, `requests.service.js`,
  `request.policy.js`, `requests.store.js`, `token.js` y `test/*.test.js` de la clase 06.

---

# Template original de la clase 06

## Request flow

Where does the request enter?
Where is authentication checked?
Where is authorization checked?
Where is PostgreSQL accessed?

## Bug fixed

What was happening?
What should happen?
Which file did I modify?
Which test protects the behavior?

## Feature implemented

What does GET /requests/:id/history do?
Who can use it?
How is the result ordered?

## Test explained

Choose one test.
What data does it prepare?
What action does it perform?
What does it check?
Which rule does it protect?

## AI assistance

What did AI help me understand?
What code did it help produce?
What did I verify myself?
What suggestion was incorrect or incomplete?

## Remaining doubt

What part do I still not understand?