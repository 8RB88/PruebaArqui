// src/modules/aforo/routes.ts

import { Router } from 'express';
import { AforoController } from './controllers/AforoController';
import { AforoService } from './services/AforoService';
import { AforoRepositoryMock } from './repositories/AforoRepository';

export function createAforoRoutes(): Router {
  const router = Router();

  // Inyección de dependencias
  const repository = new AforoRepositoryMock();
  const service = new AforoService(repository);
  const controller = new AforoController(service);

  // Rutas del módulo Aforo
  router.post('/recintos', (req, res) => controller.crearRecinto(req, res));
  router.get('/recintos', (req, res) => controller.obtenerRecintos(req, res));
  router.get('/recintos/:id', (req, res) => controller.obtenerRecinto(req, res));
  router.put('/recintos/:id/ocupacion', (req, res) =>
    controller.actualizarOcupacion(req, res)
  );
  router.post('/recintos/:id/entrada', (req, res) =>
    controller.registrarEntrada(req, res)
  );
  router.post('/recintos/:id/salida', (req, res) =>
    controller.registrarSalida(req, res)
  );
  router.get('/recintos/:id/estado', (req, res) =>
    controller.obtenerEstado(req, res)
  );
  router.get('/recintos/:id/alertas', (req, res) =>
    controller.obtenerAlertas(req, res)
  );
  router.get('/reportes/ocupacion', (req, res) =>
    controller.generarReporte(req, res)
  );

  return router;
}
