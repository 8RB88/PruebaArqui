// src/infrastructure/logger.ts

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private static level = process.env.LOG_LEVEL || 'INFO';

  private static shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level as LogLevel);
  }

  static debug(message: string, data?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${message}`, data || '');
    }
  }

  static info(message: string, data?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[${new Date().toISOString()}] [INFO] ${message}`, data || '');
    }
  }

  static warn(message: string, data?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, data || '');
    }
  }

  static error(message: string, error?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, error || '');
    }
  }
}
