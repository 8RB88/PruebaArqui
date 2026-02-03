# CarnavalLogistics - Sistema de Gestión de Eventos Masivos

## Descripción

**CarnavalLogistics** es una plataforma integral para la gestión de logística en eventos masivos, específicamente diseñada para coordinar las festividades del carnaval municipales. El sistema maneja dos dominios completamente independientes:

### Módulos Principales

1. **Módulo de Aforo**: Gestión de capacidad y ocupación en recintos públicos
2. **Módulo de Permisos Comerciales**: Asignación y control de permisos para comerciantes

## Arquitectura

El sistema implementa una **Arquitectura en Capas** que garantiza:

- ✅ **Independencia** entre módulos
- ✅ **Mantenibilidad** mediante separación de responsabilidades
- ✅ **Escalabilidad** independiente de cada componente
- ✅ **Testabilidad** completa sin dependencias cruzadas

### Capas del Sistema

```
┌─────────────────────────────────────────┐
│  Capa de Presentación (API REST)        │
├─────────────────────────────────────────┤
│  Capa de Negocio (Services)             │
├─────────────────────────────────────────┤
│  Capa de Persistencia (Repositories)    │
├─────────────────────────────────────────┤
│  Capa de Infraestructura (DB, Cache)    │
└─────────────────────────────────────────┘
```

## Instalación

### Prerrequisitos
- Node.js 16+
- npm o yarn
- PostgreSQL (para producción)
- Redis (opcional, para caching)

### Setup Local

```bash
# Clonar repositorio
git clone <repo-url>
cd CarnavalLogistics

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Ejecutar en desarrollo
npm run dev

# Ejecutar tests
npm test

# Compilar para producción
npm run build
```

## Uso

### Endpoints Principales

#### Módulo de Aforo

```bash
# Crear un recinto
POST /api/aforo/recintos
{
  "nombre": "Plaza Mayor",
  "ubicacion": "Centro histórico",
  "capacidadMaxima": 5000,
  "tipoRecinto": "plaza",
  "descripcion": "Plaza principal del carnaval"
}

# Obtener todos los recintos
GET /api/aforo/recintos

# Registrar entrada de personas
POST /api/aforo/recintos/{id}/entrada
{
  "cantidad": 100
}

# Registrar salida de personas
POST /api/aforo/recintos/{id}/salida
{
  "cantidad": 50
}

# Obtener estado actual
GET /api/aforo/recintos/{id}/estado

# Generar reporte de ocupación
GET /api/aforo/reportes/ocupacion
```

#### Módulo de Permisos

```bash
# Registrar comerciante
POST /api/permisos/comerciantes
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "telefono": "1234567890",
  "cedula": "12345678",
  "razonSocial": "Comercio JP"
}

# Crear solicitud de permiso
POST /api/permisos/solicitudes
{
  "comercianteId": "uuid",
  "tipoProducto": "alimentos",
  "descripcion": "Venta de comidas típicas",
  "fechaInicio": "2026-03-01",
  "fechaFin": "2026-03-07",
  "ubicacionSolicitada": "Plaza Mayor",
  "areaMetrosCuadrados": 25,
  "monto": 1250
}

# Ver solicitudes pendientes
GET /api/permisos/solicitudes/pendientes

# Aprobar permiso
POST /api/permisos/solicitudes/{id}/aprobar
{
  "aprobadoPor": "funcionario-001",
  "condiciones": ["Debe cumplir normas sanitarias"]
}

# Obtener estadísticas
GET /api/permisos/estadisticas
```

## Estructura del Proyecto

```
CarnavalLogistics/
├── src/
│   ├── api/                    # Capa de Presentación
│   │   ├── app.ts
│   │   ├── routes.ts
│   │   └── middleware.ts
│   ├── modules/
│   │   ├── aforo/              # Módulo Aforo
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── validators/
│   │   │   └── routes.ts
│   │   └── permisos/           # Módulo Permisos
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── models/
│   │       ├── validators/
│   │       └── routes.ts
│   ├── infrastructure/         # Capa de Infraestructura
│   │   ├── database/
│   │   ├── cache/
│   │   └── logger.ts
│   └── index.ts               # Punto de entrada
├── tests/                      # Tests unitarios e integración
├── docs/                       # Documentación
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Pipeline CI/CD
├── package.json
├── tsconfig.json
└── .env.example
```

## Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## Deployment

### Docker

```bash
# Compilar imagen
docker build -t carnaval-logistics:1.0.0 .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env carnaval-logistics:1.0.0
```

### GitHub Actions

El repositorio incluye un pipeline CI/CD que:

1. **Ejecuta tests** en cada push
2. **Verifica calidad del código** con ESLint
3. **Compila la aplicación**
4. **Construye imagen Docker**
5. **Despliega a producción** automáticamente (para main)

Ver [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) para más detalles.

## Decisiones Arquitectónicas

### 1. Separación de Módulos
- **Aforo** y **Permisos** son completamente independientes
- Cada módulo tiene su propia BD, servicios y validaciones
- Sin acoplamiento directo entre ellos

### 2. Pattern Repository
- Abstrae la persistencia de datos
- Facilita cambios en la BD sin afectar lógica de negocio
- Permite testing sin acceso a BD real

### 3. Inyección de Dependencias
- Services reciben repositories inyectados
- Facilita testing y cambios de implementación
- Mejora mantenibilidad

### 4. Validación en Múltiples Capas
- Controllers validan entrada HTTP
- Services validan reglas de negocio
- Repository valida integridad de datos

### 5. Logging Estructurado
- Todos los eventos se registran
- Facilita debugging en producción
- Trazabilidad de operaciones

## Justificación de Mantenibilidad

| Aspecto | Beneficio |
|---------|-----------|
| **Módulos Independientes** | Cambios en Aforo no afectan Permisos |
| **Capas Claras** | Cada capa tiene responsabilidad definida |
| **Repository Pattern** | Cambios de BD sin tocar servicios |
| **Validadores Reutilizables** | Validaciones consistentes |
| **Tests Aislados** | Tests ejecutan sin dependencias cruzadas |
| **Documentación** | Código autodocumentado con comentarios |

## Tecnología

- **Language**: TypeScript
- **Framework**: Express.js
- **BD**: PostgreSQL (producción) / En memoria (desarrollo)
- **Testing**: Jest
- **Validación**: Joi
- **Seguridad**: Helmet, CORS
- **CI/CD**: GitHub Actions
- **Containerización**: Docker

## Diagramas

# Diagrama de Componentes - CarnavalLogistics

## 1. Diagrama General (C4 Context)

```
┌─────────────────────────────────────────────────────────┐
│                   CarnavalLogistics API                 │
│               (Sistema de Gestión de Eventos)           │
└─────────────┬───────────────────┬───────────────────────┘
        │                   │
   ┌────────▼──────┐   ┌────────▼──────────┐
   │  MUNICIPALIDAD│   │   COMERCIANTES    │
   │  (Dashboard)  │   │  (Portal permisos)│
   └───────────────┘   └───────────────────┘

        │                   │
        └─────────┬─────────┘
            │
       ┌────────────▼────────────┐
       │   GitHub Actions CI/CD  │
       │  (Pipeline automatizado)│
       └─────────────────────────┘
```

## 2. Diagrama de Componentes (C4 Component)

```
          ┌─────────────────────────────────┐
          │   API Gateway / Router          │
          │  (Express.js)                   │
          └──────────┬──────────────────────┘
                 │
          ┌──────────┴──────────┐
          │                     │
    ┌───────────▼──────────┐  ┌──────▼─────────────┐
    │                      │  │                    │
    │  MÓDULO AFORO        │  │  MÓDULO PERMISOS   │
    │                      │  │                    │
    ├──────────────────────┤  ├────────────────────┤
    │ Controllers          │  │ Controllers        │
    │ - AforoController    │  │ - PermisosController
    │                      │  │                    │
    │ Services            │  │ Services           │
    │ - AforoService      │  │ - PermisosService  │
    │                      │  │                    │
    │ Repositories        │  │ Repositories       │
    │ - AforoRepository   │  │ - PermisosRepository
    │                      │  │                    │
    │ Validators          │  │ Validators         │
    │ - AforoValidator    │  │ - PermisosValidator
    │                      │  │                    │
    └───────────┬──────────┘  └──────┬─────────────┘
          │                     │
    ┌───────────▼─────────┐ ┌────────▼──────────┐
    │   BD Aforo          │ │  BD Permisos      │
    │   (PostgreSQL)      │ │  (PostgreSQL)     │
    │                     │ │                   │
    │ • recintos          │ │ • comerciantes    │
    │ • ocupacion         │ │ • solicitudes     │
    │ • alertas           │ │ • aprobaciones    │
    └─────────────────────┘ └───────────────────┘

    ┌─────────────────────────────────────────────┐
    │   Capa de Infraestructura                   │
    │                                             │
    │  • Logger (Logging)                         │
    │  • Redis (Cache)                            │
    │  • Event Bus (Comunicación)                 │
    │  • Middleware (Seguridad, CORS, Auth)      │
    └─────────────────────────────────────────────┘
```

## 3. Dependencias Entre Módulos

```
┌─────────────────────┐         ┌──────────────────┐
│   MÓDULO AFORO      │         │ MÓDULO PERMISOS  │
│                     │         │                  │
│ • Gestión recintos  │         │ • Gestión permit │
│ • Occupación actual │         │ • Solicitudes    │
│ • Alertas           │         │ • Comerciantes   │
│ • Reportes          │         │ • Aprobaciones   │
│                     │         │                  │
│ BD INDEPENDIENTE    │         │ BD INDEPENDIENTE │
│ cache INDEPENDIENTE │         │ cache INDEPEND. │
│                     │         │                  │
└──────────┬──────────┘         └─────────┬────────┘
       │                              │
       │     ┌──────────────┐         │
       └────▶│  Event Bus   │◀────────┘
         │ (RabbitMQ)   │
         │              │
         │ • recinto.   │
         │   capacity.  │
         │   warning    │
         │              │
         └──────────────┘

  NO HAY DEPENDENCIAS DIRECTAS
  Comunicación ASÍNCRONA vía Event Bus
  Cada módulo funciona INDEPENDIENTEMENTE
```

## 4. Flujo de Solicitud HTTP

```
Petición HTTP
  │
  ▼
Express Router
  │
  ├─ /api/aforo/* ──▶ AforoRoutes
  │                      │
  │                      ▼
  │                 AforoController
  │                      │
  │                      ▼
  │                 AforoValidator ──▶ ❌ Error validación
  │                      │
  │                      ▼ ✓ Validado
  │                 AforoService
  │                      │
  │                      ▼
  │                 AforoRepository
  │                      │
  │                      ▼
  │                 PostgreSQL / Redis
  │
  └─ /api/permisos/* ──▶ PermisosRoutes
                │
                ▼
            PermisosController
                │
                ▼
            PermisosValidator
                │
                ▼
            PermisosService
                │
                ▼
            PermisosRepository
                │
                ▼
            PostgreSQL / Redis

  ▼
Respuesta JSON
```

## 5. Arquitectura por Capas

```
┌───────────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN (API)                │
│  • REST Endpoints (Express.js)                    │
│  • JSON Request/Response                          │
│  • HTTP Status Codes                              │
└─────────────────────┬─────────────────────────────┘
            │
┌─────────────────────▼─────────────────────────────┐
│       CAPA DE CONTROLADORES                       │
│  • Parsing de requests                            │
│  • Delegación a servicios                         │
│  • Formato de respuestas                          │
└─────────────────────┬─────────────────────────────┘
            │
┌─────────────────────▼─────────────────────────────┐
│     CAPA DE VALIDADORES                           │
│  • Validación de inputs (Joi)                     │
│  • Reglas de negocio (pre-validación)            │
│  • Errores específicos del dominio                │
└─────────────────────┬─────────────────────────────┘
            │
┌─────────────────────▼─────────────────────────────┐
│       CAPA DE LÓGICA DE NEGOCIO                   │
│  • Reglas de negocio                              │
│  • Cálculos complejos                             │
│  • Orquestación de datos                          │
│  • Eventos del dominio                            │
└─────────────────────┬─────────────────────────────┘
            │
┌─────────────────────▼─────────────────────────────┐
│        CAPA DE PERSISTENCIA                       │
│  • Repository Pattern                             │
│  • Abstracción de BD                              │
│  • Queries específicas                            │
│  • Transacciones                                  │
└─────────────────────┬─────────────────────────────┘
            │
┌─────────────────────▼─────────────────────────────┐
│    CAPA DE INFRAESTRUCTURA                        │
│  • PostgreSQL Connection                          │
│  • Redis Connection                               │
│  • Logger                                         │
│  • Event Bus                                      │
└───────────────────────────────────────────────────┘
```

## 6. Patrones de Diseño Utilizados

### 6.1 Repository Pattern
```
Service → Repository → Base de Datos

AforoService
  ↓
IAforoRepository (Interface)
  ↓
AforoRepositoryMock / AforoRepositoryPostgres

Beneficio:
✓ BD intercambiable
✓ Testing sin BD
✓ Abstracción clara
```

### 6.2 Inyección de Dependencias
```
// Sin DI
class AforoService {
  constructor() {
    this.repo = new AforoRepository();
  }
}

// Con DI
class AforoService {
  constructor(private repo: IAforoRepository) {}
}

// En routes
const repo = new AforoRepositoryMock();
const service = new AforoService(repo);
const controller = new AforoController(service);

Beneficio:
✓ Fácil testing
✓ Cambios aislados
✓ Mayor flexibilidad
```

### 6.3 Service Layer Pattern
```
Controller → Service → Repository → DB

Responsabilidades:
- Controller: HTTP
- Service: Lógica de negocio
- Repository: Persistencia

Beneficio:
✓ Separación de conceptos
✓ Testeable
✓ Reutilizable
```

### 6.4 Validator Pattern
```
Input → Validator ──▶ ❌ Error / ✓ Datos válidos

Niveles de validación:
1. Controlador (formato HTTP)
2. Validador (reglas de entrada)
3. Servicio (reglas de negocio)
4. Repository (integridad de BD)

Beneficio:
✓ Validación en capas
✓ Errores específicos
✓ Mensajes claros
```

## 7. Flujo de Datos (Ejemplo: Crear Recinto)

```
┌─ HTTP Request ────────────────────────────────────┐
│                                                    │
│ POST /api/aforo/recintos                          │
│ {                                                 │
│   "nombre": "Plaza Mayor",                        │
│   "ubicacion": "Centro",                          │
│   "capacidadMaxima": 5000,                        │
│   "tipoRecinto": "plaza"                          │
│ }                                                 │
└───────────┬────────────────────────────────────────┘
      │
      ▼
┌─ AforoController ─────────────────────────────────┐
│ crearRecinto(req, res)                            │
│   ├─ Extraer datos del request                    │
│   ├─ Pasar a validador                            │
│   └─ Si válido → Llamar a service                 │
└───────────┬────────────────────────────────────────┘
      │
      ▼
┌─ AforoValidator ──────────────────────────────────┐
│ validateRecintoCreation(data)                     │
│   ├─ Validar tipo de datos                        │
│   ├─ Validar rangos (capacidad > 0)              │
│   ├─ Validar enum (tipoRecinto válido)           │
│   └─ Retornar {error} o {value}                   │
└───────────┬────────────────────────────────────────┘
      │
      ▼
┌─ AforoService ────────────────────────────────────┐
│ crearRecinto(...)                                 │
│   ├─ Generar UUID                                 │
│   ├─ Crear objeto Recinto                         │
│   ├─ Llamar a repository.crearRecinto()           │
│   ├─ Emitir evento 'recinto:creado'              │
│   └─ Retornar recinto creado                      │
└───────────┬────────────────────────────────────────┘
      │
      ▼
┌─ AforoRepository ─────────────────────────────────┐
│ crearRecinto(recinto)                             │
│   ├─ Insertar en Map/BD                           │
│   ├─ Inicializar ocupación en 0                   │
│   ├─ Emitir evento 'recinto:almacenado'          │
│   └─ Retornar recinto                             │
└───────────┬────────────────────────────────────────┘
      │
      ▼
┌─ PostgreSQL ──────────────────────────────────────┐
│ INSERT INTO recintos (id, nombre, ...)            │
│ INSERT INTO ocupacion (recinto_id, actual, ...)   │
└───────────┬────────────────────────────────────────┘
      │
      ▼
┌─ HTTP Response ───────────────────────────────────┐
│                                                    │
│ 201 Created                                       │
│ {                                                 │
│   "mensaje": "Recinto creado exitosamente",       │
│   "recinto": {                                    │
│     "id": "uuid-...",                             │
│     "nombre": "Plaza Mayor",                      │
│     "ubicacion": "Centro",                        │
│     "capacidadMaxima": 5000,                      │
│     "estado": "activo",                           │
│     "createdAt": "2026-02-02T10:30:00Z",          │
│     "updatedAt": "2026-02-02T10:30:00Z"           │
│   }                                               │
│ }                                                 │
└───────────────────────────────────────────────────┘
```

## 8. Matriz de Independencia

```
┌─────────────────────┬──────────┬──────────┐
│ Aspecto             │ AFORO    │ PERMISOS │
├─────────────────────┼──────────┼──────────┤
│ Base de Datos       │ Propia   │ Propia   │
│ Cache               │ Propia   │ Propia   │
│ Controllers         │ Propios  │ Propios  │
│ Services            │ Propios  │ Propios  │
│ Validators          │ Propios  │ Propios  │
│ Models              │ Propios  │ Propios  │
│ Dependencias npm    │ Común    │ Común    │
│ Infraestructura     │ Común    │ Común    │
│ Event Bus           │ Suscriptor│ Suscriptor│
└─────────────────────┴──────────┴──────────┘

✓ TOTALMENTE INDEPENDIENTES a nivel de lógica de negocio
✓ REUTILIZAN infraestructura común (Express, Logger, etc.)
✓ COMUNICAN vía eventos asíncronos (sin acoplamiento)
```

## 9. Concurrencia en Aforo

```
Múltiples usuarios actualizando ocupación simultáneamente

Usuario A: +100 personas          Usuario B: +50 personas
       │                                  │
       ▼                                  ▼
  AforoService.entrada                 Actualizar ocupación
       │                                  │
       ├─ Obtener ocupación actual      │
       │  (Ej: 1000)                     ├─ Obtener ocupación actual
       │                                  │  (Ej: 1000)
       ├─ Calcular: 1000 + 100 = 1100   │
       │                                  ├─ Calcular: 1000 + 50 = 1050
       └─ Actualizar a 1100             │
          │                          └─ Actualizar a 1050
          │                                    │
          ▼                                    ▼
      PostgreSQL                           PostgreSQL
       (transacciones)                   (transacciones)
           
Nota: En producción, usar UPDATE SET ... + cantidad
    Para evitar race conditions
```

## 10. Seguridad en Capas

```
Request
  │
  ├─▶ CORS Middleware ────▶ Validar origin
  │
  ├─▶ Auth Middleware ────▶ Verificar JWT/Bearer
  │
  ├─▶ Input Validator ────▶ Sanitizar entrada
  │
  ├─▶ Service ────────────▶ Validar reglas negocio
  │
  ├─▶ Repository ─────────▶ Prepared statements
  │
  └─▶ DB Connection ──────▶ Encriptación TLS

Response
  │
  └─▶ Security Headers ───▶ Helmet.js
    ├─ X-Content-Type-Options
    ├─ X-Frame-Options
    ├─ Content-Security-Policy
    └─ Otros headers
```

## Conclusión

La arquitectura está diseñada para:

✅ **Mantenibilidad**: Cambios aislados por módulo
✅ **Escalabilidad**: Cada módulo escala independientemente
✅ **Testabilidad**: Tests sin dependencias cruzadas
✅ **Seguridad**: Validación en múltiples capas
✅ **Flexibilidad**: Fácil cambiar implementaciones

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -am 'Agrega mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## Licencia

MIT

## Autor

Roberto BTTE
