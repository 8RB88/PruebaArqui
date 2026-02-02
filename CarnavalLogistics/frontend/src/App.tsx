import { useState } from 'react';
import './index.css';

type ApiState = {
  data: any;
  error?: any;
  loading?: boolean;
};

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'aforo' | 'permisos'>('aforo');
  const [system, setSystem] = useState<ApiState>({ data: null });
  const [recintos, setRecintos] = useState<ApiState>({ data: null });
  const [comerciante, setComerciante] = useState<ApiState>({ data: null });
  const [comerciantes, setComerciantes] = useState<ApiState>({ data: null });
  const [solicitudes, setSolicitudes] = useState<ApiState>({ data: null });
  const minStartDate = new Date();
  minStartDate.setDate(minStartDate.getDate() + 1);
  const minStartDateStr = minStartDate.toISOString().split('T')[0];

  const handleApi = async (endpoint: string, setter: (value: ApiState) => void) => {
    setter({ data: null, loading: true });
    try {
      const data = await apiRequest(endpoint);
      setter({ data, loading: false });
    } catch (error) {
      setter({ data: null, error, loading: false });
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    endpoint: string,
    setter: (value: ApiState) => void,
    transform?: (payload: Record<string, any>) => Record<string, any>
  ) => {
    event.preventDefault();
    setter({ data: null, loading: true });
    const formData = new FormData(event.currentTarget);
    let payload = Object.fromEntries(formData.entries());
    if (transform) {
      payload = transform(payload);
    }

    try {
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setter({ data, loading: false });
      event.currentTarget.reset();
    } catch (error) {
      setter({ data: null, error, loading: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎭</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                  CarnavalLogistics
                </h1>
                <p className="text-xs text-slate-400">Panel de Gestión Operativa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleApi('/health', setSystem)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-all"
              >
                Health
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Response */}
        {system.data && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-300">Respuesta del Sistema</h3>
              <button
                onClick={() => setSystem({ data: null })}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <pre className="text-xs text-slate-300 overflow-auto max-h-32 bg-slate-900/50 p-3 rounded-lg">
              {JSON.stringify(system.data, null, 2)}
            </pre>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('aforo')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'aforo'
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Control de Aforo
            {activeTab === 'aforo' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('permisos')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'permisos'
                ? 'text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Gestión de Permisos
            {activeTab === 'permisos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
            )}
          </button>
        </div>

        {/* Aforo Tab */}
        {activeTab === 'aforo' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">➕</span>
                Crear Recinto
              </h2>
              <form
                onSubmit={(e) =>
                  handleSubmit(e, '/api/aforo/recintos', setRecintos, (payload) => ({
                    ...payload,
                    capacidadMaxima: Number(payload.capacidadMaxima),
                  }))
                }
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Nombre del recinto
                    </label>
                    <input
                      name="nombre"
                      required
                      minLength={3}
                      placeholder="Plaza Central"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Ubicación
                    </label>
                    <input
                      name="ubicacion"
                      required
                      minLength={5}
                      placeholder="Centro histórico"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Capacidad máxima
                    </label>
                    <input
                      name="capacidadMaxima"
                      type="number"
                      min={1}
                      required
                      placeholder="1000"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Tipo de recinto
                    </label>
                    <select
                      name="tipoRecinto"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="plaza">Plaza</option>
                      <option value="parque">Parque</option>
                      <option value="estadio">Estadio</option>
                      <option value="auditorio">Auditorio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Descripción (opcional)
                  </label>
                  <textarea
                    name="descripcion"
                    rows={2}
                    placeholder="Breve descripción del recinto..."
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recintos.loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                >
                  {recintos.loading ? 'Creando...' : 'Crear recinto'}
                </button>
              </form>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  Recintos
                </h2>
                <button
                  onClick={() => handleApi('/api/aforo/recintos', setRecintos)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all"
                >
                  Actualizar
                </button>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-slate-300">
                  {recintos.loading
                    ? 'Cargando...'
                    : JSON.stringify(recintos.error ?? recintos.data ?? 'Sin datos', null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Permisos Tab */}
        {activeTab === 'permisos' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Registrar Comerciante
              </h2>
              <form
                onSubmit={(e) => handleSubmit(e, '/api/permisos/comerciantes', setComerciante)}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Nombre
                    </label>
                    <input
                      name="nombre"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Apellido
                    </label>
                    <input
                      name="apellido"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      name="telefono"
                      required
                      placeholder="099-000-000"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Cédula
                    </label>
                    <input
                      name="cedula"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Razón social
                    </label>
                    <input
                      name="razonSocial"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={comerciante.loading}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 rounded-lg font-semibold transition-all shadow-lg shadow-sky-500/30 disabled:opacity-50"
                >
                  {comerciante.loading ? 'Registrando...' : 'Registrar comerciante'}
                </button>
              </form>

              {comerciante.data && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-400 font-medium">✓ Comerciante registrado</p>
                  <p className="text-xs text-slate-400 mt-1">
                    ID: {comerciante.data.comerciante?.id}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => handleApi('/api/permisos/comerciantes', setComerciantes)}
                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all"
                >
                  Ver todos los comerciantes
                </button>
                
                {comerciantes.data && (
                  <div className="mt-3 bg-slate-900/50 border border-slate-700 rounded-lg p-4 max-h-64 overflow-auto">
                    <h3 className="text-xs font-semibold text-slate-400 mb-2">Comerciantes Registrados</h3>
                    {comerciantes.data.comerciantes?.length > 0 ? (
                      <div className="space-y-2">
                        {comerciantes.data.comerciantes.map((c: any) => (
                          <div key={c.id} className="p-2 bg-slate-800/50 rounded text-xs">
                            <p className="font-semibold text-slate-200">{c.nombre} {c.apellido}</p>
                            <p className="text-slate-400">ID: {c.id}</p>
                            <p className="text-slate-400">{c.email}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No hay comerciantes registrados</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Solicitud de Permiso
              </h2>
              <form
                onSubmit={(e) =>
                  handleSubmit(e, '/api/permisos/solicitudes', setSolicitudes, (payload) => ({
                    ...payload,
                    areaMetrosCuadrados: Number(payload.areaMetrosCuadrados),
                    monto: Number(payload.monto),
                    documentosAdjuntos: payload.documentosAdjuntos
                      ? String(payload.documentosAdjuntos)
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                      : undefined,
                  }))
                }
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Comerciante ID
                    </label>
                    <select
                      name="comercianteId"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm"
                      onClick={() => !comerciantes.data && handleApi('/api/permisos/comerciantes', setComerciantes)}
                    >
                      <option value="">Seleccionar comerciante...</option>
                      {comerciantes.data?.comerciantes?.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} {c.apellido} - {c.cedula}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Tipo de producto
                    </label>
                    <select
                      name="tipoProducto"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="alimentos">🍕 Alimentos</option>
                      <option value="bebidas">🥤 Bebidas</option>
                      <option value="artesanias">🎨 Artesanías</option>
                      <option value="entretenimiento">🎪 Entretenimiento</option>
                      <option value="otro">📦 Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    required
                    minLength={10}
                    rows={2}
                    placeholder="Describe el tipo de producto o servicio..."
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Fecha inicio
                    </label>
                    <input
                      name="fechaInicio"
                      type="date"
                      required
                      min={minStartDateStr}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Fecha fin
                    </label>
                    <input
                      name="fechaFin"
                      type="date"
                      required
                      min={minStartDateStr}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Ubicación
                    </label>
                    <input
                      name="ubicacionSolicitada"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Área (m²)
                    </label>
                    <input
                      name="areaMetrosCuadrados"
                      type="number"
                      min={1}
                      required
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Monto (USD)
                  </label>
                  <input
                    name="monto"
                    type="number"
                    min={1}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={solicitudes.loading}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 rounded-lg font-semibold transition-all shadow-lg shadow-sky-500/30 disabled:opacity-50"
                >
                  {solicitudes.loading ? 'Creando...' : 'Crear solicitud'}
                </button>
              </form>

              {solicitudes.error && (
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <p className="text-sm text-rose-300 font-medium">✕ Error al crear solicitud</p>
                  <pre className="text-xs text-rose-200 mt-2 overflow-auto max-h-40">
                    {JSON.stringify(solicitudes.error, null, 2)}
                  </pre>
                  <p className="text-xs text-rose-200 mt-2">
                    Nota: la fecha de inicio debe ser al menos mañana.
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApi('/api/permisos/solicitudes/pendientes', setSolicitudes)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all"
                >
                  Ver pendientes
                </button>
                <button
                  onClick={() => handleApi('/api/permisos/estadisticas', setSolicitudes)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all"
                >
                  Estadísticas
                </button>
              </div>

              {solicitudes.data && (
                <div className="mt-4 bg-slate-900/50 border border-slate-700 rounded-lg p-4 max-h-64 overflow-auto">
                  <pre className="text-xs text-slate-300">
                    {JSON.stringify(solicitudes.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-400">
          API: <span className="text-sky-400 font-mono">http://localhost:3000</span> • Frontend:{' '}
          <span className="text-indigo-400 font-mono">http://localhost:5173</span>
        </div>
      </footer>
    </div>
  );
}
