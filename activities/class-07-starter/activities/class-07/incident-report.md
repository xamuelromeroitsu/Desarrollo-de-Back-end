# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

Which command confirmed the starting state?
npm run class-07:doctor  # 7/7 PASS
npm test                 # 20 pass, 17 todo

## Incident 701

### Report

(what support said, in one or two lines)

Soporte reporta que algunas solicitudes devuelven 500 cuando se consultan 
con identificadores que no son números.
la informacion deberia resolverse en la logica y en el mildeware con un error 400 por que esta introduciendo letras en vez de numeros, en vez de eso pasa y rompe el servidor dando 5--

### Reproduction

(the exact request: method, path, user/role, body if any)

- Method: GET
- Path: /requests/not-a-number
- User: Ana (requester)
- Token: Bearer eyJ... (no incluir el token real)
- Headers: Authorization: Bearer <token>

### Expected result
400 Bad Request
{
  "error": {
    "code": "INVALID_REQUEST_ID",
    "message": "Request id must be a positive integer."
  }
}
eso seria lo normal en un sistema correcto pero esta pasando el error al servido de la base de datos con 500

### Actual result

(status and body actually received — copy them)

al registrar el usuario y recibir el bearer token ponerloem el header y la key o el name en Bruno de authentication al enviar salia 

500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred."
  }
}

### Hypotheses

(at least two, ordered by probability, each with HOW you would check it)

1. **El ID no se valida antes de llegar a SQL** (probable)
   - Cómo verificar: Buscar en requests.routes.js si hay validación 
     de Number() antes de findById()

2. **PostgreSQL lanza error y no se atrapa como AppError** (posible)
   - Cómo verificar: Revisar si el error de PostgreSQL viaja sin 
     ser transformado en una respuesta HTTP

3. **El middleware de errores no está registrado** (menos probable)
   - Cómo verificar: Revisar app.js si errorHandler está después 
     de las rutas


nota. Un profesional no adivina. Plantea posibilidades y dice cómo comprobar cada una. Las ordena por probabilidad.
### Evidence

(what you observed: terminal output, the line where the value travels…
never paste a connection string or a token here)

- En requests.routes.js:30: `Number(req.params.id)` convierte 
  "not-a-number" a NaN  esta ya la vimos 
- En requests.store.js:51: `WHERE id = $1` recibe NaN
- El error en terminal dice: "invalid input syntax for type integer"
- No hay validación del ID antes de llegar a SQL


### Confirmed cause
El parámetro :id de la URL no se valida antes de pasarse a la base 
de datos. Number("not-a-number") devuelve NaN, que se envía a SQL, 
causando un error de PostgreSQL que no es transformado en AppError, 
sino que viaja como error genérico 500.

En Bruno, creá el request así:

Method: GET
URL: http://localhost:3000/requests/not-a-number
Andá a la pestaña Headers
En Key escribí exactamente: Authorization
En Value pegá esto exactamente (sin comillas al inicio ni final):

## Evidencia manual

![confirmando el error manualmente con bruno](701-error-request-not-a-number.png)
### Correction

(the minimal change: file and what it does — not the whole diff)

correcin recomendada por Open Code
### Correction
- Archivo: src/modules/requests/requests.routes.js
- Cambio: Agregar validación del ID antes de Number()
  if (isNaN(id) || id <= 0) {
    throw new AppError('contract', 'INVALID_REQUEST_ID', 
      'Request id must be a positive integer.');
  }

  Un profesional documenta el cambio mínimo necesario. No pega todo el diff.

### Regression test

(which test now fails without the fix and passes with it)

- GET /requests/not-a-number → 400 INVALID_REQUEST_ID ✓
- GET /requests/abc123 → 400 INVALID_REQUEST_ID ✓
- GET /requests/0 → 400 INVALID_REQUEST_ID ✓
- GET /requests/-1 → 400 INVALID_REQUEST_ID ✓
- GET /requests/999999999 → 404 REQUEST_NOT_FOUND ✓

## Incident 702

### Report

### Reproduction

### Expected result

### Actual result

### Hypotheses

### Evidence

### Confirmed cause

### Correction

### Regression test

## Error flow

Where is the error created?
How does it reach the error middleware?
What is returned to the client?
What remains only in the server log?

## Request ID

How did I prove that the response and log belong to the same request?

## AI assistance

What did AI help me understand?
Which hypothesis did it propose?
How did I verify it?
What suggestion was incomplete or incorrect?

## Remaining doubt

What part do I still not understand?
