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

Con el servidor activo, ejecuta:

```powershell
curl.exe -i http://localhost:3000/
curl.exe -i http://localhost:3000/health
curl.exe -i http://localhost:3000/api/info
curl.exe -i http://localhost:3000/ruta-inexistente
```

Comprueba en la salida los estados `200`, `200`, `200` y `404`, respectivamente, además de `Content-Type` y el cuerpo JSON cuando corresponda.

## Explicación conceptual

- `http.createServer` registra una función que se ejecuta por cada petición.
- `request.method` y `request.url` describen lo que pidió el cliente.
- `response.statusCode` comunica el resultado HTTP.
- `response.setHeader` define el formato de la respuesta.
- `response.end` finaliza la respuesta; después de llamarlo no deben enviarse más datos.
- Un estado `404` significa que el servidor existe, pero la ruta solicitada no está disponible.

### Actividad extra: ¿dónde debería ocurrir esto?

Clasificación de seis operaciones entre navegador, backend y comunicación:
ver [clasificacion.md](clasificacion.md).

## Falla diagnosticada

La falla esperable al probar una ruta no registrada es `404 Not Found`. No es un error de Node.js: es una respuesta intencional que ayuda a distinguir una ruta válida de una inexistente.

## AI usage

Se utilizó IA como apoyo para ordenar la documentación, convertir los criterios de evaluación en un checklist y revisar que los comandos fueran reproducibles. La lógica del servidor debe poder explicarse y defenderse de forma independiente.

## Reflexión

Aprendí que un framework no es indispensable para responder HTTP y que cada respuesta necesita un estado, encabezados y un cuerpo claramente definidos.

## Checklist de evaluación

- [x] Funcionamiento y cumplimiento (35%): las cuatro rutas responden.
- [x] Comprensión conceptual (25%): se explica el ciclo básico petición-respuesta.
- [x] Pruebas y diagnóstico (20%): hay cuatro comandos y un caso 404.
- [x] Organización e historial (10%): código en `src` y README en la raíz de la actividad.
- [x] Puntualidad (10%): subida con tag `class-01-submission` antes del inicio de la clase 2.
