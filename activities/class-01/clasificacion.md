# Actividad: ¿dónde debería ocurrir esto?

## Consigna

Clasificar seis operaciones según dónde viven: navegador, backend,
o si requieren comunicación entre ambos.

## Tabla de clasificación

| Operación | Clasificación | Justificación |
| --- | --- | --- |
| Cambiar color de un botón al pasar el mouse | Navegador | Solo transforma lo que ya está en pantalla (CSS/JS local); el servidor no participa. |
| Guardar una solicitud de soporte que exista mañana | Backend | Necesita persistencia: los datos deben sobrevivir al cierre de la pestaña y al navegador del usuario. |
| Verificar una contraseña | Backend | El cliente puede validar *formato*, pero la comprobación real exige datos que el usuario no debe controlar. |
| Mostrar un mensaje de error en pantalla | Navegador | Renderizar el mensaje es UI; el dato del error puede originarse en el backend, pero mostrarlo ocurre en el cliente. |
| Leer un archivo del disco | Backend | El navegador vive en una caja de arena: no puede tocar el sistema de archivos; leer recursos del disco es trabajo del servidor. |
| Enviar el contenido de un formulario | Comunicación | El navegador arma y envía la petición, pero sin un receptor que la procese no existe la operación completa. |

## Operaciones dudosas (justificadas)

- **Verificar una contraseña**: parece de interfaz porque ves el campo y el aviso,
  pero si la validación viviera en el navegador, cualquiera podría saltársela
  mirando el código fuente o enviando peticiones directamente. La decisión
  sensible siempre va donde el usuario no manda.
- **Mensaje de error**: se divide en dos responsabilidades — *producir* el error
  puede ser backend (por ejemplo, una contraseña incorrecta), *mostrarlo* es navegador.
- **Enviar formulario**: es literalmente el puente entre los dos mundos; por sí solo
  no completa ninguna tarea útil.

## Mi regla para decidir dónde va cada responsabilidad

Me pregunto tres cosas:

1. ¿Sobrevive al cierre de la pestaña? → No: **backend** (persistencia).
2. ¿El usuario podría hacer trampa si la decidiera el navegador? → Sí: **backend** (confianza).
3. ¿Solo cambia algo visible de la página actual? → Sí: **navegador** (interfaz).

Y si la operación necesita salir del navegador para completarse → **comunicación entre ambos**.

## Creía que eran del navegador y en realidad necesitan backend

- Verificar una contraseña (pensé que era como validar un campo vacío).
- Guardar la solicitud de soporte (pensé que "guardar" era cosa de mi computadora).
- Leer un archivo del disco (no sabía que el navegador no puede tocar discos libremente).

## Reflexión breve

La frontera entre frontend y backend no es técnica sino de confianza:
el navegador es territorio del usuario (puede inspeccionarlo y manipularlo);
el backend es territorio del sistema (decide con datos y recursos propios).
Por eso todo lo que implica persistencia, seguridad o acceso a recursos
termina cruzando la frontera mediante una petición.
