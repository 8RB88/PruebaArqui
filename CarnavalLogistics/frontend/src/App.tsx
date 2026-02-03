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
  const totalRecintos = recintos.data?.total ?? recintos.data?.recintos?.length ?? '--';
  const totalComerciantes =
    comerciantes.data?.total ?? comerciantes.data?.comerciantes?.length ?? '--';
  const totalSolicitudes = solicitudes.data?.total ?? solicitudes.data?.solicitudes?.length ?? '--';

  const renderRecintos = () => {
    if (recintos.loading) return <p className="text-sm text-slate-400">Cargando...</p>;
    if (recintos.error)
      return (
        <pre className="text-xs text-rose-200 overflow-auto max-h-60">
          {JSON.stringify(recintos.error, null, 2)}
        </pre>
      );
    if (recintos.data?.recintos?.length) {
      return (
        <div className="space-y-3">
          {recintos.data.recintos.map((r: any) => (
            <div key={r.id} className="p-3 bg-slate-900/60 border border-slate-800/70 rounded-xl">
              <p className="text-sm font-semibold text-slate-100">{r.nombre}</p>
              <p className="text-xs text-slate-400">{r.ubicacion}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] px-2 py-1 bg-indigo-500/10 text-indigo-200 border border-indigo-500/30 rounded-full">
                  Capacidad: {r.capacidadMaxima}
                </span>
                <span className="text-[11px] px-2 py-1 bg-slate-700/40 text-slate-200 border border-slate-700 rounded-full">
                  Tipo: {r.tipoRecinto}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm text-slate-400">Sin recintos registrados</p>;
  };

  const renderSolicitudes = () => {
    if (solicitudes.loading) return <p className="text-sm text-slate-400">Cargando...</p>;
    if (solicitudes.error)
      return (
        <pre className="text-xs text-rose-200 overflow-auto max-h-60">
          {JSON.stringify(solicitudes.error, null, 2)}
        </pre>
      );
    if (solicitudes.data?.solicitudes?.length) {
      return (
        <div className="space-y-3">
          {solicitudes.data.solicitudes.map((s: any) => (
            <div key={s.id} className="p-3 bg-slate-900/60 border border-slate-800/70 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">{s.tipoProducto}</p>
                <span className="text-[11px] px-2 py-1 rounded-full bg-sky-500/10 text-sky-200 border border-sky-500/30">
                  {s.estado}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{s.descripcion}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] px-2 py-1 bg-slate-700/40 text-slate-200 border border-slate-700 rounded-full">
                  Área: {s.areaMetrosCuadrados} m²
                </span>
                <span className="text-[11px] px-2 py-1 bg-emerald-500/10 text-emerald-200 border border-emerald-500/30 rounded-full">
                  USD {s.monto}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (solicitudes.data?.solicitud) {
      return (
        <pre className="text-xs text-slate-300 overflow-auto max-h-60">
          {JSON.stringify(solicitudes.data, null, 2)}
        </pre>
      );
    }
    return <p className="text-sm text-slate-400">Sin solicitudes para mostrar</p>;
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.12),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>
      {/* Header */}
      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
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
                className="px-4 py-2 bg-slate-900/70 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                Health
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/40">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">Panel Operativo</h2>
              <p className="text-sm text-slate-400">Control unificado de aforo y permisos en tiempo real</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200">
                API en línea
              </div>
              <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200">
                UI React + Tailwind
              </div>
            </div>
          </div>
        </div>
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
        <div className="flex gap-2 mb-6 border-b border-slate-800/70">
          <button
            onClick={() => setActiveTab('aforo')}
            className={`px-6 py-3 font-semibold transition-all relative rounded-t-xl ${
              activeTab === 'aforo'
                ? 'text-indigo-300 bg-slate-900/60'
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
            className={`px-6 py-3 font-semibold transition-all relative rounded-t-xl ${
              activeTab === 'permisos'
                ? 'text-sky-300 bg-slate-900/60'
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
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4 shadow-lg shadow-slate-950/40">
                <p className="text-xs text-slate-400">Recintos registrados</p>
                <p className="text-2xl font-semibold text-indigo-300 mt-1">{totalRecintos}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4 shadow-lg shadow-slate-950/40">
                <p className="text-xs text-slate-400">Estado</p>
                <p className="text-sm font-semibold text-emerald-300 mt-1">Operativo</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4 shadow-lg shadow-slate-950/40">
                <p className="text-xs text-slate-400">Última acción</p>
                <p className="text-sm text-slate-200 mt-1">
                  {recintos.loading ? 'Procesando...' : 'Lista actualizada'}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-slate-950/40">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">➕</span>
                Crear Recinto
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Registra nuevos espacios y controla la capacidad permitida.
              </p>
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
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 disabled:opacity-50"
                >
                  {recintos.loading ? 'Creando...' : 'Crear recinto'}
                </button>
              </form>

              {recintos.data?.recinto && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-400 font-medium">✓ Recinto creado</p>
                  <p className="text-xs text-slate-400 mt-1">
                    ID: {recintos.data.recinto?.id}
                  </p>
                </div>
              )}

              {recintos.error && (
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <p className="text-sm text-rose-300 font-medium">✕ Error al crear recinto</p>
                  <pre className="text-xs text-rose-200 mt-2 overflow-auto max-h-32">
                    {JSON.stringify(recintos.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-slate-950/40">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  Recintos
                </h2>
                <button
                  onClick={() => handleApi('/api/aforo/recintos', setRecintos)}
                  className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  Actualizar
                </button>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/70 rounded-lg p-4 max-h-96 overflow-auto">
                {renderRecintos()}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Permisos Tab */}
        {activeTab === 'permisos' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4 shadow-lg shadow-slate-950/40">
                <p className="text-xs text-slate-400">Comerciantes</p>
                <p className="text-2xl font-semibold text-sky-300 mt-1">{totalComerciantes}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4 shadow-lg shadow-slate-950/40">
                <p className="text-xs text-slate-400">Solicitudes visibles</p>
                <p className="text-2xl font-semibold text-sky-300 mt-1">{totalSolicitudes}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-4 shadow-lg shadow-slate-950/40">
                <p className="text-xs text-slate-400">Estado</p>
                <p className="text-sm font-semibold text-emerald-300 mt-1">En línea</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-slate-950/40">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Registrar Comerciante
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Guarda los datos básicos para emitir permisos comerciales.
              </p>
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
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 disabled:opacity-50"
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

              {comerciante.error && (
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <p className="text-sm text-rose-300 font-medium">✕ Error al registrar comerciante</p>
                  <pre className="text-xs text-rose-200 mt-2 overflow-auto max-h-32">
                    {JSON.stringify(comerciante.error, null, 2)}
                  </pre>
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

            <div className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-slate-950/40">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Solicitud de Permiso
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Genera solicitudes con fechas válidas y ubicación disponible.
              </p>
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
                    <p className="text-[11px] text-slate-500 mt-1">Debe ser desde mañana.</p>
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
                    <p className="text-[11px] text-slate-500 mt-1">Debe ser posterior a inicio.</p>
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
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 disabled:opacity-50"
                >
                  {solicitudes.loading ? 'Creando...' : 'Crear solicitud'}
                </button>
              </form>

              {solicitudes.data?.solicitud && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-400 font-medium">✓ Solicitud creada</p>
                  <p className="text-xs text-slate-400 mt-1">
                    ID: {solicitudes.data.solicitud?.id}
                  </p>
                </div>
              )}

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
                  className="flex-1 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  Ver pendientes
                </button>
                <button
                  onClick={() => handleApi('/api/permisos/estadisticas', setSolicitudes)}
                  className="flex-1 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  Estadísticas
                </button>
              </div>

              <div className="mt-4 bg-slate-950/60 border border-slate-800/70 rounded-lg p-4 max-h-64 overflow-auto">
                {renderSolicitudes()}
              </div>
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
