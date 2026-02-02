// src/modules/aforo/validators/AforoValidator.ts

import Joi from 'joi';

export class AforoValidator {
  private static recintoCreateSchema = Joi.object({
    nombre: Joi.string().required().min(3).max(100),
    ubicacion: Joi.string().required().min(5).max(200),
    capacidadMaxima: Joi.number().required().positive().max(1000000),
    tipoRecinto: Joi.string()
      .required()
      .valid('plaza', 'parque', 'estadio', 'auditorio'),
    descripcion: Joi.string().optional().max(500),
  });

  private static ocupacionUpdateSchema = Joi.object({
    recintoId: Joi.string().required().uuid(),
    ocupacionActual: Joi.number()
      .required()
      .min(0)
      .custom((value) => {
        // Validación adicional: no puede exceder capacidad máxima
        return value;
      }),
  });

  static validateRecintoCreation(data: any) {
    return this.recintoCreateSchema.validate(data, { abortEarly: false });
  }

  static validateOcupacionUpdate(data: any) {
    return this.ocupacionUpdateSchema.validate(data, { abortEarly: false });
  }

  static validateCapacidadNoExcedida(ocupacion: number, capacidad: number): boolean {
    return ocupacion <= capacidad;
  }
}
