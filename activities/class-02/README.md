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

Ubícate en la carpeta de la actividad e instala las dependencias:

```bash
cd activities/class-02
npm install
```

Esto crea la carpeta `node_modules/` con Express dentro. Solo hace falta hacerlo una vez.

## Ejecución

```bash
npm start
```

Deberías ver en la terminal:

```txt
Request API Lite is running on http://localhost:3000
```

El servidor queda escuchando en el puerto **3000**. Para detenerlo, presiona `Ctrl + C`.

## Endpoints disponibles

| Método | Ruta             | Para qué sirve                                |
| ------ | ---------------- | --------------------------------------------- |
| GET    | `/getRequests`   | Devuelve la lista completa de solicitudes.    |
| GET    | `/requests/:id`  | Devuelve una solicitud por su identificador.  |
| POST   | `/requests`      | Crea una nueva solicitud.                     |

### Ejemplos con `curl`

Listar todas las solicitudes:

```bash
curl -i http://localhost:3000/getRequests
```

Consultar una solicitud por su `id`:

```bash
curl -i http://localhost:3000/requests/1
```

Crear una nueva solicitud:

```bash
curl -i -X POST http://localhost:3000/requests \
  -H "Content-Type: application/json" \
  -d '{"title":"Leaking faucet","description":"The faucet in the third floor bathroom leaks.","priority":"medium"}'
```

> La opción `-i` muestra la línea de estado y los encabezados de la respuesta, no solo el
> cuerpo. Vas a necesitar esa información.

## Casos comprobados y diagnóstico

1. `GET /getRequests` devuelve las tres solicitudes iniciales.
2. `GET /requests/1` devuelve la solicitud con identificador 1.
3. `GET /requests/999` devuelve `{ "error": "Request not found" }`.
4. `POST /requests` agrega una solicitud y asigna un identificador nuevo.

La API actualmente responde con estado `200` cuando no encuentra un recurso y cuando crea uno.
Una mejora pendiente es usar `404` en el primer caso, `201` al crear recursos y validar que
`title`, `description` y `priority` estén presentes.

## Explicación conceptual

- `express()` crea la aplicación HTTP.
- `express.json()` convierte cuerpos JSON en `req.body`.
- `/requests/:id` usa un parámetro dinámico disponible en `req.params.id`.
- El arreglo `requests` simula persistencia, pero se reinicia al apagar el proceso.
- `res.json()` serializa un objeto y lo devuelve como JSON.

## AI usage

Se utilizó IA como apoyo para reorganizar el repositorio, documentar la rúbrica y proponer casos
de prueba. La implementación, sus límites y el diagnóstico de estados HTTP fueron revisados en
el código.

## Reflexión

Aprendí cómo Express reduce el código repetitivo de un servidor HTTP y cómo una ruta REST conecta
el método HTTP, la URL, la entrada del cliente y la respuesta.

## Checklist de evaluación

- [x] Funcionamiento y cumplimiento (35%): GET y POST funcionan con datos en memoria.
- [x] Comprensión conceptual (25%): se explican middleware, parámetros y JSON.
- [x] Pruebas y diagnóstico (20%): se documentan cuatro casos, incluido un recurso inexistente.
- [x] Organización e historial (10%): actividad separada, `src/server.js` y `package.json` local.
- [x] Puntualidad (10%): subida con tag `class-02-submission`.

## Notas

* Los datos no se guardan en ningún archivo ni base de datos: viven en un arreglo dentro de
  `src/server.js`.
* Si el puerto 3000 ya está ocupado, detén el otro proceso antes de ejecutar este servidor.
