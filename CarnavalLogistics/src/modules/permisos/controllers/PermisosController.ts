// src/modules/permisos/controllers/PermisosController.ts

import { Request, Response } from 'express';
import { PermisosService } from '../services/PermisosService';
import { PermisosValidator } from '../validators/PermisosValidator';

/**
 * Controller - Maneja peticiones HTTP para Permisos
 */
export class PermisosController {
  constructor(private permisosService: PermisosService) {}

  /**
   * POST /api/permisos/comerciantes
   * Registrar nuevo comerciante
   */
  async registrarComerciante(req: Request, res: Response): Promise<void> {
    try {
      const validation = PermisosValidator.validateComerciante(req.body);
      if (validation.error) {
        res.status(400).json({
          error: 'Validación fallida',
          detalles: validation.error.details,
        });
        return;
      }

      const { nombre, apellido, email, telefono, cedula, razonSocial } = req.body;

      const comerciante = await this.permisosService.registrarComerciante(
        nombre,
        apellido,
        email,
        telefono,
        cedula,
        razonSocial
      );

      res.status(201).json({
        mensaje: 'Comerciante registrado exitosamente',
        comerciante,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al registrar comerciante',
        detalle: error.message,
      });
    }
  }

  /**
   * GET /api/permisos/comerciantes/:id
   * Obtener información de comerciante
   */
  async obtenerComerciante(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const comerciante = await this.permisosService.obtenerComerciante(id);

      res.status(200).json(comerciante);
    } catch (error: any) {
      res.status(404).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /api/permisos/comerciantes
   * Listar todos los comerciantes
   */
  async listarComerciantes(_req: Request, res: Response): Promise<void> {
    try {
      const comerciantes = await this.permisosService.listarComerciantes();

      res.status(200).json({
        total: comerciantes.length,
        comerciantes,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al listar comerciantes',
        detalle: error.message,
      });
    }
  }

  /**
   * POST /api/permisos/solicitudes
   * Crear solicitud de permiso
   */
  async crearSolicitud(req: Request, res: Response): Promise<void> {
    try {
      const validation = PermisosValidator.validateSolicitudPermiso(req.body);
      if (validation.error) {
        res.status(400).json({
          error: 'Validación fallida',
          detalles: validation.error.details,
        });
        return;
      }

      const {
        comercianteId,
        tipoProducto,
        descripcion,
        fechaInicio,
        fechaFin,
        ubicacionSolicitada,
        areaMetrosCuadrados,
        documentosAdjuntos,
      } = req.body;

      // Validar disponibilidad de ubicación
      const disponible = await this.permisosService.validarUbicacionDisponible(
        ubicacionSolicitada,
        new Date(fechaInicio),
        new Date(fechaFin)
      );

      if (!disponible) {
        res.status(409).json({
          error: 'Ubicación no disponible para las fechas solicitadas',
        });
        return;
      }

      const solicitud = await this.permisosService.crearSolicitud(
        comercianteId,
        tipoProducto,
        descripcion,
        new Date(fechaInicio),
        new Date(fechaFin),
        ubicacionSolicitada,
        areaMetrosCuadrados,
        documentosAdjuntos
      );

      res.status(201).json({
        mensaje: 'Solicitud creada exitosamente',
        solicitud,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /api/permisos/solicitudes/comerciante/:comercianteId
   * Obtener solicitudes de un comerciante
   */
  async obtenerSolicitudesComerciante(req: Request, res: Response): Promise<void> {
    try {
      const { comercianteId } = req.params;
      const solicitudes = await this.permisosService.obtenerSolicitudesComerciante(
        comercianteId
      );

      res.status(200).json({
        comercianteId,
        total: solicitudes.length,
        solicitudes,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /api/permisos/solicitudes/pendientes
   * Obtener solicitudes pendientes de aprobación
   */
  async obtenerSolicitudesPendientes(_req: Request, res: Response): Promise<void> {
    try {
      const solicitudes = await this.permisosService.obtenerSolicitudesPendientes();

      res.status(200).json({
        total: solicitudes.length,
        solicitudes,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * POST /api/permisos/solicitudes/:id/aprobar
   * Aprobar una solicitud
   */
  async aprobarSolicitud(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { aprobadoPor, condiciones } = req.body;

      const aprobacion = await this.permisosService.aprobarSolicitud(
        id,
        aprobadoPor,
        condiciones
      );

      res.status(200).json({
        mensaje: 'Solicitud aprobada',
        aprobacion,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * POST /api/permisos/solicitudes/:id/rechazar
   * Rechazar una solicitud
   */
  async rechazarSolicitud(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { razonRechazo } = req.body;

      if (!razonRechazo) {
        res.status(400).json({
          error: 'Se requiere razón del rechazo',
        });
        return;
      }

      const solicitud = await this.permisosService.rechazarSolicitud(id, razonRechazo);

      res.status(200).json({
        mensaje: 'Solicitud rechazada',
        solicitud,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /api/permisos/estadisticas
   * Obtener estadísticas de permisos
   */
  async obtenerEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.permisosService.obtenerEstadisticas();

      res.status(200).json({
        fecha: new Date().toISOString(),
        estadisticas,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
}
