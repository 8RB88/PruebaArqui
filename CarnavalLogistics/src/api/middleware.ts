// src/api/middleware.ts

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../infrastructure/logger';

/**
 * Middleware de logging
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      Logger.warn(message);
    } else {
      Logger.info(message);
    }
  });

  next();
}

/**
 * Middleware de manejo de errores global
 */
export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  Logger.error('Error no controlado', error);

  res.status(500).json({
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

/**
 * Middleware de validación de autenticación (básico)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // En producción, validar JWT o bearer token
  const token = req.headers.authorization;

  if (!token && process.env.NODE_ENV === 'production') {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  next();
}

/**
 * Middleware CORS
 */
export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}
