// src/modules/aforo/controllers/AforoController.ts

import { Request, Response } from 'express';
import { AforoService } from '../services/AforoService';
import { AforoValidator } from '../validators/AforoValidator';

/**
 * Controller - Maneja las peticiones HTTP
 * Delega la lógica al Service
 */
export class AforoController {
  constructor(private aforoService: AforoService) {}

  /**
   * POST /api/aforo/recintos
   * Crear un nuevo recinto
   */
  async crearRecinto(req: Request, res: Response): Promise<void> {
    try {
      const validation = AforoValidator.validateRecintoCreation(req.body);
      if (validation.error) {
        res.status(400).json({
          error: 'Validación fallida',
          detalles: validation.error.details.map((d) => ({
            campo: d.context?.key,
            mensaje: d.message,
          })),
        });
        return;
      }

      const { nombre, ubicacion, capacidadMaxima, tipoRecinto, descripcion } =
        req.body;

      const recinto = await this.aforoService.crearRecinto(
        nombre,
        ubicacion,
        capacidadMaxima,
        tipoRecinto,
        descripcion
      );

      res.status(201).json({
        mensaje: 'Recinto creado exitosamente',
        recinto,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al crear recinto',
        detalle: error.message,
      });
    }
  }

  /**
   * GET /api/aforo/recintos
   * Obtener todos los recintos
   */
  async obtenerRecintos(_req: Request, res: Response): Promise<void> {
    try {
      const recintos = await this.aforoService.obtenerRecintos();
      res.status(200).json({
        total: recintos.length,
        recintos,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al obtener recintos',
        detalle: error.message,
      });
    }
  }

  /**
   * GET /api/aforo/recintos/:id
   * Obtener detalles de un recinto
   */
  async obtenerRecinto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resultado = await this.aforoService.obtenerDetallesRecinto(id);

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(404).json({
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/aforo/recintos/:id/ocupacion
   * Actualizar la ocupación de un recinto
   */
  async actualizarOcupacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { ocupacion } = req.body;

      if (!Number.isInteger(ocupacion) || ocupacion < 0) {
        res.status(400).json({
          error: 'Ocupación debe ser un número entero no negativo',
        });
        return;
      }

      const ocupacionActualizada = await this.aforoService.actualizarOcupacion(
        id,
        ocupacion
      );

      res.status(200).json({
        mensaje: 'Ocupación actualizada',
        ocupacion: ocupacionActualizada,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * POST /api/aforo/recintos/:id/entrada
   * Registrar entrada de personas
   */
  async registrarEntrada(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { cantidad = 1 } = req.body;

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        res.status(400).json({
          error: 'Cantidad debe ser un número entero positivo',
        });
        return;
      }

      const ocupacion = await this.aforoService.registrarEntrada(id, cantidad);

      res.status(200).json({
        mensaje: `${cantidad} persona(s) registrada(s) como entrada`,
        ocupacion,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * POST /api/aforo/recintos/:id/salida
   * Registrar salida de personas
   */
  async registrarSalida(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { cantidad = 1 } = req.body;

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        res.status(400).json({
          error: 'Cantidad debe ser un número entero positivo',
        });
        return;
      }

      const ocupacion = await this.aforoService.registrarSalida(id, cantidad);

      res.status(200).json({
        mensaje: `${cantidad} persona(s) registrada(s) como salida`,
        ocupacion,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aforo/recintos/:id/estado
   * Obtener estado actual de un recinto
   */
  async obtenerEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const estado = await this.aforoService.obtenerEstadoOcupacion(id);

      res.status(200).json(estado);
    } catch (error: any) {
      res.status(404).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aforo/recintos/:id/alertas
   * Obtener alertas activas de un recinto
   */
  async obtenerAlertas(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alertas = await this.aforoService.obtenerAlertasRecinto(id);

      res.status(200).json({
        recintoId: id,
        total: alertas.length,
        alertas,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /api/aforo/reportes/ocupacion
   * Generar reporte de ocupación general
   */
  async generarReporte(_req: Request, res: Response): Promise<void> {
    try {
      const reportes = await this.aforoService.generarReporteOcupacion();

      res.status(200).json({
        fecha: new Date().toISOString(),
        totalRecintos: reportes.length,
        reporte: reportes,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
}
