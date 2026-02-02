// tests/permisos.test.ts

import { PermisosService } from '../src/modules/permisos/services/PermisosService';
import { PermisosRepositoryMock } from '../src/modules/permisos/repositories/PermisosRepository';

describe('PermisosService', () => {
  let permisosService: PermisosService;
  let repository: PermisosRepositoryMock;

  beforeEach(() => {
    repository = new PermisosRepositoryMock();
    permisosService = new PermisosService(repository);
  });

  test('Registrar comerciante exitosamente', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'Juan',
      'Pérez',
      'juan@email.com',
      '1234567890',
      '12345678',
      'Comercio JP'
    );

    expect(comerciante.nombre).toBe('Juan');
    expect(comerciante.estado).toBe('activo');
  });

  test('Crear solicitud de permiso', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'María',
      'García',
      'maria@email.com',
      '0987654321',
      '87654321',
      'Foodtruck MG'
    );

    const solicitud = await permisosService.crearSolicitud(
      comerciante.id,
      'alimentos',
      'Venta de comidas típicas',
      new Date('2026-03-01'),
      new Date('2026-03-07'),
      'Plaza Mayor',
      25,
      1250
    );

    expect(solicitud.estado).toBe('pendiente');
    expect(solicitud.tipoProducto).toBe('alimentos');
  });

  test('No permitir solicitud de comerciante bloqueado', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'Carlos',
      'López',
      'carlos@email.com',
      '5555555555',
      '99999999',
      'CarlosComercio'
    );

    // Bloquear comerciante
    await permisosService.bloquearComerciante(comerciante.id);

    await expect(
      permisosService.crearSolicitud(
        comerciante.id,
        'alimentos',
        'Solicitud de prueba',
        new Date('2026-03-01'),
        new Date('2026-03-07'),
        'Plaza',
        10,
        500
      )
    ).rejects.toThrow('bloqueado');
  });

  test('Aprobar solicitud de permiso', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'Ana',
      'Martínez',
      'ana@email.com',
      '6666666666',
      '11111111',
      'Ana Ventas'
    );

    const solicitud = await permisosService.crearSolicitud(
      comerciante.id,
      'bebidas',
      'Venta de bebidas',
      new Date('2026-03-01'),
      new Date('2026-03-07'),
      'Parque Central',
      15,
      600
    );

    const aprobacion = await permisosService.aprobarSolicitud(
      solicitud.id,
      'funcionario-001'
    );

    expect(aprobacion.numeroPermiso).toBeDefined();
    expect(aprobacion.numeroPermiso).toMatch(/^PERM-/);
  });

  test('Rechazar solicitud de permiso', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'Roberto',
      'Silva',
      'roberto@email.com',
      '7777777777',
      '22222222',
      'RobertoShop'
    );

    const solicitud = await permisosService.crearSolicitud(
      comerciante.id,
      'artesanias',
      'Venta de artesanías',
      new Date('2026-03-01'),
      new Date('2026-03-07'),
      'Parque Temático',
      20,
      600
    );

    const rechazada = await permisosService.rechazarSolicitud(
      solicitud.id,
      'Documentación incompleta'
    );

    expect(rechazada.estado).toBe('rechazado');
    expect(rechazada.razonRechazo).toBe('Documentación incompleta');
  });

  test('Calcular tarifa automáticamente', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'Test',
      'User',
      'test@email.com',
      '8888888888',
      '33333333',
      'TestUser'
    );

    const solicitud = await permisosService.crearSolicitud(
      comerciante.id,
      'alimentos',
      'Test',
      new Date('2026-03-01'),
      new Date('2026-03-07'),
      'Plaza Test',
      50, // 50 m²
      0 // No importa, se calcula automáticamente
    );

    // 50 m² * $50/m² = $2500
    expect(solicitud.monto).toBe(2500);
  });

  test('Validar disponibilidad de ubicación', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'Marco',
      'Soto',
      'marco@email.com',
      '9999999999',
      '44444444',
      'MarcoComercio'
    );

    // Crear y aprobar primera solicitud
    const solicitud1 = await permisosService.crearSolicitud(
      comerciante.id,
      'alimentos',
      'Primera solicitud',
      new Date('2026-03-01'),
      new Date('2026-03-07'),
      'Plaza Única',
      20,
      1000
    );

    await permisosService.aprobarSolicitud(solicitud1.id, 'funcionario-001');

    // Intentar crear solicitud que se solapa
    const disponible = await permisosService.validarUbicacionDisponible(
      'Plaza Única',
      new Date('2026-03-05'),
      new Date('2026-03-10')
    );

    expect(disponible).toBe(false);
  });

  test('Obtener estadísticas de permisos', async () => {
    const comerciante = await permisosService.registrarComerciante(
      'Estadísticas',
      'Test',
      'stats@email.com',
      '1111111111',
      '55555555',
      'StatsTest'
    );

    const solicitud = await permisosService.crearSolicitud(
      comerciante.id,
      'entretenimiento',
      'Entretenimiento',
      new Date('2026-03-01'),
      new Date('2026-03-07'),
      'Plaza Fest',
      30,
      1800
    );

    await permisosService.aprobarSolicitud(solicitud.id, 'funcionario-001');

    const estadisticas = await permisosService.obtenerEstadisticas();

    expect(estadisticas.totalSolicitudes).toBeGreaterThan(0);
    expect(estadisticas.aprobadas).toBeGreaterThan(0);
    expect(estadisticas.ingresoTotal).toBeGreaterThan(0);
  });
});
