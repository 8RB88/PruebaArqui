# CarnavalLogistics - Arquitectura del Sistema

## 1. Visión General

**CarnavalLogistics** es una plataforma de gestión de logística para eventos masivos que coordina dos dominios completamente independientes:
- **Módulo de Aforo**: Gestión de capacidad en recintos públicos
- **Módulo de Permisos Comerciales**: Gestión de autorizaciones para puestos de comercio temporal

## 2. Arquitectura en Capas

```
┌─────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN (API)          │
│  (REST Endpoints - Express.js)              │
└──────────┬──────────────────────┬───────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼──────────┐
│ CAPA DE NEGOCIO     │  │ CAPA DE NEGOCIO   │
│ (Aforo Services)    │  │ (Permisos Services)
│                     │  │                   │
│ • Validaciones      │  │ • Validaciones    │
│ • Reglas de Negocio │  │ • Reglas de Bus   │
│ • Lógica de Aforo   │  │ • Aprobaciones    │
└──────────┬──────────┘  └────────┬──────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼──────────┐
│  CAPA DE DATOS      │  │  CAPA DE DATOS    │
│ (Aforo Repository)  │  │ (Permisos Repo)   │
│                     │  │                   │
│ • DB Aforo         │  │ • DB Permisos      │
│ • Queries          │  │ • Queries          │
│ • Cache            │  │ • Cache            │
└─────────────────────┘  └────────────────────┘
```

## 3. Estructura del Proyecto

```
CarnavalLogistics/
├── src/
│   ├── api/
│   │   ├── routes.ts              # Rutas principales
│   │   ├── middleware.ts           # Middlewares globales
│   │   └── app.ts                  # Instancia Express
│   │
│   ├── modules/
│   │   ├── aforo/
│   │   │   ├── controllers/        # Controladores HTTP
│   │   │   ├── services/           # Lógica de negocio
│   │   │   ├── repositories/       # Acceso a datos
│   │   │   ├── models/             # Modelos de datos
│   │   │   ├── validators/         # Validaciones
│   │   │   └── routes.ts           # Rutas del módulo
│   │   │
│   │   └── permisos/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── models/
│   │       ├── validators/
│   │       └── routes.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── connection.ts       # Conexión DB
│   │   │   └── migrations.ts       # Migraciones
│   │   ├── cache/
│   │   │   └── redisClient.ts
│   │   └── logger.ts
│   │
│   └── index.ts                    # Punto de entrada
│
├── tests/
│   ├── aforo/
│   ├── permisos/
│   └── integration/
│
├── .github/workflows/
│   └── ci-cd.yml                  # Pipeline GitHub Actions
│
├── docs/
│   ├── ARQUITECTURA.md            # Este archivo
│   └── DIAGRAMAS.md               # Diagramas técnicos
│
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── README.md
```

## 4. Patrones de Diseño Aplicados

### 4.1 Inyección de Dependencias
```typescript
// Services reciben repositorios inyectados
class AforoService {
    constructor(private aforoRepo: AforoRepository) {}
}
```

### 4.2 Repository Pattern
Abstrae la persistencia de datos:
- `AforoRepository` ↔ Base datos Aforo
- `PermisosRepository` ↔ Base datos Permisos

### 4.3 Service Layer
Contiene la lógica de negocio independiente de:
- Protocolo de transporte (HTTP, gRPC, etc.)
- Persistencia específica

### 4.4 Estrategia de Persistencia Independiente

**AFORO:**
- BD: PostgreSQL (Tabla: `recintos`, `capacidades`, `ocupacion_actual`)
- Cache: Redis (tiempo real de ocupación)
- Justificación: Datos críticos que requieren ACID, lectura frecuente

**PERMISOS:**
- BD: PostgreSQL (Tabla: `solicitudes_permiso`, `comerciantes`, `estado_permiso`)
- Cache: Redis (estado de aprobaciones pendientes)
- Justificación: Transacciones complejas, historial de auditoría

## 5. Independencia entre Módulos

### 5.1 Frontera de Módulos
```
┌─────────────────────────┐     ┌───────────────────────┐
│     MÓDULO AFORO        │     │ MÓDULO PERMISOS       │
│                         │     │                       │
│ • Lógica independiente  │     │ • Lógica independiente│
│ • BD separada           │     │ • BD separada         │
│ • APIs propias          │     │ • APIs propias        │
│ • Sin dependencias de   │     │ • Sin dependencias de │
│   Permisos              │     │   Aforo               │
└─────────────────────────┘     └───────────────────────┘
        ↓              ↓              ↓           ↓
      API Gateway (enroutamiento simple)
```

### 5.2 Comunicación Entre Módulos
- **Síncrona**: Event Bus (RabbitMQ/Kafka) para alertas
  - Ej: "Recinto cercano a capacidad máxima" → Permisos cierra autorizaciones
- **Asíncrona**: No existe acoplamiento directo

### 5.3 Datos Compartidos (Si es necesario)
```typescript
// Evento compartido (sin acoplamiento)
interface RecintoCapacityAlert {
    recintoId: string;
    capacidadActual: number;
    capacidadMaxima: number;
    timestamp: Date;
}

// Publicado por: AforoService
// Consumido por: PermisosService (opcional)
```

## 6. Justificación basada en Mantenibilidad

### 6.1 Cambios Aislados
| Escenario | Impacto |
|-----------|---------|
| Cambio en reglas de Aforo | Afecta solo módulo Aforo |
| Cambio en flujo de Permisos | Afecta solo módulo Permisos |
| Cambio en BD Aforo | Permisos no se ve afectado |

### 6.2 Escalabilidad
- Cada módulo puede desplegarse independientemente
- Cada módulo puede usar BD diferente si es necesario
- Cada módulo tiene su propio versionado de API

### 6.3 Testing
```
Aforo:
  ✓ Unit Tests (Servicios)
  ✓ Integration Tests (DB)
  ✓ API Tests

Permisos:
  ✓ Unit Tests (Servicios)
  ✓ Integration Tests (DB)
  ✓ API Tests

Sin dependencias cruzadas → Tests independientes
```

### 6.4 Equipo de Desarrollo
- Equipo A: Trabaja en Aforo sin afectar Permisos
- Equipo B: Trabaja en Permisos sin afectar Aforo
- Merge conflicts minimizados

## 7. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| API | Express.js / TypeScript |
| BD | PostgreSQL |
| Cache | Redis |
| ORM | Prisma o TypeORM |
| Testing | Jest |
| CI/CD | GitHub Actions |
| Containerización | Docker |
| Monitoreo | Prometheus + Grafana |

## 8. Mecanismos de Comunicación

### 8.1 REST API (Comunicación Externa)
```
GET    /api/aforo/recintos
POST   /api/aforo/recintos/{id}/ocupacion
GET    /api/permisos/solicitudes
POST   /api/permisos/solicitudes
PATCH  /api/permisos/solicitudes/{id}/aprobar
```

### 8.2 Event Bus (Comunicación Interna)
```typescript
// Publicador: AforoService
eventBus.publish('recinto.capacity.warning', {
    recintoId, capacidadActual, umbral
});

// Suscriptor: PermisosService
eventBus.subscribe('recinto.capacity.warning', (event) => {
    // Pausar nuevas autorizaciones si está cerca del límite
});
```

## 9. Estrategia de Despliegue

```
GitHub Push
    ↓
[GitHub Actions]
    ├─ Linting
    ├─ Unit Tests
    ├─ Build Docker
    └─ Push Registry
    ↓
[Staging]
    ├─ Deploy Aforo
    ├─ Deploy Permisos
    └─ Integration Tests
    ↓
[Production]
    └─ Blue-Green Deployment
```

## 10. Conclusión

Esta arquitectura garantiza:
✅ **Independencia**: Módulos completamente desacoplados
✅ **Mantenibilidad**: Cambios localizados y aislados
✅ **Escalabilidad**: Cada componente escala independientemente
✅ **Testabilidad**: Tests aislados por módulo
✅ **Deployment Flexible**: CI/CD automatizado con riesgos minimizados
