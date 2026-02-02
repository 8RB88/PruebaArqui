// src/modules/permisos/routes.ts

import { Router } from 'express';
import { PermisosController } from './controllers/PermisosController';
import { PermisosService } from './services/PermisosService';
import { PermisosRepositoryMock } from './repositories/PermisosRepository';

export function createPermisosRoutes(): Router {
  const router = Router();

  // Inyección de dependencias
  const repository = new PermisosRepositoryMock();
  const service = new PermisosService(repository);
  const controller = new PermisosController(service);

  // Rutas del módulo Permisos
  router.post('/comerciantes', (req, res) =>
    controller.registrarComerciante(req, res)
  );
  router.get('/comerciantes/:id', (req, res) =>
    controller.obtenerComerciante(req, res)
  );
  router.post('/solicitudes', (req, res) =>
    controller.crearSolicitud(req, res)
  );
  router.get('/solicitudes/comerciante/:comercianteId', (req, res) =>
    controller.obtenerSolicitudesComerciante(req, res)
  );
  router.get('/solicitudes/pendientes', (req, res) =>
    controller.obtenerSolicitudesPendientes(req, res)
  );
  router.post('/solicitudes/:id/aprobar', (req, res) =>
    controller.aprobarSolicitud(req, res)
  );
  router.post('/solicitudes/:id/rechazar', (req, res) =>
    controller.rechazarSolicitud(req, res)
  );
  router.get('/estadisticas', (req, res) =>
    controller.obtenerEstadisticas(req, res)
  );

  return router;
}
