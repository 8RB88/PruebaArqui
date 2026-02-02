// src/api/app.ts

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { createAforoRoutes } from '../modules/aforo/routes';
import { createPermisosRoutes } from '../modules/permisos/routes';
import { loggingMiddleware, errorHandler, corsHeaders } from './middleware';

export function createApp(): express.Application {
  const app = express();

  // Middlewares de seguridad y utilidad
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(corsHeaders);

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware de logging
  app.use(loggingMiddleware);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CarnavalLogistics',
    });
  });

  // Info de la API
  app.get('/api', (_req, res) => {
    res.status(200).json({
      nombre: 'CarnavalLogistics API',
      version: '1.0.0',
      descripcion: 'Sistema de Gestión de Eventos Masivos',
      modulos: {
        aforo: '/api/aforo',
        permisos: '/api/permisos',
      },
      endpoints: {
        aforo: [
          'POST /api/aforo/recintos - Crear recinto',
          'GET /api/aforo/recintos - Listar recintos',
          'GET /api/aforo/recintos/:id - Obtener recinto',
          'POST /api/aforo/recintos/:id/entrada - Registrar entrada',
          'POST /api/aforo/recintos/:id/salida - Registrar salida',
          'GET /api/aforo/reportes/ocupacion - Reporte general',
        ],
        permisos: [
          'POST /api/permisos/comerciantes - Registrar comerciante',
          'POST /api/permisos/solicitudes - Crear solicitud de permiso',
          'GET /api/permisos/solicitudes/pendientes - Ver solicitudes pendientes',
          'POST /api/permisos/solicitudes/:id/aprobar - Aprobar permiso',
          'GET /api/permisos/estadisticas - Ver estadísticas',
        ],
      },
    });
  });

  // Rutas de módulos
  app.use('/api/aforo', createAforoRoutes());
  app.use('/api/permisos', createPermisosRoutes());

  // Ruta 404
  app.use((req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.path,
      metodo: req.method,
    });
  });

  // Manejador de errores global
  app.use(errorHandler);

  return app;
}
