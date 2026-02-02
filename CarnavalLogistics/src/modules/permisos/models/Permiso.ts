// src/modules/permisos/models/Permiso.ts

export interface Comerciante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cedula: string;
  razonSocial: string;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  createdAt: Date;
}

export interface SolicitudPermiso {
  id: string;
  comercianteId: string;
  tipoProducto: 'alimentos' | 'bebidas' | 'artesanias' | 'entretenimiento' | 'otro';
  descripcion: string;
  fechaSolicitud: Date;
  fechaInicio: Date;
  fechaFin: Date;
  ubicacionSolicitada: string;
  areaMetrosCuadrados: number;
  monto: number; // Tarifa por el permiso
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  razonRechazo?: string;
  fechaAprobacion?: Date;
  documentosAdjuntos: string[]; // URLs de documentos
}

export interface AprobacionPermiso {
  permisoId: string;
  comercianteId: string;
  aprobadoPor: string; // ID del funcionario
  fechaAprobacion: Date;
  condiciones?: string[];
  numeroPermiso: string;
}

export interface EstadisticasPermisos {
  totalSolicitudes: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
  canceladas: number;
  ingresoTotal: number;
}
