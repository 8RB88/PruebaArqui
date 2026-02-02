// tests/setup.ts

import dotenv from 'dotenv';

// Cargar variables de entorno para tests
dotenv.config({ path: '.env.example' });

// Variables de entorno de test
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'ERROR';
process.env.PORT = '3000';
