const API_BASE = '/api/peliculas';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

let favoritosIds = new Set();

// ─── Utilidades ───────────────────────────────────────────────
function posterUrl(path) {
  return path ? IMG_BASE + path : 'https://via.placeholder.com/200x300?text=Sin+Imagen';
}

function anio(fecha) {
  return fecha ? fecha.slice(0, 4) : 'N/A';
}

// ─── Cargar favoritos (IDs) al inicio ─────────────────────────
async function cargarFavoritosIds() {
  try {
    const res = await fetch(`${API_BASE}/favoritos`);
    const data = await res.json();
    favoritosIds = new Set(data.map(f => f.tmdbId));
  } catch (e) {
    favoritosIds = new Set();
  }
}

// ─── Renderizar cards ─────────────────────────────────────────
function crearCard(pelicula) {
  const esFav = favoritosIds.has(pelicula.id);
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <img src="${posterUrl(pelicula.poster_path)}" alt="${pelicula.title}" loading="lazy">
    <div class="movie-card-info">
      <h3>${pelicula.title}</h3>
      <span class="year">${anio(pelicula.release_date)}</span>
      <span class="rating">⭐ ${pelicula.vote_average ? pelicula.vote_average.toFixed(1) : 'N/A'}</span>
      <button class="btn-fav ${esFav ? 'activo' : ''}" data-id="${pelicula.id}" data-titulo="${pelicula.title}" data-fecha="${pelicula.release_date}" data-poster="${pelicula.poster_path || ''}">
        ${esFav ? '❤️ Guardado' : '🤍 Favorito'}
      </button>
    </div>
  `;
  card.querySelector('img').addEventListener('click', () => abrirModal(pelicula.id));
  card.querySelector('.btn-fav').addEventListener('click', (e) => toggleFavorito(e, pelicula));
  return card;
}

function mostrarPeliculas(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  contenedor.innerHTML = '';
  if (!lista || lista.length === 0) {
    contenedor.innerHTML = '<p class="sin-resultados">No se encontraron películas.</p>';
    return;
  }
  lista.forEach(p => contenedor.appendChild(crearCard(p)));
}

// ─── Cargar secciones por categoría ───────────────────────────
async function cargarCategoria(endpoint, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  contenedor.innerHTML = '<p class="cargando">Cargando...</p>';
  try {
    const res = await fetch(`${API_BASE}/categoria/${endpoint}`);
    const data = await res.json();
    mostrarPeliculas(data.results || [], contenedorId);
  } catch (e) {
    contenedor.innerHTML = '<p class="error-msg">Error al cargar películas.</p>';
  }
}

// ─── Buscar por título ────────────────────────────────────────
async function buscar(titulo) {
  const contenedor = document.getElementById('resultados-busqueda');
  if (!contenedor) return;
  contenedor.innerHTML = '<p class="cargando">Buscando...</p>';
  try {
    const res = await fetch(`${API_BASE}?titulo=${encodeURIComponent(titulo)}`);
    const data = await res.json();
    mostrarPeliculas(data.results || [], 'resultados-busqueda');
  } catch (e) {
    contenedor.innerHTML = '<p class="error-msg">Error en la búsqueda.</p>';
  }
}

// ─── Modal de detalle ─────────────────────────────────────────
async function abrirModal(id) {
  const modal = document.getElementById('modal');
  const modalContenido = document.getElementById('modal-contenido');
  if (!modal || !modalContenido) return;
  modalContenido.innerHTML = '<p class="cargando">Cargando detalle...</p>';
  modal.classList.add('visible');
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const p = await res.json();
    const esFav = favoritosIds.has(p.id);
    modalContenido.innerHTML = `
      <button class="cerrar-modal" id="cerrar-modal">✕</button>
      <div class="modal-poster">
        <img src="${posterUrl(p.poster_path)}" alt="${p.title}">
      </div>
      <div class="modal-info">
        <h2>${p.title}</h2>
        <p class="modal-meta">📅 ${p.release_date || 'N/A'} &nbsp;|&nbsp; ⭐ ${p.vote_average ? p.vote_average.toFixed(1) : 'N/A'} &nbsp;|&nbsp; 🕐 ${p.runtime ? p.runtime + ' min' : 'N/A'}</p>
        <p class="modal-overview">${p.overview || 'Sin sinopsis disponible.'}</p>
        <button class="btn-fav ${esFav ? 'activo' : ''}" data-id="${p.id}" data-titulo="${p.title}" data-fecha="${p.release_date}" data-poster="${p.poster_path || ''}">
          ${esFav ? '❤️ Quitar de favoritos' : '🤍 Agregar a favoritos'}
        </button>
      </div>
    `;
    document.getElementById('cerrar-modal').addEventListener('click', cerrarModal);
    modalContenido.querySelector('.btn-fav').addEventListener('click', (e) => toggleFavorito(e, p));
  } catch (e) {
    modalContenido.innerHTML = '<p class="error-msg">Error al cargar el detalle.</p>';
  }
}

function cerrarModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('visible');
}

// ─── Favoritos ────────────────────────────────────────────────
async function toggleFavorito(e, pelicula) {
  e.stopPropagation();
  const btn = e.currentTarget;
  const id = pelicula.id;

  if (favoritosIds.has(id)) {
    // Eliminar favorito
    try {
      await fetch(`${API_BASE}/favoritos/${id}`, { method: 'DELETE' });
      favoritosIds.delete(id);
      btn.textContent = '🤍 Favorito';
      btn.classList.remove('activo');
      mostrarNotificacion('Eliminado de favoritos');
      if (seccionActual === 'favoritos') cargarFavoritosSeccion();
    } catch (e) {
      mostrarNotificacion('Error al eliminar favorito', true);
    }
  } else {
    // Agregar favorito
    try {
      await fetch(`${API_BASE}/favoritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: id })
      });
      favoritosIds.add(id);
      btn.textContent = '❤️ Guardado';
      btn.classList.add('activo');
      mostrarNotificacion('¡Agregado a favoritos!');
    } catch (e) {
      mostrarNotificacion('Error al agregar favorito', true);
    }
  }
}

async function cargarFavoritosSeccion() {
  const contenedor = document.getElementById('lista-favoritos');
  if (!contenedor) return;
  contenedor.innerHTML = '<p class="cargando">Cargando favoritos...</p>';
  try {
    const res = await fetch(`${API_BASE}/favoritos`);
    const data = await res.json();
    if (!data.length) {
      contenedor.innerHTML = '<p class="sin-resultados">No tienes películas en favoritos.</p>';
      return;
    }
    contenedor.innerHTML = '';
    data.forEach(fav => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <img src="${fav.poster && fav.poster !== 'N/A' ? fav.poster : 'https://via.placeholder.com/200x300?text=Sin+Imagen'}" alt="${fav.titulo}" loading="lazy">
        <div class="movie-card-info">
          <h3>${fav.titulo}</h3>
          <span class="year">${anio(fav.año)}</span>
          ${fav.nota ? `<p class="nota-fav">📝 ${fav.nota}</p>` : ''}
          <button class="btn-fav activo" data-id="${fav.tmdbId}">❤️ Quitar</button>
        </div>
      `;
      card.querySelector('.btn-fav').addEventListener('click', async (e) => {
        await fetch(`${API_BASE}/favoritos/${fav.tmdbId}`, { method: 'DELETE' });
        favoritosIds.delete(fav.tmdbId);
        card.remove();
        mostrarNotificacion('Eliminado de favoritos');
        if (!contenedor.children.length)
          contenedor.innerHTML = '<p class="sin-resultados">No tienes películas en favoritos.</p>';
      });
      contenedor.appendChild(card);
    });
  } catch (e) {
    contenedor.innerHTML = '<p class="error-msg">Error al cargar favoritos.</p>';
  }
}

// ─── Notificaciones ───────────────────────────────────────────
function mostrarNotificacion(msg, esError = false) {
  let notif = document.getElementById('notificacion');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notificacion';
    document.body.appendChild(notif);
  }
  notif.textContent = msg;
  notif.className = 'notificacion ' + (esError ? 'error' : 'ok');
  notif.style.display = 'block';
  setTimeout(() => { notif.style.display = 'none'; }, 2500);
}

// ─── Navegación por secciones ─────────────────────────────────
let seccionActual = 'populares';

function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('activo'));
  const seccion = document.getElementById('seccion-' + id);
  if (seccion) seccion.classList.add('activa');
  const navItem = document.querySelector(`[data-seccion="${id}"]`);
  if (navItem) navItem.classList.add('activo');
  seccionActual = id;

  if (id === 'favoritos') cargarFavoritosSeccion();
}

// ─── INICIO ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await cargarFavoritosIds();

  // Cargar todas las secciones
  cargarCategoria('populares',  'lista-populares');
  cargarCategoria('top-rated',  'lista-top-rated');
  cargarCategoria('proximos',   'lista-proximos');
  cargarCategoria('en-cines',   'lista-en-cines');

  // Navegación sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-seccion');
      if (id) mostrarSeccion(id);
    });
  });

  // Buscador
  const inputBusqueda = document.getElementById('input-busqueda');
  const btnBuscar = document.getElementById('btn-buscar');
  if (btnBuscar && inputBusqueda) {
    btnBuscar.addEventListener('click', () => {
      const titulo = inputBusqueda.value.trim();
      if (titulo) {
        mostrarSeccion('busqueda');
        buscar(titulo);
      }
    });
    inputBusqueda.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const titulo = inputBusqueda.value.trim();
        if (titulo) {
          mostrarSeccion('busqueda');
          buscar(titulo);
        }
      }
    });
  }

  // Cerrar modal al hacer click fuera
  document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal') cerrarModal();
  });

  // Mostrar sección inicial
  mostrarSeccion('populares');
});
