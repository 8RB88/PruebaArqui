// src/modules/permisos/services/PermisosService.ts

import { v4 as uuidv4 } from 'uuid';
import { IPermisosRepository } from '../repositories/PermisosRepository';
import { Comerciante, SolicitudPermiso, AprobacionPermiso, EstadisticasPermisos } from '../models/Permiso';
import { EventEmitter } from 'events';

/**
 * Service Layer - Lógica de negocio del módulo Permisos
 * COMPLETAMENTE INDEPENDIENTE del módulo Aforo
 */
export class PermisosService {
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(private repository: IPermisosRepository) {}

  /**
   * Registrar un nuevo comerciante
   */
  async registrarComerciante(
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    cedula: string,
    razonSocial: string
  ): Promise<Comerciante> {
    const comerciante: Comerciante = {
      id: uuidv4(),
      nombre,
      apellido,
      email,
      telefono,
      cedula,
      razonSocial,
      estado: 'activo',
      createdAt: new Date(),
    };

    const comercianteCreado = await this.repository.crearComerciante(comerciante);
    return comercianteCreado;
  }

  /**
   * Obtener información de un comerciante
   */
  async obtenerComerciante(id: string): Promise<Comerciante> {
    const comerciante = await this.repository.obtenerComerciante(id);
    if (!comerciante) {
      throw new Error(`Comerciante ${id} no encontrado`);
    }
    return comerciante;
  }

  /**
   * Crear solicitud de permiso
   */
  async crearSolicitud(
    comercianteId: string,
    tipoProducto: 'alimentos' | 'bebidas' | 'artesanias' | 'entretenimiento' | 'otro',
    descripcion: string,
    fechaInicio: Date,
    fechaFin: Date,
    ubicacionSolicitada: string,
    areaMetrosCuadrados: number,
    documentosAdjuntos?: string[]
  ): Promise<SolicitudPermiso> {
    // Validar que el comerciante exista
    const comerciante = await this.repository.obtenerComerciante(comercianteId);
    if (!comerciante) {
      throw new Error(`Comerciante ${comercianteId} no encontrado`);
    }

    // Validar que el comerciante no esté bloqueado
    if (comerciante.estado === 'bloqueado') {
      throw new Error('Comerciante bloqueado: no puede solicitar permisos');
    }

    // Calcular tarifa basada en tipo de producto y área
    const tarifaBase = this.calcularTarifa(tipoProducto, areaMetrosCuadrados);

    const solicitud: SolicitudPermiso = {
      id: uuidv4(),
      comercianteId,
      tipoProducto,
      descripcion,
      fechaSolicitud: new Date(),
      fechaInicio,
      fechaFin,
      ubicacionSolicitada,
      areaMetrosCuadrados,
      monto: tarifaBase,
      estado: 'pendiente',
      documentosAdjuntos: documentosAdjuntos || [],
    };

    const solicitudCreada = await this.repository.crearSolicitud(solicitud);
    this.eventEmitter.emit('solicitud:creada', {
      solicitudId: solicitudCreada.id,
      comercianteId,
      estado: 'pendiente',
    });

    return solicitudCreada;
  }

  /**
   * Obtener solicitudes de un comerciante
   */
  async obtenerSolicitudesComerciante(comercianteId: string): Promise<SolicitudPermiso[]> {
    return this.repository.obtenerSolicitudesComerciante(comercianteId);
  }

  /**
   * Obtener todas las solicitudes pendientes de aprobación
   */
  async obtenerSolicitudesPendientes(): Promise<SolicitudPermiso[]> {
    return this.repository.obtenerSolicitudesPendientes();
  }

  /**
   * Aprobar una solicitud de permiso
   */
  async aprobarSolicitud(
    solicitudId: string,
    aprobadoPor: string,
    condiciones?: string[]
  ): Promise<AprobacionPermiso> {
    const solicitud = await this.repository.obtenerSolicitud(solicitudId);
    if (!solicitud) {
      throw new Error(`Solicitud ${solicitudId} no encontrada`);
    }

    if (solicitud.estado !== 'pendiente') {
      throw new Error(`Solicitud ya fue ${solicitud.estado}`);
    }

    const numeroPermiso = this.generarNumeroPermiso();
    const aprobacion: AprobacionPermiso = {
      permisoId: solicitudId,
      comercianteId: solicitud.comercianteId,
      aprobadoPor,
      fechaAprobacion: new Date(),
      numeroPermiso,
      condiciones,
    };

    // Actualizar estado de la solicitud
    await this.repository.actualizarSolicitud(solicitudId, {
      estado: 'aprobado',
      fechaAprobacion: new Date(),
    });

    // Registrar aprobación
    const aprobacionRegistrada = await this.repository.registrarAprobacion(aprobacion);

    this.eventEmitter.emit('solicitud:aprobada', {
      solicitudId,
      comercianteId: solicitud.comercianteId,
      numeroPermiso,
      monto: solicitud.monto,
    });

    return aprobacionRegistrada;
  }

  /**
   * Rechazar una solicitud de permiso
   */
  async rechazarSolicitud(
    solicitudId: string,
    razonRechazo: string
  ): Promise<SolicitudPermiso> {
    const solicitud = await this.repository.obtenerSolicitud(solicitudId);
    if (!solicitud) {
      throw new Error(`Solicitud ${solicitudId} no encontrada`);
    }

    if (solicitud.estado !== 'pendiente') {
      throw new Error(`Solicitud no se puede rechazar en estado: ${solicitud.estado}`);
    }

    const solicitudRechazada = await this.repository.actualizarSolicitud(solicitudId, {
      estado: 'rechazado',
      razonRechazo,
    });

    this.eventEmitter.emit('solicitud:rechazada', {
      solicitudId,
      comercianteId: solicitud.comercianteId,
      razon: razonRechazo,
    });

    return solicitudRechazada;
  }

  /**
   * Cancelar una solicitud
   */
  async cancelarSolicitud(solicitudId: string): Promise<SolicitudPermiso> {
    const solicitud = await this.repository.obtenerSolicitud(solicitudId);
    if (!solicitud) {
      throw new Error(`Solicitud ${solicitudId} no encontrada`);
    }

    const solicitudCancelada = await this.repository.actualizarSolicitud(
      solicitudId,
      {
        estado: 'cancelado',
      }
    );

    this.eventEmitter.emit('solicitud:cancelada', {
      solicitudId,
      comercianteId: solicitud.comercianteId,
    });

    return solicitudCancelada;
  }

  /**
   * Obtener estadísticas de permisos
   */
  async obtenerEstadisticas(): Promise<EstadisticasPermisos> {
    const aprobadas = await this.repository.obtenerSolicitudesPorEstado('aprobado');
    const rechazadas = await this.repository.obtenerSolicitudesPorEstado('rechazado');
    const pendientes = await this.repository.obtenerSolicitudesPendientes();

    const solicitudesCanceladas = await this.repository.obtenerSolicitudesPorEstado('cancelado');

    // Contar todos
    const solicitudes = [
      ...(await this.repository.obtenerSolicitudesPendientes()),
      ...aprobadas,
      ...rechazadas,
      ...solicitudesCanceladas,
    ];

    const ingresoTotal = aprobadas.reduce((sum, s) => sum + s.monto, 0);

    return {
      totalSolicitudes: solicitudes.length,
      aprobadas: aprobadas.length,
      rechazadas: rechazadas.length,
      pendientes: pendientes.length,
      canceladas: solicitudesCanceladas.length,
      ingresoTotal,
    };
  }

  /**
   * Bloquear comerciante (por incumplimiento)
   */
  async bloquearComerciante(comercianteId: string): Promise<void> {
    await this.repository.actualizarComerciante(comercianteId, {
      estado: 'bloqueado',
    });

    this.eventEmitter.emit('comerciante:bloqueado', {
      comercianteId,
      fecha: new Date(),
    });
  }

  /**
   * Validar disponibilidad de ubicación
   */
  async validarUbicacionDisponible(
    ubicacion: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<boolean> {
    // Obtener todas las solicitudes aprobadas
    const solicitudesAprobadas = await this.repository.obtenerSolicitudesPorEstado('aprobado');

    // Verificar si hay solapamiento en la misma ubicación
    for (const solicitud of solicitudesAprobadas) {
      if (
        solicitud.ubicacionSolicitada === ubicacion &&
        !(fechaFin < solicitud.fechaInicio || fechaInicio > solicitud.fechaFin)
      ) {
        return false; // Hay conflicto de ubicación
      }
    }

    return true;
  }

  /**
   * Calcular tarifa basada en tipo de producto y área
   */
  private calcularTarifa(tipoProducto: string, areaMetrosCuadrados: number): number {
    const tarifasBase: Record<string, number> = {
      alimentos: 50, // $50 por m²
      bebidas: 40,
      artesanias: 30,
      entretenimiento: 60,
      otro: 25,
    };

    const tarifaPorMetro = tarifasBase[tipoProducto] || 25;
    const tarifa = tarifaPorMetro * areaMetrosCuadrados;

    // Aplicar descuentos por volumen
    if (areaMetrosCuadrados > 100) {
      return tarifa * 0.9; // 10% descuento
    }

    return tarifa;
  }

  /**
   * Generar número único de permiso
   */
  private generarNumeroPermiso(): string {
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PERM-${fecha}-${aleatorio}`;
  }

  /**
   * Suscribirse a eventos
   */
  onSolicitudAprobada(callback: (event: any) => void): void {
    this.eventEmitter.on('solicitud:aprobada', callback);
  }
}
