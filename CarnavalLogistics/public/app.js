const outputSystem = document.getElementById('output-system');
const outputRecintos = document.getElementById('output-recintos');
const outputComerciante = document.getElementById('output-comerciante');
const outputSolicitudes = document.getElementById('output-solicitudes');

const btnHealth = document.getElementById('btn-health');
const btnApi = document.getElementById('btn-api');
const btnListRecintos = document.getElementById('btn-list-recintos');
const btnPendientes = document.getElementById('btn-pendientes');
const btnEstadisticas = document.getElementById('btn-estadisticas');

const formRecinto = document.getElementById('form-recinto');
const formComerciante = document.getElementById('form-comerciante');
const formSolicitud = document.getElementById('form-solicitud');

const apiRequest = async (url, options = {}) => {
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

const printOutput = (element, data) => {
  element.textContent = JSON.stringify(data, null, 2);
};

btnHealth.addEventListener('click', async () => {
  try {
    const data = await apiRequest('/health');
    printOutput(outputSystem, data);
  } catch (error) {
    printOutput(outputSystem, error);
  }
});

btnApi.addEventListener('click', async () => {
  try {
    const data = await apiRequest('/api');
    printOutput(outputSystem, data);
  } catch (error) {
    printOutput(outputSystem, error);
  }
});

btnListRecintos.addEventListener('click', async () => {
  try {
    const data = await apiRequest('/api/aforo/recintos');
    printOutput(outputRecintos, data);
  } catch (error) {
    printOutput(outputRecintos, error);
  }
});

formRecinto.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(formRecinto);
  const payload = Object.fromEntries(formData.entries());
  payload.capacidadMaxima = Number(payload.capacidadMaxima);

  try {
    const data = await apiRequest('/api/aforo/recintos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    printOutput(outputRecintos, data);
    formRecinto.reset();
  } catch (error) {
    printOutput(outputRecintos, error);
  }
});

formComerciante.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(formComerciante);
  const payload = Object.fromEntries(formData.entries());

  try {
    const data = await apiRequest('/api/permisos/comerciantes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    printOutput(outputComerciante, data);
    formComerciante.reset();
  } catch (error) {
    printOutput(outputComerciante, error);
  }
});

formSolicitud.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(formSolicitud);
  const payload = Object.fromEntries(formData.entries());

  payload.areaMetrosCuadrados = Number(payload.areaMetrosCuadrados);
  payload.monto = Number(payload.monto);

  if (payload.documentosAdjuntos) {
    payload.documentosAdjuntos = payload.documentosAdjuntos
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  } else {
    delete payload.documentosAdjuntos;
  }

  try {
    const data = await apiRequest('/api/permisos/solicitudes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    printOutput(outputSolicitudes, data);
    formSolicitud.reset();
  } catch (error) {
    printOutput(outputSolicitudes, error);
  }
});

btnPendientes.addEventListener('click', async () => {
  try {
    const data = await apiRequest('/api/permisos/solicitudes/pendientes');
    printOutput(outputSolicitudes, data);
  } catch (error) {
    printOutput(outputSolicitudes, error);
  }
});

btnEstadisticas.addEventListener('click', async () => {
  try {
    const data = await apiRequest('/api/permisos/estadisticas');
    printOutput(outputSolicitudes, data);
  } catch (error) {
    printOutput(outputSolicitudes, error);
  }
});
