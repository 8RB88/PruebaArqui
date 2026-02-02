// src/index.ts

import dotenv from 'dotenv';
import { createApp } from './api/app';
import { Logger } from './infrastructure/logger';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Crear aplicación Express
const app = createApp();

// Iniciar servidor
const server = app.listen(PORT, () => {
  Logger.info(`=== CarnavalLogistics Server ===`);
  Logger.info(`Servidor iniciado en puerto: ${PORT}`);
  Logger.info(`Ambiente: ${NODE_ENV}`);
  Logger.info(`Timestamp: ${new Date().toISOString()}`);
  Logger.info(`===============================`);
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
  Logger.info('Recibida señal SIGINT - cerrando servidor...');
  server.close(() => {
    Logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  Logger.info('Recibida señal SIGTERM - cerrando servidor...');
  server.close(() => {
    Logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejador de excepciones no capturadas
process.on('uncaughtException', (error) => {
  Logger.error('Excepción no capturada', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Promesa rechazada no controlada', { reason, promise });
  process.exit(1);
});

export default app;
