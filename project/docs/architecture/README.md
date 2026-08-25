# Arquitectura del proyecto

## Decisión inicial

El proyecto comenzará con una API HTTP organizada por responsabilidad:

```text
Cliente HTTP -> rutas -> controladores -> servicios -> persistencia
```

Cada capa debe tener una responsabilidad clara. Las rutas no deberían contener reglas de negocio ni acceso directo a la base de datos.

## Preguntas para documentar en cada avance

- ¿Qué problema resuelve este cambio?
- ¿Qué módulo es dueño de la decisión?
- ¿Cómo se puede probar?
- ¿Qué falla ocurre si la entrada es inválida o el recurso no existe?
- ¿Qué cambiaría al pasar de memoria a una base de datos?

El diagrama y las decisiones se actualizarán junto con cada entrega relevante.
