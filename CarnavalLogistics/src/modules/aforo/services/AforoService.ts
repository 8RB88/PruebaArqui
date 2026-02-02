// src/modules/aforo/services/AforoService.ts

import { v4 as uuidv4 } from 'uuid';
import { IAforoRepository } from '../repositories/AforoRepository';
import { Recinto, OcupacionActual, AforoAlert, ConfiguracionAforo } from '../models/Recinto';
import { EventEmitter } from 'events';

/**
 * Service Layer - Contiene toda la lógica de negocio para Aforo
 * Completamente independiente del módulo de Permisos
 */
export class AforoService {
  private configuracion: ConfiguracionAforo = {
    umbralCritico: 90,
    umbralAdvertencia: 75,
    umbralBajo: 20,
  };

  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(private repository: IAforoRepository) {}

  /**
   * Crear un nuevo recinto público
   */
  async crearRecinto(
    nombre: string,
    ubicacion: string,
    capacidadMaxima: number,
    tipoRecinto: 'plaza' | 'parque' | 'estadio' | 'auditorio',
    descripcion?: string
  ): Promise<Recinto> {
    const recinto: Recinto = {
      id: uuidv4(),
      nombre,
      ubicacion,
      capacidadMaxima,
      tipoRecinto,
      estado: 'activo',
      descripcion,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const recintoCreado = await this.repository.crearRecinto(recinto);
    this.eventEmitter.emit('recinto:creado', recintoCreado);
    return recintoCreado;
  }

  /**
   * Obtener todos los recintos
   */
  async obtenerRecintos(): Promise<Recinto[]> {
    return this.repository.obtenerTodosRecintos();
  }

  /**
   * Obtener detalles de un recinto con su ocupación actual
   */
  async obtenerDetallesRecinto(recintoId: string): Promise<{
    recinto: Recinto;
    ocupacion: OcupacionActual;
  }> {
    const recinto = await this.repository.obtenerRecinto(recintoId);
    if (!recinto) {
      throw new Error(`Recinto ${recintoId} no encontrado`);
    }

    const ocupacion = await this.repository.obtenerOcupacionActual(recintoId);
    if (!ocupacion) {
      throw new Error(`Ocupación del recinto ${recintoId} no encontrada`);
    }

    return { recinto, ocupacion };
  }

  /**
   * Actualizar la ocupación de un recinto
   * Aquí es donde se generan las alertas si se cumplen condiciones
   */
  async actualizarOcupacion(recintoId: string, nuevaOcupacion: number): Promise<OcupacionActual> {
    const recinto = await this.repository.obtenerRecinto(recintoId);
    if (!recinto) {
      throw new Error(`Recinto ${recintoId} no encontrado`);
    }

    // Validar que no exceda capacidad
    if (nuevaOcupacion > recinto.capacidadMaxima) {
      throw new Error(
        `Ocupación (${nuevaOcupacion}) excede capacidad máxima (${recinto.capacidadMaxima})`
      );
    }

    const ocupacion = await this.repository.actualizarOcupacion(
      recintoId,
      nuevaOcupacion
    );

    // Verificar si se debe generar una alerta
    await this.verificarYGenerarAlertas(recinto, ocupacion);

    return ocupacion;
  }

  /**
   * Incrementar ocupación (personas entrando)
   */
  async registrarEntrada(
    recintoId: string,
    cantidad: number = 1
  ): Promise<OcupacionActual> {
    const recinto = await this.repository.obtenerRecinto(recintoId);
    if (!recinto) {
      throw new Error(`Recinto ${recintoId} no encontrado`);
    }

    const ocupacionActual = await this.repository.obtenerOcupacionActual(recintoId);
    if (!ocupacionActual) {
      throw new Error(`Ocupación del recinto ${recintoId} no encontrada`);
    }

    const nuevaOcupacion = ocupacionActual.ocupacionActual + cantidad;

    if (nuevaOcupacion > recinto.capacidadMaxima) {
      throw new Error(
        `No se puede ingresar: capacidad máxima alcanzada (${recinto.capacidadMaxima})`
      );
    }

    return this.actualizarOcupacion(recintoId, nuevaOcupacion);
  }

  /**
   * Decrementar ocupación (personas saliendo)
   */
  async registrarSalida(
    recintoId: string,
    cantidad: number = 1
  ): Promise<OcupacionActual> {
    const ocupacionActual = await this.repository.obtenerOcupacionActual(recintoId);
    if (!ocupacionActual) {
      throw new Error(`Ocupación del recinto ${recintoId} no encontrada`);
    }

    const nuevaOcupacion = Math.max(0, ocupacionActual.ocupacionActual - cantidad);
    return this.actualizarOcupacion(recintoId, nuevaOcupacion);
  }

  /**
   * Obtener estado actual de ocupación
   */
  async obtenerEstadoOcupacion(recintoId: string): Promise<{
    recinto: Recinto;
    ocupacion: OcupacionActual;
    estado: 'normal' | 'advertencia' | 'critico' | 'bajo';
  }> {
    const { recinto, ocupacion } = await this.obtenerDetallesRecinto(recintoId);

    let estado: 'normal' | 'advertencia' | 'critico' | 'bajo' = 'normal';
    if (ocupacion.porcentajeOcupacion >= this.configuracion.umbralCritico) {
      estado = 'critico';
    } else if (ocupacion.porcentajeOcupacion >= this.configuracion.umbralAdvertencia) {
      estado = 'advertencia';
    } else if (ocupacion.porcentajeOcupacion <= this.configuracion.umbralBajo) {
      estado = 'bajo';
    }

    return { recinto, ocupacion, estado };
  }

  /**
   * Obtener todas las alertas activas de un recinto
   */
  async obtenerAlertasRecinto(recintoId: string): Promise<AforoAlert[]> {
    return this.repository.obtenerAlertasActivas(recintoId);
  }

  /**
   * Lógica privada: Verificar y generar alertas basado en porcentaje de ocupación
   */
  private async verificarYGenerarAlertas(
    recinto: Recinto,
    ocupacion: OcupacionActual
  ): Promise<void> {
    const porcentaje = ocupacion.porcentajeOcupacion;

    let alerta: AforoAlert | null = null;

    if (porcentaje >= this.configuracion.umbralCritico) {
      alerta = {
        id: uuidv4(),
        recintoId: recinto.id,
        tipo: 'capacidad_critica',
        porcentajeOcupacion: porcentaje,
        timestamp: new Date(),
        procesada: false,
      };
    } else if (porcentaje >= this.configuracion.umbralAdvertencia) {
      alerta = {
        id: uuidv4(),
        recintoId: recinto.id,
        tipo: 'capacidad_advertencia',
        porcentajeOcupacion: porcentaje,
        timestamp: new Date(),
        procesada: false,
      };
    } else if (porcentaje <= this.configuracion.umbralBajo) {
      alerta = {
        id: uuidv4(),
        recintoId: recinto.id,
        tipo: 'bajo_aforo',
        porcentajeOcupacion: porcentaje,
        timestamp: new Date(),
        procesada: false,
      };
    }

    if (alerta) {
      await this.repository.crearAlerta(alerta);
      // Publicar evento para otros módulos (ej: Permisos)
      this.eventEmitter.emit('alerta:generada', {
        recintoId: recinto.id,
        tipoAlerta: alerta.tipo,
        porcentaje,
      });
    }
  }

  /**
   * Obtener configuración de umbrales
   */
  getConfiguracion(): ConfiguracionAforo {
    return this.configuracion;
  }

  /**
   * Actualizar configuración de umbrales (administrador)
   */
  updateConfiguracion(nuevaConfig: Partial<ConfiguracionAforo>): void {
    this.configuracion = { ...this.configuracion, ...nuevaConfig };
  }

  /**
   * Suscribirse a eventos del servicio
   */
  onAlert(callback: (event: any) => void): void {
    this.eventEmitter.on('alerta:generada', callback);
  }

  /**
   * Generar reporte de ocupación
   */
  async generarReporteOcupacion(): Promise<any[]> {
    const recintos = await this.repository.obtenerTodosRecintos();
    const reportes = [];

    for (const recinto of recintos) {
      const ocupacion = await this.repository.obtenerOcupacionActual(recinto.id);
      if (ocupacion) {
        reportes.push({
          recintoId: recinto.id,
          nombreRecinto: recinto.nombre,
          tipo: recinto.tipoRecinto,
          capacidadMaxima: recinto.capacidadMaxima,
          ocupacionActual: ocupacion.ocupacionActual,
          porcentajeOcupacion: ocupacion.porcentajeOcupacion,
          estado: this.obtenerEstadoBasadoEnPorcentaje(ocupacion.porcentajeOcupacion),
        });
      }
    }

    return reportes;
  }

  private obtenerEstadoBasadoEnPorcentaje(
    porcentaje: number
  ): 'normal' | 'advertencia' | 'critico' | 'bajo' {
    if (porcentaje >= this.configuracion.umbralCritico) return 'critico';
    if (porcentaje >= this.configuracion.umbralAdvertencia) return 'advertencia';
    if (porcentaje <= this.configuracion.umbralBajo) return 'bajo';
    return 'normal';
  }
}
