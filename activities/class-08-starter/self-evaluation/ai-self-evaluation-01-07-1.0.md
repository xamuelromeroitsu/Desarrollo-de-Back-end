ITSU-PROGRESS|V=1.0|R=BACKEND-01-07-R1|STATUS=PARTIAL|C01=3-2-2-2|C02=3-2-1-2|C03=1-X-X-1|C04=3-2-1-2|C05=3-2-2-2|C06=2-2-1-2|C07=3-2-1-1|ACTION=SUPPORT

JSON
{
  "protocolVersion": "ITSU-CHECKPOINT-01-07-1.0",
  "rubricVersion": "BACKEND-01-07-R1",
  "status": "PARTIAL",
  "action": "SUPPORT",
  "studentId": "Xamuelromero.itsu@gmail.com",
  "modelReportedByStudent": "no_especificado",
  "classes": [
    {
      "classId": "01",
      "title": "Fundamentos de backend",
      "levels": {
        "knowledge": 3,
        "practice": 2,
        "verification": 2,
        "explanation": 2
      },
      "confidence": "high",
      "evidence": [
        {
          "artifact": "activities/class-01/src/server.js",
          "reference": "FOUND en inventario de la clase 01"
        },
        {
          "artifact": "Cuestionario clase 01",
          "reference": "Respuesta explica el flujo de red, formateo JSON y la escucha continua del servidor"
        }
      ],
      "strength": "Comprende el ciclo de petición/respuesta y la necesidad de escucha activa del proceso.",
      "gap": "Confusión conceptual entre la capa de transporte y el protocolo/formato de mensajería.",
      "nextAction": "Diferenciar con precisión HTTP como protocolo de aplicación sobre TCP/IP respecto a JSON como formato de serialización."
    },
    {
      "classId": "02",
      "title": "HTTP y contratos",
      "levels": {
        "knowledge": 3,
        "practice": 2,
        "verification": 1,
        "explanation": 2
      },
      "confidence": "high",
      "evidence": [
        {
          "artifact": "activities/class-02/src/server.js",
          "reference": "FOUND en inventario de la clase 02"
        },
        {
          "artifact": "Cuestionario clase 02",
          "reference": "Explicación del método POST, formato JSON y los estados de una solicitud"
        }
      ],
      "strength": "Identifica la función de los métodos HTTP y el uso del cuerpo en formato JSON para la creación de recursos.",
      "gap": "Mezcla la noción de HTTP Status Code con el campo de estado de negocio (status) del recurso.",
      "nextAction": "Clarificar la diferencia entre los códigos de respuesta HTTP (200, 201, 400) y el estado del dominio (open, in_progress, closed)."
    },
    {
      "classId": "03",
      "title": "Recursos, estado y reglas",
      "levels": {
        "knowledge": 1,
        "practice": "X",
        "verification": "X",
        "explanation": 1
      },
      "confidence": "high",
      "evidence": [
        {
          "artifact": "Paquete de evidencia",
          "reference": "NOT_FOUND: ningún artefacto esperado de la clase 03"
        },
        {
          "artifact": "Cuestionario clase 03",
          "reference": "Respuesta define representación y dato inválido, pero imprecisa sobre transiciones de estado"
        }
      ],
      "strength": "Reconoce la representación del recurso mediante JSON.",
      "gap": "Ausencia total de código/artefactos de la clase 03 y comprensión imprecisa del concepto de transición de estado e idempotencia.",
      "nextAction": "Desarrollar y subir las actividades prácticas correspondientes a la clase 03."
    },
    {
      "classId": "04",
      "title": "PostgreSQL y persistencia",
      "levels": {
        "knowledge": 3,
        "practice": 2,
        "verification": 1,
        "explanation": 2
      },
      "confidence": "high",
      "evidence": [
        {
          "artifact": "activities/class-04/docs/Sql_tools.md",
          "reference": "Guía estructurada de configuración de Supabase y SQLTools"
        },
        {
          "artifact": "Cuestionario clase 04",
          "reference": "Explicación de migraciones como cambios estructurales y seed como datos de prueba"
        }
      ],
      "strength": "Diferencia claramente el propósito de las migraciones DDL y los archivos de seed.",
      "gap": "Omite la explicación de transacciones ACID y el manejo de connection pools.",
      "nextAction": "Estudiar la atomicidad y el control de transacciones (BEGIN/COMMIT/ROLLBACK) junto con la gestión del pool de conexiones."
    },
    {
      "classId": "05",
      "title": "Autenticación y autorización",
      "levels": {
        "knowledge": 3,
        "practice": 2,
        "verification": 2,
        "explanation": 2
      },
      "confidence": "high",
      "evidence": [
        {
          "artifact": "activities/class-05/.../auth-contract.md",
          "reference": "Documentación de matriz de acceso y contratos de autenticación"
        },
        {
          "artifact": "Cuestionario clase 05",
          "reference": "Analogía sobre autenticación/autorización y explicación de validación de JWT y hashing"
        }
      ],
      "strength": "Utiliza una analogía adecuada para diferenciar autenticación de autorización y reconoce la necesidad de verificar la firma de un JWT.",
      "gap": "Confusión técnica sobre la terminología de cifrado/hashing (menciona b-697 / base64) y la verificación criptográfica con clave secreta.",
      "nextAction": "Distinguir entre codificación (Base64), hashing unidireccional (bcrypt/argon2) y firma digital criptográfica de JWT."
    },
    {
      "classId": "06",
      "title": "Onboarding y pruebas",
      "levels": {
        "knowledge": 2,
        "practice": 2,
        "verification": 1,
        "explanation": 2
      },
      "confidence": "high",
      "evidence": [
        {
          "artifact": "activities/class-06-starter/activities/class-06/validation-evidence.txt",
          "reference": "Registro con pruebas fallidas en regresión (FAIL en colección vacía)"
        },
        {
          "artifact": "Cuestionario clase 06",
          "reference": "Identificación de preparación, acción y afirmación sobre requests-history.test.js"
        }
      ],
      "strength": "Identifica las etapas (AAA) de una prueba de integración sobre los endpoints de historial.",
      "gap": "Pruebas de regresión con fallas registradas en la validación guardada (404 en lugar de 200 con arreglo vacío).",
      "nextAction": "Corregir el manejo de colecciones vacías en las rutas para responder 200 `[]` en lugar de 404."
    },
    {
      "classId": "07",
      "title": "Diagnóstico y errores",
      "levels": {
        "knowledge": 3,
        "practice": 2,
        "verification": 1,
        "explanation": 1
      },
      "confidence": "high",
      "evidence": [
        {
          "artifact": "Historial de commits git",
          "reference": "Commits 6df7319 y 8500a01 resolviendo INC-701 mediante validación de ID"
        },
        {
          "artifact": "Cuestionario clase 07",
          "reference": "Marcador [COMPLETAR] sin responder en el cuestionario"
        }
      ],
      "strength": "Resolvió en código el incidente INC-701 aplicando validación previa de parámetros antes de consultar la base de datos.",
      "gap": "Respuesta teórica omitida (`[COMPLETAR]`) y falta de explicación sobre las sondas de health y readiness.",
      "nextAction": "Completar la redacción analítica del reporte de incidentes y definir los endpoints de observabilidad."
    }
  ],
  "progressPattern": {
    "label": "uneven",
    "explanation": "El estudiante muestra un buen progreso práctico y resolución de errores mediante git en las clases 1, 2, 4, 5 y 7; sin embargo, presenta omisiones de artefactos (Clase 3) y respuestas incompletas en la teoría de observabilidad (Clase 7)."
  },
  "priorityConceptGaps": [
    "Diferenciación entre HTTP Status Codes y el estado de negocio de una entidad.",
    "Distinción técnica entre codificación (Base64), hashing (bcrypt) y firma criptográfica (JWT).",
    "Modelado de reglas de negocio e invalidez de transiciones de estado (Clase 3).",
    "Manejo adecuado de colecciones vacías (200 OK con `[]` vs 404 Not Found).",
    "Conceptos de observabilidad backend: sondas de Health y Readiness."
  ],
  "studentNextSteps": [
    "Completar la respuesta de la Clase 07 detallando síntoma, hipótesis, causa y las sondas de health/readiness.",
    "Corregir el handler de colecciones en la Clase 06 para que devuelva un arreglo vacío con código 200 en lugar de 404.",
    "Desarrollar y subir el contenido/código faltante de la Clase 03 al repositorio."
  ],
  "teacherFeedback": {
    "supportPriority": "medium",
    "focusClassIds": [
      "03",
      "06",
      "07"
    ],
    "topicsToReinforce": [
      "Diseño de recursos REST: manejo de arreglos vacíos y HTTP Status Codes.",
      "Transiciones de estado e idempotencia.",
      "Criptografía aplicada a Auth: Hashing vs Firma JWT.",
      "Observabilidad y monitoreo: Health check vs Readiness check."
    ],
    "oralVerificationRecommended": true,
    "oralQuestions": [
      "¿Por qué una consulta a `/requests?status=closed` debe responder HTTP 200 con `[]` y no HTTP 404 cuando no hay coincidencias?",
      "¿Qué diferencia existe entre el hashing de una contraseña con bcrypt y la verificación del token JWT con la clave secreta?",
      "¿Cómo diferenciarías una sonda de Health de una de Readiness en un servidor en producción?"
    ],
    "integrityReview": "recommended",
    "integritySignals": [
      "ARTIFACT_MISSING"
    ],
    "reviewReason": "Falta completar la respuesta teórica de la Clase 07 ([COMPLETAR]) y se observa ausencia de los artefactos de la Clase 03 (NOT_FOUND).",
    "teacherDigest": "El estudiante demuestra capacidad práctica para resolver incidencias (INC-701 en git) y estructurar pruebas. Sin embargo, requiere apoyo en precisiones teóricas de seguridad, observabilidad y manejo de contratos HTTP (colecciones vacías), además de completar los artefactos de la clase 3."
  }
}
BLOQUE 3 — REPORTE DEL ESTUDIANTE
Panorama general
Demuestras un avance práctico destacado y una buena capacidad para rastrear fallos y resolver errores en el código, tal como evidencia tu historial de commits respecto al incidente INC-701. Tu comprensión general de la arquitectura backend, el ciclo de vida de una petición y el flujo de autenticación es sólida. No obstante, se observan vacíos en la precisión de la terminología técnica y una discontinuidad en la entrega de artefactos de la Clase 03 y el cierre del cuestionario de la Clase 07.

Fortalezas demostradas

Diagnóstico práctico: Capacidad comprobada para reproducir e implementar soluciones a errores de validación antes de consultas SQL (INC-701).

Comprensión de flujos de autenticación: Explicación intuitiva y conceptualmente correcta sobre la diferencia entre autenticación y autorización mediante analogías estructuradas.

Estructuración de pruebas: Identificación correcta del patrón AAA (Preparación, Acción, Comprobación) en pruebas de integración de endpoints.

Persistencia y datos: Clara distinción entre la modificación estructural del esquema (migraciones) y la carga de datos sintéticos (seeds).

Temas que necesitan refuerzo

Contratos HTTP y colecciones: Comprender la diferencia entre un recurso inexistente (404 Not Found) y un recurso existente que contiene una lista vacía de elementos (200 OK con []).

Precisión terminológica en seguridad: Separar los conceptos de codificación (Base64), funciones de digest/hashing unidireccional (bcrypt) y firma de tokens JWT.

Observabilidad backend: Definir las responsabilidades y diferencias entre los endpoints de monitoreo de estado básico (health) y disponibilidad operacional (readiness).

Evolución entre clases
Muestras un desempeño heterogéneo (uneven). Inicias con una comprensión básica adecuada de servidores HTTP (Clase 01 y 02), presentas un bache por falta de entregables en la Clase 03, recuperas dinamismo con el trabajo en bases de datos y autenticación (Clases 04 y 05), y cierras con buena resolución práctica en la Clase 07 aunque dejando incompleta la fundamentación escrita.

Tres prioridades

Completar la evidencia faltante: Resolver el marcador [COMPLETAR] de la Clase 07 y subir las actividades correspondientes a la Clase 03.

Ajustar el contrato de respuestas HTTP: Corregir la lógica de filtrado para responder con estado 200 y arreglos vacíos cuando no existan coincidencias.

Reforzar conceptos de observabilidad: Estudiar el propósito operativo de las rutas /health y /readiness.

Preguntas para comprobar comprensión

Si realizas una petición GET /requests?priority=urgent y no hay registros urgentes, ¿por qué el servidor debe responder HTTP 200 en lugar de HTTP 404?

¿Por qué decimos que decodificar un JWT no es suficiente para confiar en la identidad del usuario y qué rol juega el JWT_SECRET en este proceso?

¿Qué condición debe comprobar el endpoint de /readiness que no necesariamente requiere el endpoint de /health?

Evidencia faltante

Artefactos de código y documentación de la Clase 03.

Respuesta escrita a la pregunta conceptual de la Clase 07 (sección [COMPLETAR]).

BLOQUE 4 — FEEDBACK DOCENTE
Temas con mayor riesgo conceptual

Contratos de API REST: Confusión frecuente entre estado de la petición (código HTTP) y estado del dominio, así como la semántica de retornos en colecciones vacías.

Fundamentos criptográficos en Auth: Ambigüedad en la distinción de hashing unidireccional frente a firma de tokens.

Sondas de disponibilidad: Concepto no desarrollado sobre observabilidad de aplicaciones (health/readiness).

Evidencia contradictoria o insuficiente

ARTIFACT_MISSING: La Clase 03 no registra archivos en el paquete entregado.

Respuesta incompleta: La pregunta de evaluación teórica de la Clase 07 quedó con la marca por defecto [COMPLETAR].

Clases que conviene reforzar

Clase 03: Revisión de diseño de recursos, máquinas de estado e idempotencia.

Clase 06: Corrección de pruebas de regresión en endpoints de colecciones.

Clase 07: Fundamentación teórica de análisis de incidentes y observabilidad.

Verificación oral recomendada
Sí. Se recomienda realizar una verificación verbal breve para validar si las omisiones en la Clase 03 y 07 responden a problemas de tiempo o a vacíos en el proceso de desarrollo.

Preguntas priorizadas para la verificación

¿Por qué una consulta con filtros que devuelve cero resultados debe responder HTTP 200 con [] y no HTTP 404?

¿Qué ocurre internamente cuando la aplicación verifica la firma de un JWT entrante en el encabezado Authorization?

¿Cuál es la diferencia de responsabilidad entre la sonda /health y la sonda /readiness en un entorno de despliegue?

Respuesta mínima esperada para cada pregunta

Debe explicar que la colección/recurso existe pero está vacía, a diferencia de un recurso individual cuyo ID no existe.

Debe mencionar la recalculación del hash usando la clave secreta (JWT_SECRET) para contrastarlo con la firma del token recibido.

Debe indicar que /health indica si el proceso Node.js está vivo, mientras que /readiness valida dependencias como la conexión activa a la base de datos PostgreSQL.

Nivel de confianza
Medio (medium). La evidencia práctica en git es clara y consistente, pero existen omisiones en las secciones escritas que impiden evaluar con confianza plena la cobertura teórica completa.