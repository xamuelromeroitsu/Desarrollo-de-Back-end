# Casos adversariales — Request API v5

Describe al menos ocho ataques que tu implementación deberá resistir, con el
resultado exacto esperado (código HTTP + `error.code`). Piensa como quien NO
respeta tu frontend: registro con `role`, `createdBy` inventado, IDs ajenos,
tokens editados o vencidos, bodies mixtos, headers extraños…

Formato: **ataque** → método/ruta + entrada maliciosa → **resultado esperado**.

1. **Escalación de privilegios en el registro** → `POST /auth/register` con
   `{ "role": "agent", ... }`. El rol lo asigna el servidor
   (`requester` siempre) → **`400 SERVER_CONTROLLED_FIELD`**.

2. **Inyección de identidad/auditoría en el registro** → `POST /auth/register`
   con `id` inventado, `createdAt: "2099-…"`, `createdBy` o `passwordHash` en
   el body → **`400 SERVER_CONTROLLED_FIELD`** (rechazo explícito, nunca
   silencioso).

3. **`createdBy` falsificado en creación** → `POST /requests` autenticado
   como alice con `{ "createdBy": "<id-bob>" }`. El dueño sale del token
   verificado, no del body → **`400 SERVER_CONTROLLED_FIELD`**.

4. **Solicitud que nace cerrada** → `POST /requests` con `{ "status": "closed" }`.
   Toda solicitud nace `open` → **`400 SERVER_CONTROLLED_FIELD`**.

5. **Acceso a una solicitud ajena** → `GET /requests/<id-de-bob>` con token de
   alice. No debe existir forma de distinguirla de una inexistente →
   **`404 REQUEST_NOT_FOUND`** (idéntica al caso 6).

6. **Acceso a una solicitud inexistente** → `GET /requests/999999999` →
   **`404 REQUEST_NOT_FOUND`** — y su cuerpo debe ser byte-idéntico al del
   caso 5, para no revelar existencia.

7. **Solicitud heredada (sin dueño)** → `GET /requests/<created_by IS NULL>`
   con token de un requester → **`404 REQUEST_NOT_FOUND`**: `created_by` nulo
   nunca coincide con un requester (solo `agent` las ve).

8. **Acceso sin token** → `GET /requests`, `GET /auth/me`, `PATCH /requests/:id`
   sin header `Authorization` → **`401 AUTHENTICATION_REQUIRED`** en todos.

9. **Esquema u header extraño** → `GET /auth/me` con
   `Authorization: Basic dXNlcjpwYXNz` o `Bearer ` (vacío) → **`401 AUTHENTICATION_REQUIRED`**:
   solo el esquema `Bearer` con token no vacío es identidad.

10. **Token manipulado** → `GET /auth/me` con un JWT cuyo payload se editó a
    `{ "role": "agent" }` (firma original intacta) → **`401 INVALID_TOKEN`**.
    Decodificar no es verificar: la firma ya no valida.

11. **Token vencido o firmado con otra clave** → `GET /auth/me` con un JWT
    vencido o con el mismo payload pero otra `JWT_SECRET` → **`401 INVALID_TOKEN`**
    (misma respuesta, sin decir qué chequeo falló).

12. **PATCH con body mixto (parcialmente prohibido)** → `PATCH /requests/:id`
    como requester con `{ "title": "…", "priority": "low" }` (título permitido,
    prioridad solo de `agent`) → **`403 FORBIDDEN`** y NO se aplica el título:
    autorización todo-o-nada. [Ó ACLARACIÓN: requester sí edita contenido propio
    abierto; el `403` aplica cuando el body incluye al menos un campo que su rol
    no puede tocar.]

13. **`changedBy` fabricado en PATCH** → `PATCH /requests/:id` con
    `{ "status": "in_progress", "changedBy": "<id-ajeno>" }` → **`400 SERVER_CONTROLLED_FIELD`**:
    el actor del historial sale del token.

14. **Enumeración de cuentas por login** → `POST /auth/login` con email
    inexistente vs con password incorrecta → ambas **`401 INVALID_CREDENTIALS`**
    con cuerpo byte-idéntico.

15. **Operación prohibida por rol** → `POST /requests` como `agent`
    **`403 FORBIDDEN`**; `PATCH /requests/:id` con `status`/`priority` como
    requester → **`403 FORBIDDEN`**; editar contenido como `agent` → **`403 FORBIDDEN`**.