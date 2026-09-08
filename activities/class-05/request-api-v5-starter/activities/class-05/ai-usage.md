# AI usage

Este archivo solo puede tener contenido DESPUÉS del checkpoint
`class-05-access-design` (matriz + contrato + amenazas completos).

## My design before AI

## What I asked

## What the AI proposed

## What I accepted

## What I rejected

## Security mistakes I detected

## How I verified the implementation

## What I still do not understand





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