# Matriz de acceso — Request API v5

Dos roles exactos: `requester` y `agent`. Sin `admin`.
nota: agreguegue el administrador para ver la diferencias con el agente, pense que el agente erea igual al admin pero no.

Completa cada celda con `Sí`, `No`, `Propias` o `Propia y abierta`.
La matriz puede discutirse, pero la implementación converge en la baseline
del taller (lámina «Contrato fijo»).

### Matriz de Control de Acceso (RBAC + Ownership)

| Operación | Anónimo | Requester | Agent | Admin |
| :--- | :---: | :---: | :---: | :---: |
| `POST /auth/register` | **sí** | **no** | **no** | **no** |
| `POST /auth/login` | **sí** | **no** | **no** | **no** |
| `GET /auth/me` | **no** | **sí** | **sí** | **sí** |
| `GET /requests` | **no** | **propias** | **todas** | **todas** |
| `GET /requests/:id` | **no** | **propias** | **todas** | **todas** |
| `GET /requests/:id/history` | **no** | **propias** | **todas** | **todas** |
| `POST /requests` | **no** | **sí** | **no** | **sí** |
| Editar título/descripción | **no** | **propias (abiertas)** | **no** | **sí** |
| Cambiar prioridad | **no** | **no** | **sí** | **sí** |
| Cambiar estado | **no** | **no** | **sí** | **sí** |

> **Leyenda de reglas de seguridad:**
> * **Propias:** El servidor valida que el ID del creador (`created_by`) sea idéntico al ID del usuario extraído del JWT.
> * **Propias (abiertas):** Aplica validación de propiedad **Y** verifica que el estado de la solicitud sea estrictamente `open`.
> * **Separación de funciones:** El rol `Agent` no puede crear ni alterar el texto original de una solicitud.

## Campos controlados por el servidor

Los campos que gestiona de manera exclusiva el backend y no deben ser mutados ni inyectados por el cliente son los siguientes:

### En el Registro (POST /auth/register):

role: El cliente jamás puede definir su rol. El servidor asigna forzosamente role = 'citizen' (o Requester).

id, created_at, updated_at: Generados automáticamente por la base de datos.

### En las Solicitudes (POST /requests o PUT /requests/:id):

created_by: Extraído únicamente del payload verificado del token JWT (req.user.id).

status: En la creación, el servidor asigna forzosamente open.

id, created_at, updated_at: Inmutables desde la petición del cliente.

### Respuesta exacta del servidor al intentar inyectarlos:

#### Estrategia 1 (Sanitización Silenciosa - Recomendada por el taller): El servidor ignora o elimina el campo del body antes de procesar o guardar la información y retorna un 201 Created o 200 OK con el valor forzado por el servidor (por ejemplo, si el cliente envía "role": "admin", el servidor crea el usuario con "role": "citizen").

#### Estrategia 2 (Validación Estricta / Schema Validation): Si la API implementa esquemas estrictos (DTOs con additionalProperties: false), retorna un 400 Bad Request indicando que el campo enviado no está permitido.

### Solicitudes heredadas (created_by IS NULL)
¿Quién las ve?: Exclusivamente los roles Agent y Admin.

#### ¿Por qué?:

Seguridad y Privacidad: Las consultas para usuarios comunes (Requester) filtran de forma estricta por pertenencia mediante la condición created_by = current_user_id. Un registro con created_by IS NULL no coincide con ningún ID de usuario activo, por lo que devolverlo a un usuario común provocaría una fuga de información (data leak).

Gestión Operativa y Auditoría: Corresponden a registros antiguos, migraciones de datos o incidencias generadas automáticamente por el sistema antes de implementar el control de identidad. Los agentes y administradores deben visualizarlas en la cola global para darles seguimiento, asignarles un nuevo propietario o resolverlas.
