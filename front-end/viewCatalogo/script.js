// --- Endpoints ---
const API_CATALOGO = 'http://localhost:5289/api/catalogo';
const API_CREACIONES_PLANTILLAS = 'http://localhost:5289/api/creaciones/plantillas';
const API_CREACIONES_DIBUJOS = 'http://localhost:5289/api/creaciones/dibujos';

let usuarioActivo = localStorage.getItem('usuarioActivo');
let usuario = null;

if (usuarioActivo && usuarioActivo !== "undefined") {
    usuario = JSON.parse(usuarioActivo);
    console.log("Usuario logueado:", usuario);
} else {
    console.log("No hay usuario en sesión");
}

// --- Catálogo de Plantillas ---
function cargarCatalogo() {
    const catalogo = document.getElementById('grid-plantillas');
    catalogo.innerHTML = '';

    fetch(API_CATALOGO)
        .then(response => response.json())
        .then(imagenes => {
            if (imagenes.length === 0) {
                catalogo.innerHTML = '<p>No hay plantillas disponibles.</p>';
                return;
            }

            imagenes.forEach(url => {
                const nombreImagen = url.split('/').pop();
                const img = document.createElement('img');
                img.src = url.startsWith('/') ? 'http://localhost:5289' + url : url;
                img.alt = 'Plantilla';
                img.className = 'plantilla-img';

                img.addEventListener('click', () => {
                    localStorage.setItem("modoPlantilla", "nueva");
                    window.location.href = '../viewPlantilla/index.html?imagen=' + encodeURIComponent(nombreImagen);
                });

                catalogo.appendChild(img);
            });
        })
        .catch(error => {
            console.error('Error al cargar el catálogo:', error);
            catalogo.innerHTML = '<p>Error al cargar el catálogo de plantillas.</p>';
        });
}

// --- Creaciones (Plantillas + Dibujos) ---
function cargarCreaciones() {
    const gridCreaciones = document.getElementById('grid-creaciones');
    gridCreaciones.innerHTML = '';

    if (!usuario || !(usuario.id || usuario.uuid)) {
        gridCreaciones.innerHTML = '<p>Inicia sesión para ver tus creaciones.</p>';
        return;
    }

    Promise.all([
        fetch(API_CREACIONES_PLANTILLAS).then(res => res.json()),
        fetch(API_CREACIONES_DIBUJOS).then(res => res.json())
    ])
        .then(([plantillas, dibujos]) => {
            const todas = [
                ...plantillas.map(p => ({ ...p, tipo: 'plantilla' })),
                ...dibujos.map(d => ({ ...d, tipo: 'dibujo' }))
            ];

            const idUsuario = usuario.id || usuario.uuid;
            const propias = todas.filter(c => c.idCreador === idUsuario);

            // Guardar para edición de dibujos desde localStorage
            localStorage.setItem('creacionesCatalogo', JSON.stringify(propias));

            if (propias.length === 0) {
                gridCreaciones.innerHTML = '<p>No hay creaciones guardadas para este usuario.</p>';
                return;
            }

            propias.forEach(creacion => {
                const carpeta = creacion.tipo === 'dibujo' ? 'Dibujo' : 'ImagenesUso';
                const nombreImagen = creacion.imagenUrl ? creacion.imagenUrl.split('/').pop() : '';
                let imagenUrl;
                if (creacion.tipo === 'dibujo') {
                    imagenUrl = creacion.imagenUrl && creacion.imagenUrl.startsWith('/')
                        ? `http://localhost:5289${creacion.imagenUrl}?t=${Date.now()}`
                        : `http://localhost:5289/Dibujo/${nombreImagen}?t=${Date.now()}`;
                } else {
                    imagenUrl = creacion.imagenUrl && creacion.imagenUrl.startsWith('/')
                        ? `http://localhost:5289${creacion.imagenUrl}?t=${Date.now()}`
                        : `http://localhost:5289/api/imagen/imagen-sin-cache?nombreImagen=${encodeURIComponent(nombreImagen)}&t=${Date.now()}`;
                }

                const div = document.createElement('div');
                div.style.display = 'inline-block';
                div.style.margin = '10px';
                div.style.border = '1px solid #ccc';
                div.style.padding = '10px';
                div.style.textAlign = 'center';

                if (creacion.tipo === 'dibujo') {
                    div.innerHTML = `
                        <img src="${imagenUrl}" alt="${creacion.nombreCreacion}" style="width:100px;cursor:default"><br>
                        <span>${creacion.nombreCreacion}</span><br>
                        <span>Puntaje: ${creacion.puntaje ?? ''}</span><br>
                        <button onclick="eliminarCreacion('${creacion.tipo}','${nombreImagen}')">Eliminar</button>
                        <button onclick="editarCreacionDibujo('${creacion.tipo}','${creacion.nombreCreacion}')">Editar</button>
                        <select onchange="calificarCreacion('${creacion.tipo}','${creacion.imagenUrl}', this.value)">
                            <option value="0">Calificar</option>
                            ${[1, 2, 3, 4, 5].map(i => `<option value="${i}" ${creacion.puntaje == i ? 'selected' : ''}>${i} ⭐</option>`).join('')}
                        </select>
                    `;
                } else {
                    div.innerHTML = `
                        <img src="${imagenUrl}" alt="${creacion.nombreCreacion}" style="width:100px;cursor:pointer"
                        onclick="abrirPlantillaEditar('${nombreImagen}')"><br>
                        <span>${creacion.nombreCreacion}</span><br>
                        <span>Puntaje: ${creacion.puntaje ?? ''}</span><br>
                        <button onclick="eliminarCreacion('${creacion.tipo}','${nombreImagen}')">Eliminar</button>
                        <select onchange="calificarCreacion('${creacion.tipo}','${creacion.imagenUrl}', this.value)">
                            <option value="0">Calificar</option>
                            ${[1, 2, 3, 4, 5].map(i => `<option value="${i}" ${creacion.puntaje == i ? 'selected' : ''}>${i} ⭐</option>`).join('')}
                        </select>
                    `;
                }
                gridCreaciones.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error al cargar las creaciones:', error);
            gridCreaciones.innerHTML = '<p>Error al cargar las creaciones.</p>';
        });
}

// Eliminar una creación (plantilla o dibujo)
function eliminarCreacion(tipo, nombre) {
    if (!confirm('¿Eliminar esta creación?')) return;
    fetch(`http://localhost:5289/api/creaciones/${tipo}/${encodeURIComponent(nombre)}`, {
        method: 'DELETE'
    })
        .then(() => cargarCreaciones());
}

// Calificar una creación (plantilla o dibujo)
function calificarCreacion(tipo, imagenUrl, calificacion) {
    const payload = {
        tipo: tipo,
        imagenUrl: imagenUrl,
        idCreador: usuario.id || usuario.uuid,
        calificacion: parseInt(calificacion)
    };
    fetch('http://localhost:5289/api/creaciones/calificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => cargarCreaciones());
}

// Editar plantilla (redirige a edición de plantilla)
function abrirPlantillaEditar(nombreImagen) {
    localStorage.setItem("modoPlantilla", "editar");
    window.location.href = '../viewPlantilla/index.html?imagen=' + encodeURIComponent(nombreImagen);
}

// Editar dibujo (redirige a edición de dibujo)
function editarCreacionDibujo(tipo, nombre) {
    if (tipo !== 'dibujo') return;
    const creaciones = JSON.parse(localStorage.getItem('creacionesCatalogo') || '[]');
    const creacion = creaciones.find(c => c.tipo === tipo && c.nombreCreacion === nombre);
    if (!creacion) {
        alert('No se encontró la creación');
        return;
    }
    const carpeta = 'Dibujo';
    const imagenUrl = creacion.imagenUrl && creacion.imagenUrl.startsWith('/')
        ? `http://localhost:5289${creacion.imagenUrl}`
        : `http://localhost:5289/${carpeta}/${creacion.imagenUrl}`;

    const imagenAEditar = {
        url: imagenUrl,
        nombre: nombre,
        tipo: tipo
    };
    localStorage.setItem('imagenAEditar', JSON.stringify(imagenAEditar));
    window.location.href = '../viewDibujo/index.html';
}

// Abrir canvas vacío para crear dibujo nuevo
function abrirCanvasVacio() {
    localStorage.removeItem('imagenAEditar');
    window.location.href = '../viewDibujo/index.html';
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
    cargarCreaciones();

    // Si hay parámetro de reload, forzar recarga de creaciones
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reload')) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            cargarCreaciones();
        }, 100);
    }
});
