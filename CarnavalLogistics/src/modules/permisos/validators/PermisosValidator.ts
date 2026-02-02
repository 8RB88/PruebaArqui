// src/modules/permisos/validators/PermisosValidator.ts

import Joi from 'joi';

export class PermisosValidator {
  private static comercianteSchema = Joi.object({
    nombre: Joi.string().required().min(2).max(100),
    apellido: Joi.string().required().min(2).max(100),
    email: Joi.string().required().email(),
    telefono: Joi.string().required().regex(/^[0-9\-\+\s]+$/),
    cedula: Joi.string().required().min(5).max(20),
    razonSocial: Joi.string().required().min(3).max(200),
  });

  private static solicitudPermisoSchema = Joi.object({
    comercianteId: Joi.string().required().uuid(),
    tipoProducto: Joi.string()
      .required()
      .valid('alimentos', 'bebidas', 'artesanias', 'entretenimiento', 'otro'),
    descripcion: Joi.string().required().min(10).max(1000),
    fechaInicio: Joi.date().required().greater('now'),
    fechaFin: Joi.date().required().greater(Joi.ref('fechaInicio')),
    ubicacionSolicitada: Joi.string().required().min(5).max(200),
    areaMetrosCuadrados: Joi.number().required().positive().max(500),
    monto: Joi.number().required().positive(),
    documentosAdjuntos: Joi.array().items(Joi.string().uri()).optional(),
  });

  static validateComerciante(data: any) {
    return this.comercianteSchema.validate(data, { abortEarly: false });
  }

  static validateSolicitudPermiso(data: any) {
    return this.solicitudPermisoSchema.validate(data, { abortEarly: false });
  }

  static validateFechasNoSolapadas(
    fechaInicio: Date,
    fechaFin: Date,
    fechasExistentes: Array<{ inicio: Date; fin: Date }>
  ): boolean {
    for (const existente of fechasExistentes) {
      if (!(fechaFin < existente.inicio || fechaInicio > existente.fin)) {
        return false; // Hay solapamiento
      }
    }
    return true;
  }
}
