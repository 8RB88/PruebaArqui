// src/modules/aforo/repositories/AforoRepository.ts

import { Recinto, OcupacionActual, AforoAlert } from '../models/Recinto';
import { EventEmitter } from 'events';

/**
 * Repository Pattern - Abstrae la persistencia de datos del módulo Aforo
 * Puede ser implementado con PostgreSQL, MongoDB, etc. sin afectar los services
 */
export interface IAforoRepository {
  // Recintos
  crearRecinto(recinto: Recinto): Promise<Recinto>;
  obtenerRecinto(id: string): Promise<Recinto | null>;
  obtenerTodosRecintos(): Promise<Recinto[]>;
  actualizarRecinto(id: string, recinto: Partial<Recinto>): Promise<Recinto>;
  eliminarRecinto(id: string): Promise<boolean>;

  // Ocupación
  obtenerOcupacionActual(recintoId: string): Promise<OcupacionActual | null>;
  actualizarOcupacion(
    recintoId: string,
    ocupacion: number
  ): Promise<OcupacionActual>;
  incrementarOcupacion(recintoId: string, cantidad: number): Promise<OcupacionActual>;
  decrementarOcupacion(recintoId: string, cantidad: number): Promise<OcupacionActual>;

  // Alertas
  crearAlerta(alerta: AforoAlert): Promise<AforoAlert>;
  obtenerAlertasActivas(recintoId: string): Promise<AforoAlert[]>;
  marcarAlertaProcesada(alertaId: string): Promise<void>;
}

/**
 * Implementación Mock - Simula una base de datos en memoria
 * En producción, se reemplazaría con una conexión a PostgreSQL
 */
export class AforoRepositoryMock implements IAforoRepository {
  private recintos: Map<string, Recinto> = new Map();
  private ocupaciones: Map<string, OcupacionActual> = new Map();
  private alertas: Map<string, AforoAlert> = new Map();
  public eventEmitter: EventEmitter = new EventEmitter();

  async crearRecinto(recinto: Recinto): Promise<Recinto> {
    this.recintos.set(recinto.id, recinto);
    // Inicializar ocupación en 0
    this.ocupaciones.set(recinto.id, {
      recintoId: recinto.id,
      ocupacionActual: 0,
      porcentajeOcupacion: 0,
      ultimaActualizacion: new Date(),
      alertaEmitida: false,
    });
    return recinto;
  }

  async obtenerRecinto(id: string): Promise<Recinto | null> {
    return this.recintos.get(id) || null;
  }

  async obtenerTodosRecintos(): Promise<Recinto[]> {
    return Array.from(this.recintos.values());
  }

  async actualizarRecinto(id: string, updates: Partial<Recinto>): Promise<Recinto> {
    const recinto = this.recintos.get(id);
    if (!recinto) throw new Error('Recinto no encontrado');
    const actualizado = { ...recinto, ...updates, updatedAt: new Date() };
    this.recintos.set(id, actualizado);
    return actualizado;
  }

  async eliminarRecinto(id: string): Promise<boolean> {
    return this.recintos.delete(id);
  }

  async obtenerOcupacionActual(recintoId: string): Promise<OcupacionActual | null> {
    return this.ocupaciones.get(recintoId) || null;
  }

  async actualizarOcupacion(
    recintoId: string,
    ocupacion: number
  ): Promise<OcupacionActual> {
    const recinto = this.recintos.get(recintoId);
    if (!recinto) throw new Error('Recinto no encontrado');

    const porcentaje = (ocupacion / recinto.capacidadMaxima) * 100;
    const ocupacionActual: OcupacionActual = {
      recintoId,
      ocupacionActual: ocupacion,
      porcentajeOcupacion: Math.round(porcentaje * 100) / 100,
      ultimaActualizacion: new Date(),
      alertaEmitida: false,
    };

    this.ocupaciones.set(recintoId, ocupacionActual);
    this.eventEmitter.emit('ocupacion:actualizada', ocupacionActual);
    return ocupacionActual;
  }

  async incrementarOcupacion(
    recintoId: string,
    cantidad: number
  ): Promise<OcupacionActual> {
    const ocupacionActual = this.ocupaciones.get(recintoId);
    if (!ocupacionActual) throw new Error('Ocupación no encontrada');

    const nuevaOcupacion = ocupacionActual.ocupacionActual + cantidad;
    return this.actualizarOcupacion(recintoId, nuevaOcupacion);
  }

  async decrementarOcupacion(
    recintoId: string,
    cantidad: number
  ): Promise<OcupacionActual> {
    const ocupacionActual = this.ocupaciones.get(recintoId);
    if (!ocupacionActual) throw new Error('Ocupación no encontrada');

    const nuevaOcupacion = Math.max(0, ocupacionActual.ocupacionActual - cantidad);
    return this.actualizarOcupacion(recintoId, nuevaOcupacion);
  }

  async crearAlerta(alerta: AforoAlert): Promise<AforoAlert> {
    this.alertas.set(alerta.id, alerta);
    this.eventEmitter.emit('alerta:creada', alerta);
    return alerta;
  }

  async obtenerAlertasActivas(recintoId: string): Promise<AforoAlert[]> {
    return Array.from(this.alertas.values()).filter(
      (a) => a.recintoId === recintoId && !a.procesada
    );
  }

  async marcarAlertaProcesada(alertaId: string): Promise<void> {
    const alerta = this.alertas.get(alertaId);
    if (alerta) {
      alerta.procesada = true;
    }
  }
}
