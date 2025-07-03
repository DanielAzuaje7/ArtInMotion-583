// --- Endpoints ---
const API_CATALOGO = 'http://localhost:5289/api/catalogo';
const API_CREACIONES_PLANTILLAS = 'http://localhost:5289/api/creaciones/plantillas';
const API_CREACIONES_DIBUJOS = 'http://localhost:5289/api/creaciones/dibujos';

let usuarioActivo = localStorage.getItem('usuarioActivo');
let usuario = null;

if (usuarioActivo && usuarioActivo !== "undefined") {
    usuario = JSON.parse(usuarioActivo);
    // Ahora puedes usar el objeto usuario
    console.log("Usuario logueado:", usuario);
} else {
    // No hay usuario logueado
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
                // Extraer solo el nombre de la imagen
                const nombreImagen = url.split('/').pop();
                const img = document.createElement('img');
                img.src = url.startsWith('/') ? 'http://localhost:5289' + url : url;
                img.alt = 'Plantilla';
                img.className = 'plantilla-img';

                img.addEventListener('click', () => {
                    // Redirige a viewPlantilla.html con el nombre de la imagen como parámetro
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

    // Si no hay usuario logueado, muestra mensaje y termina
    if (!usuario || !(usuario.id || usuario.uuid)) {
        gridCreaciones.innerHTML = '<p>Inicia sesión para ver tus creaciones.</p>';
        return;
    }

    // Traer plantillas y dibujos en paralelo
    Promise.all([
        fetch(API_CREACIONES_PLANTILLAS).then(res => res.json()),
        fetch(API_CREACIONES_DIBUJOS).then(res => res.json())
    ])
        .then(([plantillas, dibujos]) => {
            // Unir ambos arrays, agregando el tipo
            const todas = [
                ...plantillas.map(p => ({ ...p, tipo: 'plantilla' })),
                ...dibujos.map(d => ({ ...d, tipo: 'dibujo' }))
            ];

            // Filtrar solo las creaciones del usuario activo
            const idUsuario = usuario.id || usuario.uuid;
            const propias = todas.filter(c => c.idCreador === idUsuario);

            if (propias.length === 0) {
                gridCreaciones.innerHTML = '<p>No hay creaciones guardadas para este usuario.</p>';
                return;
            }

            propias.forEach(creacion => {
                // Determinar la carpeta según el tipo
                const carpeta = creacion.tipo === 'dibujo' ? 'Dibujo' : 'ImagenesUso';
                // Si imagenUrl ya empieza con '/', úsala tal cual; si no, arma la ruta
                const imagenUrl = creacion.imagenUrl && creacion.imagenUrl.startsWith('/')
                    ? `http://localhost:5289${creacion.imagenUrl}`
                    : `http://localhost:5289/${carpeta}/${creacion.imagenUrl}`;

                const div = document.createElement('div');
                div.style.display = 'inline-block';
                div.style.margin = '10px';
                div.style.border = '1px solid #ccc';
                div.style.padding = '10px';
                div.style.textAlign = 'center';
                div.innerHTML = `
                <img src="${imagenUrl}" alt="${creacion.nombreCreacion}" style="width:100px;"><br>
                <span>${creacion.nombreCreacion}</span><br>
                <span>Puntaje: ${creacion.puntaje ?? ''}</span><br>
                <button onclick="eliminarCreacion('${creacion.tipo}','${creacion.nombreCreacion}')">Eliminar</button>
                <select onchange="calificarCreacion('${creacion.tipo}','${creacion.nombreCreacion}', this.value)">
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

// Eliminar una creación (plantilla o dibujo)
function eliminarCreacion(tipo, nombre) {
    if (!confirm('¿Eliminar esta creación?')) return;
    fetch(`http://localhost:5289/api/creaciones/${tipo}/${encodeURIComponent(nombre)}`, {
        method: 'DELETE'
    })
        .then(() => cargarCreaciones());
}

// Calificar una creación (plantilla o dibujo)
function calificarCreacion(tipo, nombre, calificacion) {
    const payload = {
        tipo: tipo,
        nombre: nombre,
        idCreador: usuario.id || usuario.uuid,
        calificacion: parseInt(calificacion)
    };
    console.log('Payload enviado:', payload);

    fetch('http://localhost:5289/api/creaciones/calificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => cargarCreaciones());
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
    cargarCreaciones();
});
