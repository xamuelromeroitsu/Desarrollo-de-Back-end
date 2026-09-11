# Cancel requests instead of deleting them
*(Cancelar solicitudes en lugar de eliminarlas)*

## Context
*(Contexto)*

The class-03 requirements include "cancel a request" and "preserve the history of the
request". A naive reading maps "cancel" to `DELETE /requests/:id`, physically removing the
item from the array. We had to decide what cancelling actually means for this system.
*(Los requisitos de la clase 03 incluyen "cancelar una solicitud" y "preservar el historial de la solicitud". Una lectura ingenua mapea "cancelar" a `DELETE /requests/:id`, eliminando físicamente el elemento del array. Tuvimos que decidir qué significa realmente cancelar para este sistema.)*

## Options
*(Opciones)*

### Option 1: Physically delete the request
*(Opción 1: Eliminar físicamente la solicitud)*

Benefits:
*(Beneficios)*

* Simplest possible implementation (`array.splice`).
  *(Implementación más simple posible).*
* The collection only contains "live" items; no filtering needed.
  *(La colección solo contiene elementos "activos"; no se necesita filtrado).*
* Matches the CRUD acronym expectation.
  *(Coincide con la expectativa del acrónimo CRUD).*

Costs:
*(Costos)*

* The history of the request disappears: nobody can answer "what happened with #42?".
  *(El historial de la solicitud desaparece: nadie puede responder "¿qué pasó con el #42?").*
* Future features (comments, audit trail) would hold references to a request that no longer
  exists.
  *(Futuras características (comentarios, pista de auditoría) mantendrían referencias a una solicitud que ya no existe).*
* Nothing can be recovered after an accidental deletion.
  *(Nada puede ser recuperado tras una eliminación accidental).*
* Deleting also breaks the id sequence assumptions of any client that cached the list.
  *(Eliminar también rompe las suposiciones de secuencia de ID de cualquier cliente que haya puesto en caché la lista).*

### Option 2: Preserve it with status `cancelled`
*(Opción 2: Preservarla con el estado `cancelled` / cancelada)*

Benefits:
*(Beneficios)*

* The request and its history survive; audit and recovery remain possible.
  *(La solicitud y su historial sobreviven; la auditoría y la recuperación siguen siendo posibles).*
* Comments and future references stay valid.
  *(Los comentarios y las referencias futuras se mantendrán válidos).*
* Cancelling becomes part of the lifecycle: the state machine controls when it is allowed
  (from `open` or `in_progress`, never from `resolved` or `closed`).
  *(Cancelar pasa a ser parte del ciclo de vida: la máquina de estados controla cuándo se permite (desde `open` o `in_progress`, nunca desde `resolved` o `closed`).*

Costs:
*(Costos)*

* Cancelled requests keep occupying memory and appear in unfiltered listings; consumers must
  filter by status when they only want active items.
  *(Las solicitudes canceladas siguen ocupando memoria y aparecen en listados sin filtrar; los consumidores deben filtrar por estado cuando solo quieren elementos activos).*
* New rules appear: what can be done with a cancelled request? (Answer: nothing — it is
  terminal.)
  *(Aparecen nuevas reglas: ¿qué se puede hacer con una solicitud cancelada? (Respuesta: nada — es terminal).)*
* The API has no true `DELETE`, which may surprise consumers that expect full CRUD.
  *(La API no tiene un `DELETE` real, lo cual puede sorprender a los consumidores que esperan un CRUD completo).*

## Decision
*(Decisión)*

Option 2. We do not implement `DELETE /requests/:id`. Cancelling is a controlled transition:
`PATCH /requests/:id` with `{ "status": "cancelled" }`, allowed from `open` and
`in_progress`. `cancelled` is a terminal status.
*(Opción 2. No implementamos `DELETE /requests/:id`. Cancelar es una transición controlada: `PATCH /requests/:id` con `{ "status": "cancelled" }`, permitida desde `open` e `in_progress`. `cancelled` es un estado terminal.)*

This is a decision for THIS domain, not a universal rule: in domains with legal deletion
requirements (personal data), physical deletion would be mandatory.
*(Esta es una decisión para ESTE dominio, no una regla universal: en dominios con requisitos legales de eliminación (datos personales), la eliminación física sería obligatoria).*

## Consequences
*(Consecuencias)*

What do we gain?
*(¿Qué ganamos?)*

* Complete history of every request, including the interrupted ones.
  *(Historial completo de cada solicitud, incluidas las interrumpidas).*
* A single modification pathway (`PATCH`) protected by the state machine.
  *(Una única vía de modificación (`PATCH`) protegida por la máquina de estados).*

What complexity appears?
*(¿Qué complejidad aparece?)*

* Listings that only want active requests must filter (`?status=open` etc.).
  *(Los listados que solo quieren solicitudes activas deben filtrar (`?status=open`, etc.)).*
* The terminal-status rule (`409 REQUEST_IN_TERMINAL_STATUS`) exists mostly because
  cancelled items stay around.
  *(La regla de estado terminal (`409 REQUEST_IN_TERMINAL_STATUS`) existe principalmente porque los elementos cancelados se quedan en el sistema).*

What can no longer be done?
*(¿Qué ya no se puede hacer?)*

* Physically removing a request through the API.
  *(Eliminar físicamente una solicitud a través de la API).*

What may need to change later?
*(¿Qué puede necesitar cambiar más adelante?)*

* If the collection grows, we may need an "archived" view or default filters.
  *(Si la colección crece, es posible que necesitemos una vista "archivada" o filtros predeterminados).*
* If legal deletion requirements appear, we will need a real deletion path with its own
  rules, documented as a new decision that supersedes this one.
  *(Si surgen requisitos legales de eliminación, necesitaremos una ruta de eliminación real con sus propias reglas, documentada como una nueva decisión que superseda a esta).*
