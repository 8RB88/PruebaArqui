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

Municipalidad - Equipo de Tecnología

## Contacto

Para preguntas o sugerencias, contacta al equipo de desarrollo.
