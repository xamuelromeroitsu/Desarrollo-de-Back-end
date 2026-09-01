# 🚀 Arquitectura y Estructura del Proyecto

Este documento detalla la organización de carpetas, la configuración del entorno y la responsabilidad de cada capa en el código fuente de **class-04**.

---

## 🌳 Árbol de Directorios

```text
class-04/
├── .env                  # Variables locales con credenciales reales (EN .GITIGNORE)
├── .env.example          # Plantilla con variables y notas explicativas (EN GIT)
├── .gitignore            # Excluye .env, node_modules, dist, etc.
├── README.md             # Instrucciones de configuración y despliegue
├── docs/                 # Documentación técnica e imágenes
│   └── setup-sqltools.md # Guías de configuración para el equipo
├── prisma/               # O Drizzle / Migraciones SQL nativas
│   ├── schema.prisma     # Esquema de la base de datos
│   └── migrations/       # Historial de migraciones para producción
└── src/                  # Código fuente de la aplicación
    ├── config/           # Configuración del sistema e infraestructura
    │   ├── database.js   # Inicialización de la conexión a DB/Pooler
    │   └── env.js        # Validación y tipado de variables de entorno
    ├── constants/        # Constantes globales del sistema
    ├── controllers/      # Capa HTTP (Manejo de Request y Response)
    ├── middlewares/      # Middlewares (Auth, Validaciones, Rate Limiting)
    ├── models/           # Modelos de datos / ORM / Consultas SQL directas
    ├── routes/           # Definición y enrutamiento de endpoints API
    ├── services/         # Lógica de negocio pura de la aplicación
    └── utils/            # Funciones de soporte reutilizables (logger, helpers)