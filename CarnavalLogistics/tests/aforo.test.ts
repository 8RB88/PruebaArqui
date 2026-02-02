// tests/aforo.test.ts

import { AforoService } from '../src/modules/aforo/services/AforoService';
import { AforoRepositoryMock } from '../src/modules/aforo/repositories/AforoRepository';
import { v4 as uuidv4 } from 'uuid';

describe('AforoService', () => {
  let aforoService: AforoService;
  let repository: AforoRepositoryMock;

  beforeEach(() => {
    repository = new AforoRepositoryMock();
    aforoService = new AforoService(repository);
  });

  test('Crear recinto exitosamente', async () => {
    const recinto = await aforoService.crearRecinto(
      'Plaza Mayor',
      'Centro histórico',
      5000,
      'plaza',
      'Principal plaza del carnaval'
    );

    expect(recinto.nombre).toBe('Plaza Mayor');
    expect(recinto.capacidadMaxima).toBe(5000);
    expect(recinto.estado).toBe('activo');
  });

  test('Obtener todos los recintos', async () => {
    await aforoService.crearRecinto('Plaza 1', 'Ubicación 1', 1000, 'plaza');
    await aforoService.crearRecinto('Plaza 2', 'Ubicación 2', 2000, 'plaza');

    const recintos = await aforoService.obtenerRecintos();
    expect(recintos.length).toBe(2);
  });

  test('Actualizar ocupación correctamente', async () => {
    const recinto = await aforoService.crearRecinto(
      'Estadio',
      'Zona norte',
      10000,
      'estadio'
    );

    const ocupacion = await aforoService.actualizarOcupacion(recinto.id, 5000);

    expect(ocupacion.ocupacionActual).toBe(5000);
    expect(ocupacion.porcentajeOcupacion).toBe(50);
  });

  test('Registrar entrada de personas', async () => {
    const recinto = await aforoService.crearRecinto(
      'Parque Central',
      'Zona verde',
      3000,
      'parque'
    );

    const ocupacion1 = await aforoService.registrarEntrada(recinto.id, 100);
    expect(ocupacion1.ocupacionActual).toBe(100);

    const ocupacion2 = await aforoService.registrarEntrada(recinto.id, 50);
    expect(ocupacion2.ocupacionActual).toBe(150);
  });

  test('Registrar salida de personas', async () => {
    const recinto = await aforoService.crearRecinto(
      'Auditorio',
      'Edificio municipal',
      500,
      'auditorio'
    );

    await aforoService.registrarEntrada(recinto.id, 300);
    const ocupacion = await aforoService.registrarSalida(recinto.id, 100);

    expect(ocupacion.ocupacionActual).toBe(200);
  });

  test('Generar alerta cuando se alcanza capacidad crítica', async () => {
    const recinto = await aforoService.crearRecinto(
      'Plaza de Armas',
      'Centro',
      100,
      'plaza'
    );

    // 95% de ocupación debe generar alerta crítica
    await aforoService.actualizarOcupacion(recinto.id, 95);
    const alertas = await aforoService.obtenerAlertasRecinto(recinto.id);

    expect(alertas.length).toBeGreaterThan(0);
    expect(alertas[0].tipo).toBe('capacidad_critica');
  });

  test('No permitir ocupación mayor a capacidad máxima', async () => {
    const recinto = await aforoService.crearRecinto(
      'Recinto',
      'Ubicación',
      100,
      'plaza'
    );

    await expect(
      aforoService.actualizarOcupacion(recinto.id, 150)
    ).rejects.toThrow('excede capacidad máxima');
  });

  test('Obtener estado de ocupación', async () => {
    const recinto = await aforoService.crearRecinto(
      'Recinto',
      'Ubicación',
      1000,
      'plaza'
    );

    await aforoService.actualizarOcupacion(recinto.id, 500);
    const estado = await aforoService.obtenerEstadoOcupacion(recinto.id);

    expect(estado.ocupacion.porcentajeOcupacion).toBe(50);
    expect(estado.estado).toBe('normal');
  });

  test('Generar reporte de ocupación', async () => {
    await aforoService.crearRecinto('Plaza 1', 'Ubic 1', 1000, 'plaza');
    await aforoService.crearRecinto('Plaza 2', 'Ubic 2', 2000, 'plaza');

    const reporte = await aforoService.generarReporteOcupacion();

    expect(reporte.length).toBe(2);
    expect(reporte[0]).toHaveProperty('nombreRecinto');
    expect(reporte[0]).toHaveProperty('porcentajeOcupacion');
  });
});
