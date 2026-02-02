const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const API_BASE = window.APP_API_BASE || 'http://localhost:8000/api';
const AUTH_BASE = API_BASE.replace(/\/api\/?$/, '') + '/api/auth';
const TOKEN_KEY = 'ativo_real_token';

const satelliteLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles (c) Esri',
  }),
  visible: false,
});

const parcelsSource = new ol.source.Vector();
const drawnSource = new ol.source.Vector();
const markerSource = new ol.source.Vector();

const parcelsLayer = new ol.layer.Vector({
  source: parcelsSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(223, 107, 47, 0.28)',
    }),
    stroke: new ol.style.Stroke({
      color: '#9f3b10',
      width: 2,
    }),
  }),
});

const drawnLayer = new ol.layer.Vector({
  source: drawnSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(32, 124, 229, 0.2)',
    }),
    stroke: new ol.style.Stroke({
      color: '#207ce5',
      width: 2,
      lineDash: [8, 6],
    }),
  }),
});

const markerSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="#df6b2f" />
    <circle cx="12" cy="12" r="4" fill="#fff5e8" />
  </svg>
`;
const markerUrl = `data:image/svg+xml;utf8,${encodeURIComponent(markerSvg)}`;

const markerLayer = new ol.layer.Vector({
  source: markerSource,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: markerUrl,
      anchor: [0.5, 0.5],
      scale: 0.9,
    }),
  }),
});

const map = new ol.Map({
  target: 'map',
  layers: [osmLayer, satelliteLayer, parcelsLayer, drawnLayer, markerLayer],
  view: new ol.View({
    center: ol.proj.fromLonLat([-47.8825, -15.7942]),
    zoom: 5,
  }),
});

const draw = new ol.interaction.Draw({
  source: drawnSource,
  type: 'Polygon',
});

map.addInteraction(draw);

const areaValue = document.getElementById('area-value');
const perimeterValue = document.getElementById('perimeter-value');
const activeProjectLabel = document.getElementById('active-project');
const parcelNameInput = document.getElementById('parcel-name');
const saveParcelBtn = document.getElementById('save-parcel');
const updateParcelNameBtn = document.getElementById('update-parcel-name');
const updateParcelGeomBtn = document.getElementById('update-parcel-geom');
const mapStatus = document.getElementById('map-status');
const parcelList = document.getElementById('parcel-list');
const docForm = document.getElementById('doc-form');
const docList = document.getElementById('doc-list');
const docStatusLine = document.getElementById('doc-status-line');
const dashProjects = document.getElementById('dash-projects');
const dashDocs = document.getElementById('dash-docs');
const dashPayments = document.getElementById('dash-payments');
const dashExpenses = document.getElementById('dash-expenses');

let lastDrawnFeature = null;
let currentProject = null;
let currentParcel = null;
const geoJsonFormat = new ol.format.GeoJSON();

function setMapStatus(text) {
  mapStatus.textContent = text;
}

function setDocStatus(text) {
  docStatusLine.textContent = text;
}

function formatMetric(value) {
  return Math.round(value).toLocaleString('pt-BR');
}

function getMetrics(feature) {
  const geometry = feature.getGeometry();
  const area = ol.sphere.getArea(geometry, { projection: 'EPSG:3857' });
  const perimeter = ol.sphere.getLength(geometry, { projection: 'EPSG:3857' });
  return { area, perimeter };
}

function updateMetrics(feature) {
  const { area, perimeter } = getMetrics(feature);
  areaValue.textContent = `${formatMetric(area)} m2`;
  perimeterValue.textContent = `${formatMetric(perimeter)} m`;
}

draw.on('drawend', (event) => {
  lastDrawnFeature = event.feature;
  updateMetrics(event.feature);
  setMapStatus('Poligono pronto para salvar');
});

drawnSource.on('change', () => {
  if (drawnSource.getFeatures().length === 0) {
    areaValue.textContent = '0 m2';
    perimeterValue.textContent = '0 m';
    lastDrawnFeature = null;
    setMapStatus('Pronto');
  }
});

const baseMapButtons = document.querySelectorAll('[data-basemap]');
baseMapButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.basemap;
    const isSatellite = type === 'sat';
    satelliteLayer.setVisible(isSatellite);
    osmLayer.setVisible(!isSatellite);
  });
});

document.getElementById('clear-map').addEventListener('click', () => {
  drawnSource.clear();
  setMapStatus('Pronto');
});

const authForm = document.getElementById('auth-form');
const authStatus = document.getElementById('auth-status');
const logoutBtn = document.getElementById('logout-btn');
const projectList = document.getElementById('project-list');
const projectForm = document.getElementById('project-form');
const projectStatus = document.getElementById('project-status');
const newProjectBtn = document.getElementById('new-project');
const deleteProjectBtn = document.getElementById('delete-project');

function setAuthStatus(text) {
  authStatus.textContent = text;
}

function setProjectStatus(text) {
  projectStatus.textContent = text;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function login(username, password) {
  const response = await fetch(`${AUTH_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Falha no login');
  }

  const payload = await response.json();
  setToken(payload.access);
  return payload;
}

function renderProjects(projects) {
  if (!projects.length) {
    projectList.innerHTML = `
      <div class="list-item">
        <div class="list-title">Sem projetos</div>
        <div class="list-meta">Crie o primeiro no backend</div>
      </div>
    `;
    return;
  }

  projectList.innerHTML = projects
    .map((project) => {
      const status = project.status || 'draft';
      const statusLabel = {
        draft: 'Rascunho',
        in_progress: 'Em andamento',
        done: 'Concluido',
      }[status] || status;
      const selected = currentProject && currentProject.id === project.id;
      return `
        <div class="list-item ${selected ? 'selected' : ''}" data-project-id="${project.id}" data-project-status="${status}">
          <div class="list-title">${project.title}</div>
          <div class="list-meta">${statusLabel}</div>
        </div>
      `;
    })
    .join('');
}

function setActiveProject(project) {
  currentProject = project;
  activeProjectLabel.textContent = project ? project.title : 'Nenhum';
  if (project) {
    projectForm.title.value = project.title || '';
    projectForm.status.value = project.status || 'draft';
    projectForm.description.value = project.description || '';
  } else {
    projectForm.reset();
    projectForm.status.value = 'draft';
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = Object.assign({}, options.headers || {});
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${API_BASE}${path}`, Object.assign({}, options, { headers }));
}

function featureToMultiPolygon(feature) {
  const geometry = feature.getGeometry();
  const geo = geoJsonFormat.writeGeometryObject(geometry, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  });
  if (geo.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geo.coordinates] };
  }
  return geo;
}

function addParcelMarkers(features) {
  markerSource.clear();
  parcelsSource.getFeatures().forEach((feature) => {
    feature.setStyle(null);
  });
  features.forEach((feature) => {
    const geom = feature.getGeometry();
    let pointGeom = null;
    if (geom.getType && geom.getType() === 'MultiPolygon' && geom.getInteriorPoints) {
      const interior = geom.getInteriorPoints();
      const coords = interior.getCoordinates()[0];
      pointGeom = new ol.geom.Point(coords);
    } else if (geom.getInteriorPoint) {
      pointGeom = geom.getInteriorPoint();
    } else if (geom.getFirstCoordinate) {
      pointGeom = new ol.geom.Point(geom.getFirstCoordinate());
    }
    if (!pointGeom) {
      return;
    }
    const point = new ol.Feature({ geometry: pointGeom });
    markerSource.addFeature(point);
  });
}

function renderParcels(parcels) {
  if (!parcels.length) {
    parcelList.innerHTML = `
      <div class="doc-item">
        <div>Nenhum perimetro</div>
        <span class="doc-status">---</span>
      </div>
    `;
    return;
  }

  parcelList.innerHTML = parcels
    .map((parcel) => {
      const selected = currentParcel && currentParcel.id === parcel.id;
      return `
        <div class="parcel-item ${selected ? 'selected' : ''}" data-parcel-id="${parcel.id}">
          <div>
            <div>${parcel.name}</div>
            <div class="parcel-meta">${Math.round(parcel.area_sq_m || 0)} m2</div>
          </div>
          <div class="parcel-actions">
            <button class="btn soft" data-action="zoom">Zoom</button>
            <button class="btn outline" data-action="delete">Excluir</button>
          </div>
        </div>
      `;
    })
    .join('');
}

async function loadParcels(projectId) {
  parcelsSource.clear();
  markerSource.clear();
  renderParcels([]);
  currentParcel = null;
  if (!projectId) {
    return;
  }

  const response = await apiFetch(`/parcels/?project=${projectId}`);
  if (!response.ok) {
    setMapStatus('Falha ao carregar perimetros');
    return;
  }

  const payload = await response.json();
  const features = geoJsonFormat.readFeatures(payload, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  });
  parcelsSource.addFeatures(features);
  addParcelMarkers(features);
  const parcelRows = Array.isArray(payload)
    ? payload.map((item) => ({
        id: item.id,
        name: item.name,
        area_sq_m: item.area_sq_m,
      }))
    : payload.features
      ? payload.features.map((item) => ({
          id: item.id || (item.properties && item.properties.id),
          name: item.properties.name,
          area_sq_m: item.properties.area_sq_m,
        }))
      : [];
  renderParcels(parcelRows);

  if (features.length) {
    const extent = parcelsSource.getExtent();
    map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 17 });
  }
}

async function loadProjectDetail(projectId) {
  const response = await apiFetch(`/projects/${projectId}/`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function loadDashboard(projectId) {
  const query = projectId ? `?project=${projectId}` : '';
  const response = await apiFetch(`/dashboard/${query}`);
  if (!response.ok) {
    return;
  }
  const payload = await response.json();
  const projectTotal = Object.values(payload.project_status || {}).reduce((sum, value) => sum + value, 0);
  const docTotal = Object.values(payload.document_status || {}).reduce((sum, value) => sum + value, 0);
  dashProjects.textContent = projectTotal;
  dashDocs.textContent = docTotal;
  dashPayments.textContent = `R$ ${formatMetric(payload.totals.payments_total || 0)}`;
  dashExpenses.textContent = `R$ ${formatMetric(payload.totals.expenses_total || 0)}`;
}

function renderDocuments(documents) {
  if (!documents.length) {
    docList.innerHTML = `
      <div class="doc-item">
        <div>Nenhum documento</div>
        <span class="doc-status">---</span>
      </div>
    `;
    return;
  }

  docList.innerHTML = documents
    .map((doc) => {
      return `
        <div class="doc-item" data-doc-id="${doc.id}">
          <div>${doc.doc_type.toUpperCase()}</div>
          <span class="doc-status">${doc.status}</span>
          <div class="doc-actions">
            <button class="btn soft" data-action="submit">Enviar</button>
            <button class="btn soft" data-action="approve">Aprovar</button>
            <button class="btn outline" data-action="reset">Resetar</button>
          </div>
        </div>
      `;
    })
    .join('');
}

async function loadDocuments(projectId) {
  if (!projectId) {
    renderDocuments([]);
    return;
  }
  const response = await apiFetch(`/documents/?project=${projectId}`);
  if (!response.ok) {
    setDocStatus('Falha ao carregar documentos');
    return;
  }
  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload.results || [];
  renderDocuments(items);
}

async function saveParcel() {
  if (!currentProject) {
    setMapStatus('Selecione um projeto');
    return;
  }
  if (!lastDrawnFeature) {
    setMapStatus('Desenhe um poligono primeiro');
    return;
  }

  const name = parcelNameInput.value.trim() || 'Perimetro sem nome';
  const metrics = getMetrics(lastDrawnFeature);
  const boundary = featureToMultiPolygon(lastDrawnFeature);

  const response = await apiFetch('/parcels/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: currentProject.id,
      name,
      boundary,
      area_sq_m: metrics.area,
      perimeter_m: metrics.perimeter,
    }),
  });

  if (!response.ok) {
    setMapStatus('Erro ao salvar perimetro');
    return;
  }

  drawnSource.clear();
  setMapStatus('Perimetro salvo');
  await loadParcels(currentProject.id);
}

async function loadProjects() {
  const token = getToken();
  if (!token) {
    renderProjects([]);
    return;
  }

  const response = await fetch(`${API_BASE}/projects/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    setAuthStatus('Token invalido');
    setToken(null);
    renderProjects([]);
    return;
  }

  const payload = await response.json();
  const projects = Array.isArray(payload) ? payload : payload.results || [];
  renderProjects(projects);
  if (!currentProject && projects.length) {
    setActiveProject(projects[0]);
    await loadParcels(projects[0].id);
    await loadDocuments(projects[0].id);
    await loadDashboard(projects[0].id);
    renderProjects(projects);
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    setAuthStatus('Autenticando...');
    await login(username, password);
    setAuthStatus('Autenticado');
    await loadProjects();
  } catch (error) {
    setAuthStatus('Falha no login');
  }
});

logoutBtn.addEventListener('click', () => {
  setToken(null);
  setAuthStatus('Nao autenticado');
  setActiveProject(null);
  parcelsSource.clear();
  drawnSource.clear();
  markerSource.clear();
  renderProjects([]);
  setProjectStatus('Aguardando');
  renderDocuments([]);
  renderParcels([]);
  setDocStatus('Aguardando');
});

if (getToken()) {
  setAuthStatus('Autenticado');
  loadProjects();
} else {
  setAuthStatus('Nao autenticado');
}

projectList.addEventListener('click', (event) => {
  const item = event.target.closest('.list-item[data-project-id]');
  if (!item) {
    return;
  }
  const projectId = Number(item.dataset.projectId);
  if (!projectId) {
    return;
  }
  setMapStatus('Carregando perimetros...');
  setProjectStatus('Carregando projeto...');
  loadProjectDetail(projectId)
    .then((project) => {
      if (project) {
        setActiveProject(project);
        setProjectStatus('Pronto');
      }
    })
    .catch(() => {
      setProjectStatus('Falha ao carregar');
    });
  loadParcels(projectId);
  loadDocuments(projectId);
  loadDashboard(projectId);
  renderProjects(
    Array.from(projectList.querySelectorAll('.list-item[data-project-id]')).map((node) => ({
      id: Number(node.dataset.projectId),
      title: node.querySelector('.list-title').textContent,
      status: node.dataset.projectStatus,
    }))
  );
});

saveParcelBtn.addEventListener('click', () => {
  setMapStatus('Salvando...');
  saveParcel();
});

updateParcelGeomBtn.addEventListener('click', async () => {
  if (!currentParcel) {
    setMapStatus('Selecione um perimetro');
    return;
  }
  if (!lastDrawnFeature) {
    setMapStatus('Desenhe um poligono primeiro');
    return;
  }
  currentParcel.name = parcelNameInput.value.trim() || currentParcel.name || 'Perimetro sem nome';
  setMapStatus('Atualizando geometria...');
  const metrics = getMetrics(lastDrawnFeature);
  const boundary = featureToMultiPolygon(lastDrawnFeature);
  const response = await apiFetch(`/parcels/${currentParcel.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: currentProject.id,
      name: currentParcel.name,
      boundary,
      area_sq_m: metrics.area,
      perimeter_m: metrics.perimeter,
    }),
  });

  if (!response.ok) {
    setMapStatus('Erro ao atualizar');
    return;
  }
  drawnSource.clear();
  setMapStatus('Geometria atualizada');
  await loadParcels(currentProject.id);
});

newProjectBtn.addEventListener('click', () => {
  setActiveProject(null);
  setProjectStatus('Novo projeto');
});

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = projectForm.title.value.trim();
  const status = projectForm.status.value;
  const description = projectForm.description.value.trim();

  if (!title) {
    setProjectStatus('Titulo obrigatorio');
    return;
  }

  setProjectStatus('Salvando...');
  const payload = { title, status, description };
  let response = null;

  if (currentProject && currentProject.id) {
    response = await apiFetch(`/projects/${currentProject.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    response = await apiFetch('/projects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    setProjectStatus('Erro ao salvar');
    return;
  }

  const saved = await response.json();
  setActiveProject(saved);
  setProjectStatus('Salvo');
  await loadProjects();
  await loadDashboard(saved.id);
});

deleteProjectBtn.addEventListener('click', async () => {
  if (!currentProject || !currentProject.id) {
    setProjectStatus('Selecione um projeto');
    return;
  }

  setProjectStatus('Excluindo...');
  const response = await apiFetch(`/projects/${currentProject.id}/`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    setProjectStatus('Erro ao excluir');
    return;
  }

  setActiveProject(null);
  setProjectStatus('Excluido');
  await loadProjects();
});

parcelList.addEventListener('click', async (event) => {
  const item = event.target.closest('.parcel-item[data-parcel-id]');
  if (!item) {
    return;
  }
  const parcelId = Number(item.dataset.parcelId);
  const action = event.target.dataset.action;
  if (!parcelId) {
    return;
  }
  const feature = parcelsSource
    .getFeatures()
    .find((feat) => String(feat.getId()) === String(parcelId));
  if (feature) {
    currentParcel = { id: parcelId, name: feature.get('name') };
    parcelNameInput.value = currentParcel.name || '';
    parcelList.querySelectorAll('.parcel-item').forEach((node) => node.classList.remove('selected'));
    item.classList.add('selected');
  }

  if (action === 'zoom' && feature) {
    map.getView().fit(feature.getGeometry().getExtent(), {
      padding: [40, 40, 40, 40],
      maxZoom: 18,
    });
  }

  if (action === 'delete') {
    setMapStatus('Excluindo perimetro...');
    const response = await apiFetch(`/parcels/${parcelId}/`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      setMapStatus('Erro ao excluir');
      return;
    }
    setMapStatus('Perimetro excluido');
    await loadParcels(currentProject.id);
  }
});

updateParcelNameBtn.addEventListener('click', async () => {
  if (!currentParcel || !currentProject) {
    setMapStatus('Selecione um perimetro');
    return;
  }
  const feature = parcelsSource
    .getFeatures()
    .find((feat) => String(feat.getId()) === String(currentParcel.id));
  if (!feature) {
    setMapStatus('Perimetro nao encontrado');
    return;
  }
  const updatedName = parcelNameInput.value.trim();
  if (!updatedName) {
    setMapStatus('Nome obrigatorio');
    return;
  }
  setMapStatus('Atualizando nome...');
  const boundary = featureToMultiPolygon(feature);
  const metrics = getMetrics(feature);
  const response = await apiFetch(`/parcels/${currentParcel.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: currentProject.id,
      name: updatedName,
      boundary,
      area_sq_m: metrics.area,
      perimeter_m: metrics.perimeter,
    }),
  });
  if (!response.ok) {
    setMapStatus('Erro ao atualizar nome');
    return;
  }
  setMapStatus('Nome atualizado');
  await loadParcels(currentProject.id);
});

docForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentProject) {
    setDocStatus('Selecione um projeto');
    return;
  }
  const formData = new FormData(docForm);
  formData.append('project', currentProject.id);
  setDocStatus('Enviando...');

  const response = await apiFetch('/documents/', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    setDocStatus('Falha no envio');
    return;
  }
  setDocStatus('Enviado');
  docForm.reset();
  await loadDocuments(currentProject.id);
  await loadDashboard(currentProject.id);
});

docList.addEventListener('click', async (event) => {
  const item = event.target.closest('.doc-item[data-doc-id]');
  if (!item) {
    return;
  }
  const action = event.target.dataset.action;
  if (!action) {
    return;
  }
  const docId = item.dataset.docId;
  setDocStatus('Atualizando...');
  const response = await apiFetch(`/documents/${docId}/${action}/`, { method: 'POST' });
  if (!response.ok) {
    setDocStatus('Falha na atualizacao');
    return;
  }
  setDocStatus('Atualizado');
  await loadDocuments(currentProject.id);
  await loadDashboard(currentProject.id);
});
