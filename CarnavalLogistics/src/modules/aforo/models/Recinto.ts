// src/modules/aforo/models/Recinto.ts

export interface Recinto {
  id: string;
  nombre: string;
  ubicacion: string;
  capacidadMaxima: number;
  tipoRecinto: 'plaza' | 'parque' | 'estadio' | 'auditorio';
  estado: 'activo' | 'mantenimiento' | 'cerrado';
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OcupacionActual {
  recintoId: string;
  ocupacionActual: number;
  porcentajeOcupacion: number;
  ultimaActualizacion: Date;
  alertaEmitida: boolean;
}

export interface AforoAlert {
  id: string;
  recintoId: string;
  tipo: 'capacidad_critica' | 'capacidad_advertencia' | 'bajo_aforo';
  porcentajeOcupacion: number;
  timestamp: Date;
  procesada: boolean;
}

export interface ConfiguracionAforo {
  umbralCritico: number; // 90%
  umbralAdvertencia: number; // 75%
  umbralBajo: number; // 20%
}
