# AI usage

Este archivo solo puede tener contenido DESPUÉS del checkpoint
`class-05-access-design` (matriz + contrato + amenazas completos).

## My design before AI

**Decisiones tomadas ANTES de la IA (estación 1 — diseño de acceso):**

* Matriz RBAC + ownership con los roles `requester` y `agent`. `admin` solo
  como columna ilustrativa: no existe en la API.
* Recursos ajenos → `404 REQUEST_NOT_FOUND`, byte-idéntico a "no existe":
  la existencia no debe revelarse (anti-enumeración).
* PATCH con autorización todo-o-nada: body mixto → `403 FORBIDDEN`, sin
  cambios parciales.
* Campos controlados por el servidor (`role`, `createdBy`, `changedBy`,
  `status`, ids, fechas) → `400 SERVER_CONTROLLED_FIELD`, rechazo explícito.
* La única identidad confiable es el JWT verificado (`req.auth`);
  no se confía en el frontend, en ocultar IDs/rutas, ni en el body.

## What I asked

1. Definir qué rutas son públicas (anónimas) y cuáles protegidas (token).
2. Fijar el criterio de autorización detrás de `401`, `403` y `404`.
3. Completar `auth-contract.md` y `threat-cases.md`.
4. Auditar `access-matrix.md` contra el contrato fijo del taller.

## What the AI proposed

1. Para `auth-contract.md`: resumen público/protegido, los 3 endpoints de
   auth, tabla "Controles del servidor" y semántica de errores 401/403/404/409.
2. Para `threat-cases.md`: 15 casos adversariales con resultado exacto
   (código HTTP + `error.code`).
3. Para `access-matrix.md`: `citizen`→`requester`, `PUT`→`PATCH`,
   `req.user.id`→`req.auth.userId`, validación estricta
   (`400 SERVER_CONTROLLED_FIELD`) en lugar de sanitización silenciosa,
   `admin` como columna ilustrativa, register/login=`Sí` para todos los roles.
4. Git: mover el tag `class-05-access-design` al commit validado.

## What I accepted

Toda la propuesta anterior, tras contrastarla con `docs/http-contract.md` y la
especificación ejecutable (`scripts/validate-class-05.js`). El resultado de la
revisión está en el bloque "Estación 1" más abajo.

## What I rejected

Nada hasta la fecha. [Registrar aquí todo rechazo futuro con su justificación.]

## Security mistakes I detected

* La "sanitización silenciosa" habría permitido escalación de rol: inyectar
  `role` y que el servidor lo ignorara en silencio → se impone rechazo explícito.
* Columna `admin` que contradecía "sin admin" sin aclarar su naturaleza.
* Rol `'citizen'` inexistente y `PUT /requests/:id`; la mutación es `PATCH`.
* `req.user.id` como origen de identidad: el middleware construye `req.auth`.
* Guillemets `«»` rompían el chequeo estático del validador (placeholders).

## How I verified the implementation

```bash
npm run validate:class-05 -- --stage access-design
# RESULT: 3/3 · Checkpoint class-05-access-design alcanzado
```

Git: tag `class-05-access-design` movido al commit `d34c990` (validado) y
subido con `git push origin class-05-access-design --force`; rama `master`
sincronizada con `origin`.

## What I still do not understand

[Escribe tus dudas reales al cierre de la estación.
Ej.: ¿cuándo convendría preferir `403` sobre `404` en otro dominio?]





# Registro de Uso y Auditoría de IA — Estación 0

**Fase:** Estación 0 — Preparar el campo  

---

## 1. Interacción e Indicaciones a la IA

* **Problema de red (WSL2 / IPv6):** Se consultó a la IA sobre el error `ENETUNREACH` al intentar conectar Node.js con Supabase desde WSL2.
* **Seguridad y Entorno:** Se solicitaron comandos para la generación de claves criptográficas y buenas prácticas en el manejo del archivo `.env`.
* **Verificación de la Base de Datos:** Se consultaron comandos y sentencias SQL para auditar el estado del *seed* y las migraciones.

---

## 2. Auditoría Humana y Validación de Propuestas de la IA

| Sugerencia de la IA | Auditoría y Verificación Humana | Estado / Resultado |
| :--- | :--- | :--- |
| **Cambio a Supabase Connection Pooler** para evitar bloqueos IPv6 en WSL2. | Se modificó la variable `DATABASE_URL` y se auditó la conectividad ejecutando `npm run db:check` en la terminal de WSL2. | **Aprobado**: Handshake exitoso con PostgreSQL. |
| **Generación de `JWT_SECRET`** mediante `openssl rand -hex 32`. | Se auditó que la clave generada fuera aleatoria y no un *placeholder*. Se revisó `.gitignore` para asegurar que `.env` no se subiera al repositorio y que `.env.example` contuviera solo variables vacías. | **Aprobado**: Cero secretos expuestos en Git. |
| **Ejecución de migraciones DDL (`003`, `004`, `005`) y `seed.sql`**. | Se ejecutó el script SQL en Supabase y se auditó la integridad realizando un `JOIN` entre `requests` y `request_status_history` desde el SQL Editor, además de probar la lectura con `curl -i http://localhost:3000/requests`. | **Aprobado**: Respondió `200 OK` con los 3 registros del *seed*. |

---

## 3. Decisiones Técnicas Tomadas

* **Verificación de independencia de código:** No se aceptaron configuraciones con credenciales estáticas propuestas por la IA; se forzó el uso estricto de variables de entorno.
* **Confirmación por script oficial:** La validación final no se dejó a criterio de la IA, sino que se auditó ejecutando el comando oficial del proyecto:
  ```bash
  npm run validate:class-05 -- --stage setup

---

# Registro de Uso y Auditoría de IA — Estación 1 (Diseño de acceso)

**Fase:** Estación 1 — Antes del código: matriz, contrato de auth y amenazas
**Checkpoint:** `class-05-access-design` — **alcanzado (3/3 PASS)**
**Fecha:** 2026-09-08

---

## 1. Interacción e Indicaciones a la IA

* **Endpoints y errores:** determinar qué rutas son públicas/protegidas y el
  criterio de autorización detrás de `401`, `403`, `404` (frontera con `409`).
* **Contrato de autenticación:** estructurar y completar `auth-contract.md`.
* **Casos adversariales:** redactar ≥8 ataques en `threat-cases.md` con el
  resultado exacto esperado (código HTTP + `error.code`).
* **Auditoría de matriz:** revisar `access-matrix.md` contra el contrato fijo.

---

## 2. Auditoría Humana y Validación de Propuestas de la IA

| Sugerencia de la IA | Auditoría y Verificación Humana | Estado / Resultado |
| :--- | :--- | :--- |
| Tabla "Controles del servidor" en `auth-contract.md`. | Se contrastó con el allowlist del contrato fijo (`http-contract.md`) y con el validador. | **Aprobado**: criterio y `error.code` coherentes. |
| 15 casos adversariales en `threat-cases.md`. | Se comprobó que cada caso declara código HTTP + `error.code` y que cubre los 5 ataques mínimos del validador (escalación de rol, `createdBy` falsificado, ID ajeno, token manipulado, PATCH mixto). | **Aprobado**: 3042 caracteres, sin TODOs. |
| Correcciones de `access-matrix.md` (`citizen`→`requester`, `PUT`→`PATCH`, `req.user.id`→`req.auth.userId`, validación estricta). | Cada corrección se contrastó con el código del starter (`auth.service.js`, `request.policy.js`, `authenticate.js`). | **Aprobado**: alineado con la implementación. |
| Mover el tag `class-05-access-design` al commit validado. | `git log` y `git ls-remote` confirmaron `aff63a6 → d34c990` en el remoto. | **Aprobado**: entregable versionado correctamente. |

**Evidencia de validación oficial:**

```text
CLASS 05 VALIDATION — stage: access-design
[01/03] access-matrix.md completed ....... PASS
[02/03] auth-contract.md completed ....... PASS
[03/03] threat-cases.md completed ........ PASS
RESULT: 3/3
```

---

## 3. Entregables de la estación

| Archivo | Documenta… |
| :--- | :--- |
| `activities/class-05/access-matrix.md` | Quién puede hacer qué (RBAC + ownership); `admin` como columna ilustrativa. |
| `activities/class-05/auth-contract.md` | Contrato de `register` / `login` / `me`, controles del servidor y semántica de errores. |
| `activities/class-05/threat-cases.md` | Los 15 abusos que la API debe resistir. |

---

## 4. Decisiones Técnicas Tomadas

* **Convergencia al contrato fijo:** la implementación utilizará únicamente
  `requester` y `agent`; la columna `Admin` queda como ejemplo docente.
* **Rechazo explícito, no silencioso:** todo campo controlado responde
  `400 SERVER_CONTROLLED_FIELD` (evita escalación de rol).
* **Versionado del checkpoint:** el tag apunta al commit donde el validador
  pasa 3/3, no a un commit arbitrario.

---

## 5. 🗺️ Plan Maestro de Implementación — Request API v5

### 🔨 Estación 2 & 3: Registro y Contraseñas Seguras
* **Objetivo:** Implementar la función `register` en `auth.service.js` y conectar el almacenamiento con `users.store.js`.
* **Pasos:**
  1. **Allowlist:** Validar que el `req.body` contenga únicamente `email` y `password`. Si viene cualquier otro campo (ej. `role`, `id`, `createdAt`), lanzar `AppError('contract', 'SERVER_CONTROLLED_FIELD', '...')`.
  2. **Normalización del Email:** Aplicar `email.trim().toLowerCase()`. Si está vacío o tiene formato inválido, lanzar `AppError('contract', 'INVALID_EMAIL', '...')`.
  3. **Validación del Password:** Comprobar que la longitud del password esté entre `PASSWORD_MIN_LENGTH` (15) y `PASSWORD_MAX_LENGTH` (128). Si no, lanzar `AppError('contract', 'INVALID_PASSWORD', '...')`.
  4. **Hashing (Estación 3):** Llamar a `await hashPassword(password)` para cifrar la contraseña con *scrypt*.
  5. **Persistencia y Duplicados:** Llamar a `insertUser({ email, passwordHash })`. Si PostgreSQL retorna el error `23505` (violación de unique constraint), atraparlo y lanzar `AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED', 'The account cannot be created with the supplied information.')`.
  6. **Respuesta:** Retornar el objeto de éxito (`201 Created`) con los datos públicos del usuario.
* **Verificación:** `npm run validate:class-05 -- --stage register` y `npm run validate:class-05 -- --stage password`

### 🔑 Estación 4: Tokens JWT (`issueToken`, `verifyToken`) y Login
* **Objetivo:** Programar la emisión y verificación criptográfica de tokens y el endpoint de autenticación.
* **Pasos:**
  1. **`token.js` - `issueToken(user)`:** Usar `SignJWT` con la librería `jose` para firmar el token con `HS256` y `SECRET_KEY`, incluyendo los claims: `sub` (`user.id`), `role` (`user.role`), `iss`, `aud`, `iat` y `exp` (3600 segundos / 1 hora).
  2. **`token.js` - `verifyToken(token)`:** Usar `jwtVerify(token, SECRET_KEY, { algorithms: ['HS256'], issuer, audience })` para validar la firma, vigencia y claims.
  3. **`auth.service.js` - `login(body)`:** 
     * Buscar al usuario en la base de datos por su email normalizado.
     * Si no existe, o si `await verifyPassword(password, user.passwordHash)` retorna `false`, lanzar un error unificado y genérico: `AppError('auth', 'INVALID_CREDENTIALS', 'Email or password is incorrect.')` (anti-enumeración).
     * Si es correcto, generar el token con `issueToken(user)` y retornar `200 OK` con `{ accessToken, tokenType: 'Bearer', expiresIn: 3600 }`.
* **Verificación:** `npm run validate:class-05 -- --stage login`

### 🛡️ Estación 5: El Guardián de Rutas (`authenticate` middleware)
* **Objetivo:** Programar `src/middleware/authenticate.js` para proteger los endpoints privados.
* **Pasos:**
  1. Leer el header `Authorization` de la petición.
  2. Verificar que exista y comience con el esquema exacto `Bearer <token>`. Si falta o usa `Basic`, lanzar `AppError('auth', 'AUTHENTICATION_REQUIRED', '...')`.
  3. Extraer el token y ejecutar `await verifyToken(token)`. Si hay cualquier fallo criptográfico o de expiración, atraparlo y lanzar `AppError('auth', 'INVALID_TOKEN', '...')`.
  4. Asignar la identidad verificada al objeto de la petición: `req.auth = { userId: payload.sub, role: payload.role }`.
  5. Llamar a `next()`.
* **Verificación:** `npm run validate:class-05 -- --stage authentication`

### 👥 Estaciones 6 & 7: Políticas de Propiedad y Roles (`ownership` & `authorization`)
* **Objetivo:** Asegurar el aislamiento de datos por usuario (`requester`), la gestión global por parte de los operadores (`agent`), y la validación atómica en mutaciones.
* **Pasos:**
  1. **Scoping en consultas (`requests.store.js`):** Ajustar las consultas `SELECT` para que, si el actor es `requester`, filtre estrictamente por `created_by = userId`. Si es `agent`, permita ver toda la colección (incluyendo registros heredados con `created_by IS NULL`).
  2. **Protección IDOR (`GET /requests/:id`):** Si un requester intenta acceder a un ticket ajeno o inexistente, retornar un idéntico `404 REQUEST_NOT_FOUND`.
  3. **Creación de Solicitudes (`POST /requests`):** Extraer el `createdBy` únicamente de `req.auth.userId`. Bloquear a los agentes con `403 FORBIDDEN` si intentan crear tickets.
  4. **Mutación atómica (`PATCH /requests/:id`):** Validar que un requester solo edite contenido propio y en estado `open`. Si intenta enviar un body mixto que toque campos de agente (como `priority` o `status`), rechazar toda la petición con `403 FORBIDDEN` sin aplicar cambios parciales.
* **Verificación:**
  * `npm run validate:class-05 -- --stage ownership`
  * `npm run validate:class-05 -- --stage authorization`
  * `npm run validate:class-05` *(Prueba reina final)*