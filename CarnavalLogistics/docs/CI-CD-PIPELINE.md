# Pipeline CI/CD - CarnavalLogistics

## Visión General

El pipeline de GitHub Actions automatiza el proceso de desarrollo, testing, construcción y despliegue de CarnavalLogistics. Está diseñado para garantizar calidad, seguridad y confiabilidad en cada cambio.

## Flujo del Pipeline

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
   ┌─────────────────────────┐
   │   TESTING Y VALIDACIÓN  │
   │  - ESLint              │
   │  - Unit Tests          │
   │  - Coverage            │
   └──────────┬──────────────┘
              │
              ▼
       ┌──────────────────┐
       │  COMPILACIÓN     │
       │  TypeScript → JS │
       └──────┬───────────┘
              │
              ▼
       ┌──────────────────┐
       │  SEGURIDAD       │
       │  Trivy Scanner   │
       └──────┬───────────┘
              │
              ▼
       ┌──────────────────┐
       │  DOCKER BUILD    │
       │  - Compilar      │
       │  - Push Registry │
       └──────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────────┐  ┌──────────────┐
│  STAGING    │  │ PRODUCCIÓN   │
│ (develop)   │  │ (main)       │
└─────────────┘  └──────────────┘
```

## Etapas Detalladas

### 1. TESTING Y VALIDACIÓN (test)

**Triggers:**
- Push a `main` o `develop`
- Pull Request a `main` o `develop`

**Acciones:**
```yaml
- Clonar código
- Instalar dependencias (npm ci)
- Ejecutar ESLint → Validar código
- Ejecutar Jest Tests → Unit tests
- Generar reporte de cobertura
- Subir a Codecov
```

**Node versions testeadas:** 18.x, 20.x

**Salida:** Reportes de cobertura en Codecov

```bash
# Comando local equivalente
npm install
npm run lint
npm test -- --coverage --watchAll=false
```

### 2. COMPILACIÓN (build)

**Dependencias:** test ✓

**Acciones:**
```yaml
- Clonar código
- Instalar dependencias
- TypeScript → JavaScript (npm run build)
- Subir artefacto "dist" para próximas etapas
```

**Artefacto:** `dist/` (retención: 1 día)

```bash
# Comando local equivalente
npm install
npm run build
```

### 3. ANÁLISIS DE SEGURIDAD (security)

**Dependencias:** Independiente

**Acciones:**
```yaml
- Clonar código
- Escanear con Trivy (vulnerabilidades de dependencias)
- Generador reporte SARIF
- Subir a GitHub Code Scanning
```

**Herramienta:** Aqua Security Trivy

```bash
# Comando local equivalente
trivy fs . --format sarif --output trivy-results.sarif
```

### 4. CONSTRUCCIÓN DOCKER (docker-build)

**Dependencias:** test ✓, build ✓

**Acciones:**
```yaml
- Clonar código
- Descargar artefacto compilado
- Configurar Docker Buildx
- Login en GHCR (GitHub Container Registry)
- Extraer metadatos (tags, versiones)
- Compilar imagen Docker
- Push a registry (solo en main)
```

**Tags generados:**
- Branch actual: `develop-abc123`
- SHA del commit: `main-abc123def456`
- Latest (si es main): `latest`
- Semver (si existe tag): `v1.2.3`

**Dockerfile:** Multi-stage, Node 18-alpine

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
HEALTHCHECK ...
CMD ["node", "dist/index.js"]
```

### 5. DEPLOY A STAGING (deploy-staging)

**Trigger:** Push a `develop` ✓

**Acciones:**
```yaml
- Descargar imagen Docker
- Ejecutar health checks
- Migrar base de datos
- Iniciar servicios
- Validar endpoints
- Crear comentario en PR (si existe)
```

**Ambiente:** Staging

**Validaciones:**
- Health check `/health` → 200 OK
- APIs accesibles
- BD sincronizada

### 6. DEPLOY A PRODUCCIÓN (deploy-production)

**Trigger:** Push a `main` ✓

**Estrategia:** Blue-Green Deployment

**Acciones:**
```yaml
1. Preparar ambiente "Green" (nueva versión)
2. Descargar imagen Docker
3. Ejecutar tests en Green
4. Validar health checks
5. Switch traffic main → Green
6. Monitorear métricas
7. Fallback a Blue si hay problemas
```

**Proceso:**
```
Blue (actual)    Green (nuevo)
    ↑               ↓
    └─── Load Balancer ───┘
         (switch automático)
```

**Beneficios:**
- ✅ Zero downtime
- ✅ Rollback instantáneo
- ✅ Testing en vivo
- ✅ Riesgo minimizado

### 7. NOTIFICACIONES (notify)

**Ejecución:** Siempre (if: always())

**Salida:**
```
=== RESUMEN DEL PIPELINE ===
Repositorio: ...
Rama: main/develop
Commit: abc123def456...
Autor: usuario
Fecha: 2026-02-02 10:30:00 UTC

Estados de Jobs:
✓ Tests: success
✓ Build: success
✓ Security: success
✓ Docker: success
✓ Deploy: success

Ver detalles: https://github.com/.../actions/runs/123456
```

## Configuración

### Variables de Entorno (Secrets)

Configurar en GitHub Settings → Secrets and variables:

```
DOCKER_REGISTRY_TOKEN    # Token para push a Docker registry
DB_HOST_STAGING          # Host BD staging
DB_PASSWORD_STAGING      # Password BD staging
DB_HOST_PRODUCTION       # Host BD producción
DB_PASSWORD_PRODUCTION   # Password BD producción
SLACK_WEBHOOK            # Para notificaciones Slack (opcional)
```

### Permisos Requeridos

Crear workflow permissions en `.github/workflows/ci-cd.yml`:

```yaml
permissions:
  contents: read           # Leer código
  packages: write          # Push Docker images
  pull-requests: write     # Comentar PRs
  checks: write            # Crear reportes
```

## Monitoreo y Logs

### Ver logs del pipeline

1. **GitHub UI:**
   - Actions tab → Workflow run → Job → Logs

2. **Localmente:**
   ```bash
   # Ver último workflow
   gh run view
   
   # Ver logs
   gh run view 123456 --log
   ```

### Fallos Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `npm ERR! code ERESOLVE` | Dependencias incompatibles | `npm ci --legacy-peer-deps` |
| `Docker build failed` | Dockerfile error | Verificar Dockerfile localmente |
| `Tests failed` | Código no cumple tests | Ejecutar `npm test` localmente |
| `Registry auth failed` | Token expirado | Rotar secrets |
| `Deployment timeout` | Health check falla | Revisar logs del contenedor |

## Métricas y Alertas

### Métricas que se rastrean

- **Test Coverage:** Codecov
- **Build Time:** GitHub Actions logs
- **Docker Image Size:** Registry metadata
- **Deployment Success Rate:** GitHub Actions history
- **Security Vulnerabilities:** GitHub Code Scanning

### Alertas Configuradas

- ❌ Tests fallan → Notificar a autores
- ❌ Build fallido → Bloquear merge
- ⚠️ Vulnerabilidades críticas → Crear issue
- ✓ Deploy exitoso → Crear deployment record

## Scripts Útiles

### Ejecución Local (simulando CI)

```bash
# Instalar dependencias
npm install

# Ejecutar linter
npm run lint

# Ejecutar tests
npm test -- --coverage

# Compilar TypeScript
npm run build

# Compilar Docker localmente
docker build -t carnaval-logistics:local .

# Ejecutar imagen local
docker run -p 3000:3000 carnaval-logistics:local

# Verificar health
curl http://localhost:3000/health
```

### Actualizar Pipeline

```bash
# Ver todos los workflows
gh workflow list

# Deshabilitar workflow
gh workflow disable ci-cd.yml

# Ejecutar workflow manualmente
gh workflow run ci-cd.yml
```

## Best Practices

### ✅ Recomendaciones

1. **Commits atomizados:**
   - Un cambio = un commit
   - Mensajes descriptivos

2. **PRs antes de merge:**
   - Mínimo 1 review
   - Tests deben pasar

3. **Versionado semántico:**
   - Tags: `v1.2.3`
   - Auto-trigger releases

4. **Environment secrets:**
   - Nunca commitear credenciales
   - Usar GitHub Secrets

5. **Monitoreo post-deploy:**
   - Revisar logs de producción
   - Monitorear performance

### ❌ Evitar

- Merging directamente sin tests
- Secrets en variables visibles
- Cambios grandes en un PR
- Ignorar warnings de seguridad

## Troubleshooting

### Pipeline tarda mucho

**Causa:** Muchos jobs en paralelo
**Solución:** Revisar matrix, optimizar dependencies

### Docker build fallido

**Causa:** Archivo no existe
**Solución:**
```bash
npm run build  # Generar dist/
git add dist/
git commit -m "Update dist"
```

### Deploy a producción no dispara

**Causa:** Branch no es 'main'
**Solución:**
```bash
git checkout main
git merge develop
git push origin main
```

## Roadmap Futuro

- [ ] Agregar deploy a Kubernetes
- [ ] Integrar SonarQube para análisis de código
- [ ] Agregar performance benchmarks
- [ ] Integración con Slack/Teams
- [ ] Auto-scaler basado en métricas
- [ ] Canary deployments

## Conclusión

Este pipeline garantiza:
- ✅ Calidad de código
- ✅ Seguridad
- ✅ Confiabilidad
- ✅ Despliegue automatizado
- ✅ Trazabilidad completa

Para más información, consultar la [documentación de GitHub Actions](https://docs.github.com/en/actions).
