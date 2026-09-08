# Matriz de acceso — Request API v5

Dos roles exactos en la implementación: `requester` y `agent`. **No existe
`admin`**: la columna `Admin` de la tabla es ilustrativa (ejemplo de contraste
con `agent`) y NO forma parte del contrato fijo del taller.

Completa cada celda con `Sí`, `No`, `Propias` o `Propia y abierta`.
La implementación converge en la baseline del taller (lámina "Contrato fijo").

### Matriz de Control de Acceso (RBAC + Ownership)

| Operación | Anónimo | Requester | Agent | Admin* |
| :--- | :---: | :---: | :---: | :---: |
| `POST /auth/register` | Sí | Sí | Sí | — |
| `POST /auth/login` | Sí | Sí | Sí | — |
| `GET /auth/me` | No | Sí | Sí | — |
| `GET /requests` | No | Propias | Todas | Todas |
| `GET /requests/:id` | No | Propias | Todas | Todas |
| `GET /requests/:id/history` | No | Propias | Todas | Todas |
| `POST /requests` | No | Sí | No | Sí |
| Editar título/descripción | No | Propia y abierta | No | Sí |
| Cambiar prioridad | No | No | Sí | Sí |
| Cambiar estado | No | No | Sí | Sí |

\* Columna ilustrativa: el rol `admin` no se implementa. El agente, por
ejemplo, NO crea solicitudes ni edita el texto del dueño; un `admin`
hipotético las podría gestionar todas — esa diferencia es lo que se quiere
mostrar.

> **Leyenda de reglas de seguridad:**
> * **Propias:** el servidor valida que el ID del creador (`created_by`) sea
>   idéntico al ID del usuario extraído del JWT (`req.auth.userId`).
> * **Propia y abierta:** propiedad **Y** estado estrictamente `open`.
> * **Todas:** el actor ve toda la colección, incluidas las solicitudes
>   heredadas sin dueño (`created_by IS NULL`).
> * **Separación de funciones:** `agent` no puede crear ni alterar el texto
>   original de una solicitud.

## Campos controlados por el servidor

Nunca deben llegar desde el body. Su fuente de verdad es el servidor y
enviarlos produce **`400 SERVER_CONTROLLED_FIELD`** (rechazo explícito, no se
ignoran en silencio).

### En el Registro (`POST /auth/register`)

* `role`: el cliente jamás lo define. El servidor asigna forzosamente
  `requester`.
* `id`, `created_at`, `updated_at`: generados automáticamente por la base de
  datos.

### En las Solicitudes (`POST /requests` y `PATCH /requests/:id`)

* `created_by`: extraído únicamente del payload verificado del token JWT
  (`req.auth.userId`), nunca del body.
* `status`: en la creación, el servidor asigna forzosamente `open`.
* `changed_by`: del JWT (el actor del historial), nunca del body.
* `id`, `created_at`, `updated_at`: inmutables desde la petición del cliente.

### Respuesta exacta del servidor al intentar inyectarlos

**Validación estricta (implementada):** el cuerpo se valida con allowlist
(`additionalProperties`); si llega un campo controlado, responde
`400 SERVER_CONTROLLED_FIELD`, en lugar de aplicar el valor o ignorarlo
silenciosamente — ignorar en silencio permitiría escalación de rol.

## Solicitudes heredadas (`created_by IS NULL`)

* **¿Quién las ve?** Exclusivamente `agent` (la columna Admin es ilustrativa).

**¿Por qué?**
* **Seguridad y privacidad:** las consultas de un requester filtran por
  pertenencia estricta (`created_by = <userId del token>`). Un registro con
  `created_by IS NULL` no coincide con ningún usuario, así que devolverlo a un
  requester sería una fuga de información (data leak) → responde
  `404 REQUEST_NOT_FOUND`, idéntico al de un ID inexistente.
* **Gestión operativa:** son registros previos al control de identidad; los
  agentes los gestionan en la cola global.