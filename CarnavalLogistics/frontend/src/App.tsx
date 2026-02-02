import { useState } from 'react';
import './index.css';

type ApiState = {
  data: any;
  error?: any;
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
  const [system, setSystem] = useState<ApiState>({ data: null });
  const [recintos, setRecintos] = useState<ApiState>({ data: null });
  const [comerciante, setComerciante] = useState<ApiState>({ data: null });
  const [solicitudes, setSolicitudes] = useState<ApiState>({ data: null });

  const handleApi = async (endpoint: string, setter: (value: ApiState) => void) => {
    try {
      const data = await apiRequest(endpoint);
      setter({ data });
    } catch (error) {
      setter({ data: null, error });
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    endpoint: string,
    setter: (value: ApiState) => void,
    transform?: (payload: Record<string, any>) => Record<string, any>
  ) => {
    event.preventDefault();
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
      setter({ data });
      event.currentTarget.reset();
    } catch (error) {
      setter({ data: null, error });
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="kicker">CarnavalLogistics</p>
          <h1>Panel de Gestión Operativa</h1>
          <p className="subtitle">Frontend React para monitorear aforo y permisos.</p>
          <div className="actions">
            <button className="btn" onClick={() => handleApi('/health', setSystem)}>
              Health check
            </button>
            <button className="btn btn-secondary" onClick={() => handleApi('/api', setSystem)}>
              Info API
            </button>
          </div>
        </div>
        <div className="status">
          <span className="dot" />
          Backend conectado
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Respuesta del sistema</h2>
          <pre>{JSON.stringify(system.error ?? system.data ?? 'Esperando...', null, 2)}</pre>
        </section>

        <section className="card">
          <h2>Aforo · Recintos</h2>
          <form
            className="form"
            onSubmit={(event) =>
              handleSubmit(event, '/api/aforo/recintos', setRecintos, (payload) => ({
                ...payload,
                capacidadMaxima: Number(payload.capacidadMaxima),
              }))
            }
          >
            <div className="row">
              <label>
                Nombre
                <input name="nombre" required minLength={3} />
              </label>
              <label>
                Ubicación
                <input name="ubicacion" required minLength={5} />
              </label>
            </div>
            <div className="row">
              <label>
                Capacidad máxima
                <input name="capacidadMaxima" type="number" min={1} required />
              </label>
              <label>
                Tipo recinto
                <select name="tipoRecinto" required>
                  <option value="plaza">Plaza</option>
                  <option value="parque">Parque</option>
                  <option value="estadio">Estadio</option>
                  <option value="auditorio">Auditorio</option>
                </select>
              </label>
            </div>
            <label>
              Descripción
              <textarea name="descripcion" rows={2} />
            </label>
            <button className="btn" type="submit">
              Crear recinto
            </button>
          </form>
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => handleApi('/api/aforo/recintos', setRecintos)}>
              Listar recintos
            </button>
          </div>
          <pre>{JSON.stringify(recintos.error ?? recintos.data ?? 'Sin datos', null, 2)}</pre>
        </section>

        <section className="card">
          <h2>Permisos · Comerciante</h2>
          <form className="form" onSubmit={(event) => handleSubmit(event, '/api/permisos/comerciantes', setComerciante)}>
            <div className="row">
              <label>
                Nombre
                <input name="nombre" required />
              </label>
              <label>
                Apellido
                <input name="apellido" required />
              </label>
            </div>
            <div className="row">
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                Teléfono
                <input name="telefono" required />
              </label>
            </div>
            <div className="row">
              <label>
                Cédula
                <input name="cedula" required />
              </label>
              <label>
                Razón social
                <input name="razonSocial" required />
              </label>
            </div>
            <button className="btn" type="submit">
              Registrar comerciante
            </button>
          </form>
          <pre>{JSON.stringify(comerciante.error ?? comerciante.data ?? 'Sin datos', null, 2)}</pre>
        </section>

        <section className="card">
          <h2>Permisos · Solicitud</h2>
          <form
            className="form"
            onSubmit={(event) =>
              handleSubmit(event, '/api/permisos/solicitudes', setSolicitudes, (payload) => ({
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
          >
            <div className="row">
              <label>
                Comerciante ID
                <input name="comercianteId" required />
              </label>
              <label>
                Tipo producto
                <select name="tipoProducto" required>
                  <option value="alimentos">Alimentos</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="artesanias">Artesanías</option>
                  <option value="entretenimiento">Entretenimiento</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
            </div>
            <label>
              Descripción
              <textarea name="descripcion" rows={2} required minLength={10} />
            </label>
            <div className="row">
              <label>
                Fecha inicio
                <input name="fechaInicio" type="date" required />
              </label>
              <label>
                Fecha fin
                <input name="fechaFin" type="date" required />
              </label>
            </div>
            <div className="row">
              <label>
                Ubicación
                <input name="ubicacionSolicitada" required />
              </label>
              <label>
                Área (m²)
                <input name="areaMetrosCuadrados" type="number" min={1} required />
              </label>
            </div>
            <label>
              Monto
              <input name="monto" type="number" min={1} required />
            </label>
            <label>
              Documentos (URLs separadas por coma)
              <input name="documentosAdjuntos" />
            </label>
            <button className="btn" type="submit">
              Crear solicitud
            </button>
          </form>
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => handleApi('/api/permisos/solicitudes/pendientes', setSolicitudes)}>
              Ver pendientes
            </button>
            <button className="btn btn-secondary" onClick={() => handleApi('/api/permisos/estadisticas', setSolicitudes)}>
              Ver estadísticas
            </button>
          </div>
          <pre>{JSON.stringify(solicitudes.error ?? solicitudes.data ?? 'Sin datos', null, 2)}</pre>
        </section>
      </main>

      <footer className="footer">API viva en http://localhost:3000</footer>
    </div>
  );
}
