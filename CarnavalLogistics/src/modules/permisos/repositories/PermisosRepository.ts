// src/modules/permisos/repositories/PermisosRepository.ts

import { Comerciante, SolicitudPermiso, AprobacionPermiso } from '../models/Permiso';
import { EventEmitter } from 'events';

/**
 * Repository Pattern para Permisos
 * Completamente independiente del repositorio de Aforo
 */
export interface IPermisosRepository {
  // Comerciantes
  crearComerciante(comerciante: Comerciante): Promise<Comerciante>;
  obtenerComerciante(id: string): Promise<Comerciante | null>;
  obtenerTodosComerciantes(): Promise<Comerciante[]>;
  listarComerciantes(): Promise<Comerciante[]>;
  actualizarComerciante(
    id: string,
    comerciante: Partial<Comerciante>
  ): Promise<Comerciante>;

  // Solicitudes
  crearSolicitud(solicitud: SolicitudPermiso): Promise<SolicitudPermiso>;
  obtenerSolicitud(id: string): Promise<SolicitudPermiso | null>;
  obtenerSolicitudesComerciante(comercianteId: string): Promise<SolicitudPermiso[]>;
  obtenerSolicitudesPendientes(): Promise<SolicitudPermiso[]>;
  actualizarSolicitud(
    id: string,
    solicitud: Partial<SolicitudPermiso>
  ): Promise<SolicitudPermiso>;
  obtenerSolicitudesPorEstado(estado: string): Promise<SolicitudPermiso[]>;

  // Aprobaciones
  registrarAprobacion(aprobacion: AprobacionPermiso): Promise<AprobacionPermiso>;
  obtenerAprobacion(permisoId: string): Promise<AprobacionPermiso | null>;
}

/**
 * Implementación Mock para pruebas
 */
export class PermisosRepositoryMock implements IPermisosRepository {
  private comerciantes: Map<string, Comerciante> = new Map();
  private solicitudes: Map<string, SolicitudPermiso> = new Map();
  private aprobaciones: Map<string, AprobacionPermiso> = new Map();
  public eventEmitter: EventEmitter = new EventEmitter();

  async crearComerciante(comerciante: Comerciante): Promise<Comerciante> {
    this.comerciantes.set(comerciante.id, comerciante);
    this.eventEmitter.emit('comerciante:creado', comerciante);
    return comerciante;
  }

  async obtenerComerciante(id: string): Promise<Comerciante | null> {
    return this.comerciantes.get(id) || null;
  }

  async obtenerTodosComerciantes(): Promise<Comerciante[]> {
    return Array.from(this.comerciantes.values());
  }

  async listarComerciantes(): Promise<Comerciante[]> {
    return Array.from(this.comerciantes.values());
  }

  async actualizarComerciante(
    id: string,
    updates: Partial<Comerciante>
  ): Promise<Comerciante> {
    const comerciante = this.comerciantes.get(id);
    if (!comerciante) throw new Error('Comerciante no encontrado');

    const actualizado = { ...comerciante, ...updates };
    this.comerciantes.set(id, actualizado);
    return actualizado;
  }

  async crearSolicitud(solicitud: SolicitudPermiso): Promise<SolicitudPermiso> {
    this.solicitudes.set(solicitud.id, solicitud);
    this.eventEmitter.emit('solicitud:creada', solicitud);
    return solicitud;
  }

  async obtenerSolicitud(id: string): Promise<SolicitudPermiso | null> {
    return this.solicitudes.get(id) || null;
  }

  async obtenerSolicitudesComerciante(comercianteId: string): Promise<SolicitudPermiso[]> {
    return Array.from(this.solicitudes.values()).filter(
      (s) => s.comercianteId === comercianteId
    );
  }

  async obtenerSolicitudesPendientes(): Promise<SolicitudPermiso[]> {
    return Array.from(this.solicitudes.values()).filter((s) => s.estado === 'pendiente');
  }

  async actualizarSolicitud(
    id: string,
    updates: Partial<SolicitudPermiso>
  ): Promise<SolicitudPermiso> {
    const solicitud = this.solicitudes.get(id);
    if (!solicitud) throw new Error('Solicitud no encontrada');

    const actualizada = { ...solicitud, ...updates };
    this.solicitudes.set(id, actualizada);
    this.eventEmitter.emit('solicitud:actualizada', actualizada);
    return actualizada;
  }

  async obtenerSolicitudesPorEstado(estado: string): Promise<SolicitudPermiso[]> {
    return Array.from(this.solicitudes.values()).filter((s) => s.estado === estado);
  }

  async registrarAprobacion(aprobacion: AprobacionPermiso): Promise<AprobacionPermiso> {
    this.aprobaciones.set(aprobacion.permisoId, aprobacion);
    this.eventEmitter.emit('aprobacion:registrada', aprobacion);
    return aprobacion;
  }

  async obtenerAprobacion(permisoId: string): Promise<AprobacionPermiso | null> {
    return this.aprobaciones.get(permisoId) || null;
  }
}
