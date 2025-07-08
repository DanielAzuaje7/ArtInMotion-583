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

                // Crea un contenedor para la imagen y el botón (si aplica)
                const contenedor = document.createElement('div');
                contenedor.style.display = 'inline-block';
                contenedor.style.margin = '10px';
                contenedor.style.textAlign = 'center';

                img.addEventListener('click', () => {
                    localStorage.setItem("modoPlantilla", "nueva");
                    window.location.href = '../viewPlantilla/index.html?imagen=' + encodeURIComponent(nombreImagen);
                });

                contenedor.appendChild(img);

                // Si el usuario es admin y la imagen comienza por "subida", agrega el botón eliminar
                if (
                    usuario &&
                    usuario.uuid === "24b771c0-6299-43e4-9918-43ec220f5ce3" &&
                    nombreImagen.toLowerCase().startsWith("subida")
                ) {
                    const btnEliminar = document.createElement('button');
                    btnEliminar.textContent = 'Eliminar';
                    btnEliminar.style.display = 'block';
                    btnEliminar.style.margin = '8px auto 0 auto';
                    btnEliminar.addEventListener('click', (e) => {
                        e.stopPropagation(); // Evita que se dispare el click de la imagen
                        // Aquí llamas a tu función de eliminar imagen, por ejemplo:
                        eliminarImagenDelCatalogo(nombreImagen, contenedor);
                    });
                    contenedor.appendChild(btnEliminar);
                }

                catalogo.appendChild(contenedor);
            });
        })
        .catch(error => {
            console.error('Error al cargar el catálogo:', error);
            catalogo.innerHTML = '<p>Error al cargar el catálogo de plantillas.</p>';
        });
}

// --- Subida de nueva plantilla ---
document.addEventListener('DOMContentLoaded', function() {
    const btnAgregar = document.getElementById('btnAgregarPlantilla');
    const inputPlantilla = document.getElementById('inputPlantilla');

    if (btnAgregar && inputPlantilla) {
        btnAgregar.addEventListener('click', function() {
            inputPlantilla.click();
        });

        inputPlantilla.addEventListener('change', function(event) {
            const archivo = event.target.files[0];
            if (!archivo) return;

            // Validación opcional en el frontend (tipo/tamaño)
            if (!archivo.type.startsWith('image/')) {
                alert('Solo puedes subir imágenes.');
                return;
            }
            if (archivo.size > 5 * 1024 * 1024) { // 5MB máximo, puedes ajustar
                alert('La imagen es demasiado grande (máx 5MB).');
                return;
            }

            const formData = new FormData();
            formData.append('archivo', archivo);

            fetch('http://localhost:5289/api/catalogo/subir', {
                method: 'POST',
                body: formData
            })
            .then(resp => {
                if (!resp.ok) throw new Error('Error al subir la imagen');
                return resp.json();
            })
            .then(data => {
                alert('¡Plantilla agregada correctamente!');
                cargarCatalogo(); // Recarga el catálogo para mostrar la nueva imagen
                inputPlantilla.value = ""; // Limpia el input
            })
            .catch(err => {
                alert('Error al subir la plantilla: ' + err.message);
            });
        });
    }
});

// --- Creaciones (Plantillas + Dibujos) ---
function cargarCreaciones() {
    const gridCreaciones = document.getElementById('grid-creaciones');
    gridCreaciones.innerHTML = '';

    if (!usuario || !(usuario.id || usuario.uuid)) {
        console.log('Welcome');
        gridCreaciones.innerHTML = '<p>Inicia sesión para ver tus creaciones.</p>';
        return;
    }

    if (usuario.uuid=='24b771c0-6299-43e4-9918-43ec220f5ce3') {
        console.log('Welcome, Overlord');
        document.getElementById('mis-creaciones-h2').innerHTML = 'Creaciones';
        cargarCreacionesAdmin();
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

                div.innerHTML = `
                    <img src="${imagenUrl}" alt="${creacion.nombreCreacion}" id="img-${creacion.tipo}-${nombreImagen}" style="width:100px;cursor:${creacion.tipo === 'dibujo' ? 'default' : 'pointer'}" ${creacion.tipo === 'plantilla' ? `onclick="abrirPlantillaEditar('${nombreImagen}')"` : ''}><br>
                    <span>${creacion.nombreCreacion}</span><br>
                    <span>Puntaje: ${creacion.puntaje ?? ''}</span><br>
                    <button onclick="eliminarCreacion('${creacion.tipo}','${nombreImagen}')">Eliminar</button>
                    ${creacion.tipo === 'dibujo' ? `<button onclick="editarCreacionDibujo('${creacion.tipo}','${creacion.nombreCreacion}')">Editar</button>` : ''}
                    <select onchange="descargarCreacion('${imagenUrl}', this.value, '${creacion.nombreCreacion}')">
                        <option value="">Descargar como...</option>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="webp">WebP</option>
                    </select>
                    <select onchange="calificarCreacion('${creacion.tipo}','${creacion.imagenUrl}', this.value)">
                        <option value="0">Calificar</option>
                        ${[1, 2, 3, 4, 5].map(i => `<option value="${i}" ${creacion.puntaje == i ? 'selected' : ''}>${i} ⭐</option>`).join('')}
                    </select>
                `;
                gridCreaciones.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error al cargar las creaciones:', error);
            gridCreaciones.innerHTML = '<p>Error al cargar las creaciones.</p>';
        });
}

function cargarCreacionesAdmin() {
    const gridCreaciones = document.getElementById('grid-creaciones');
    gridCreaciones.innerHTML = '';

    // Ya no verificamos usuario

    Promise.all([
        fetch(API_CREACIONES_PLANTILLAS).then(res => res.json()),
        fetch(API_CREACIONES_DIBUJOS).then(res => res.json())
    ])
        .then(([plantillas, dibujos]) => {
            // Unimos todas las creaciones y marcamos su tipo
            const todas = [
                ...plantillas.map(p => ({ ...p, tipo: 'plantilla' })),
                ...dibujos.map(d => ({ ...d, tipo: 'dibujo' }))
            ];

            // Guardamos todas las creaciones en localStorage (opcional)
            localStorage.setItem('creacionesCatalogo', JSON.stringify(todas));

            if (todas.length === 0) {
                gridCreaciones.innerHTML = '<p>No hay creaciones guardadas.</p>';
                return;
            }

            todas.forEach(creacion => {
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

                div.innerHTML = `
                    <img src="${imagenUrl}" alt="${creacion.nombreCreacion}" id="img-${creacion.tipo}-${nombreImagen}" style="width:100px;cursor:${creacion.tipo === 'dibujo' ? 'default' : 'pointer'}" ${creacion.tipo === 'plantilla' ? `onclick="abrirPlantillaEditar('${nombreImagen}')"` : ''}><br>
                    <span>${creacion.nombreCreacion}</span><br>
                    <span>Puntaje: ${creacion.puntaje ?? ''}</span><br>
                    <span>Creador: ${creacion.idCreador ?? 'Desconocido'}</span><br>
                    <button onclick="eliminarCreacion('${creacion.tipo}','${nombreImagen}')">Eliminar</button>
                    ${creacion.tipo === 'dibujo' ? `<button onclick="editarCreacionDibujo('${creacion.tipo}','${creacion.nombreCreacion}')">Editar</button>` : ''}
                    <select onchange="descargarCreacion('${imagenUrl}', this.value, '${creacion.nombreCreacion}')">
                        <option value="">Descargar como...</option>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="webp">WebP</option>
                    </select>
                    <select onchange="calificarCreacion('${creacion.tipo}','${creacion.imagenUrl}', this.value)">
                        <option value="0">Calificar</option>
                        ${[1, 2, 3, 4, 5].map(i => `<option value="${i}" ${creacion.puntaje == i ? 'selected' : ''}>${i} ⭐</option>`).join('')}
                    </select>
                `;
                gridCreaciones.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error al cargar las creaciones:', error);
            gridCreaciones.innerHTML = '<p>Error al cargar las creaciones.</p>';
        });
}


// --- Descargar en formato seleccionado (PNG, JPG, WebP) ---
function descargarCreacion(url, formato, nombreDescarga) {
    if (!formato) return;

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        // Fondo blanco solo para JPG
        if (formato === 'jpg' || formato === 'jpeg') {
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Dibuja la imagen encima
        ctx.drawImage(img, 0, 0);

        let mime = 'image/png';
        let ext = 'png';
        if (formato === 'jpg' || formato === 'jpeg') {
            mime = 'image/jpeg'; ext = 'jpg';
        } else if (formato === 'webp') {
            mime = 'image/webp'; ext = 'webp';
        }
        const link = document.createElement('a');
        link.href = canvas.toDataURL(mime);
        link.download = `${nombreDescarga}.${ext}`;
        link.click();
    };

    img.onerror = function () {
        alert('No se pudo cargar la imagen para descargar.');
    };
}

// --- Eliminar una creación (plantilla o dibujo) ---
function eliminarCreacion(tipo, nombre) {
    if (!confirm('¿Eliminar esta creación?')) return;
    fetch(`http://localhost:5289/api/creaciones/${tipo}/${encodeURIComponent(nombre)}`, {
        method: 'DELETE'
    })
        .then(() => cargarCreaciones());
}

// --- Calificar una creación (plantilla o dibujo) ---
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

// --- Editar plantilla (redirige a edición de plantilla) ---
function abrirPlantillaEditar(nombreImagen) {
    localStorage.setItem("modoPlantilla", "editar");
    window.location.href = '../viewPlantilla/index.html?imagen=' + encodeURIComponent(nombreImagen);
}

// --- Editar dibujo (redirige a edición de dibujo) ---
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
    window.location.href = 'http://localhost:5289/front-end/viewCatalogo/index.html';
}

// --- Abrir canvas vacío para crear dibujo nuevo ---
function abrirCanvasVacio() {
    localStorage.removeItem('imagenAEditar');
    window.location.href = 'http://localhost:5289/front-end/viewCatalogo/index.html';
}

// --- Inicialización ---
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

function eliminarImagenDelCatalogo(nombreImagen, contenedor) {
    if (confirm(`¿Seguro que quieres eliminar la imagen "${nombreImagen}"?`)) {
        // Aquí deberías hacer un fetch al endpoint de borrado en tu backend
        // Por ejemplo:
        fetch(`http://localhost:5289/api/catalogo/eliminar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ NombreImagen: nombreImagen })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.mensaje === 'imagenEliminada') {
                contenedor.remove(); // Quita el contenedor de la imagen eliminada
                alert('Imagen eliminada correctamente.');
            } else {
                alert('No se pudo eliminar la imagen.');
            }
        })
        .catch(err => {
            alert('Error al eliminar la imagen.');
        });
    }
}
