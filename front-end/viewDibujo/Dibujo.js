
document.addEventListener('DOMContentLoaded', () => {
const $ = selector => document.querySelector(selector);

// Elementos
const $canvas =$('#canvas');
const ctx = $canvas?.getContext('2d');
const $colorPicker = $('#color-picker');
const $lineWidthSlider = $('#line-width-slider');
const $drawBtn = $('#draw-btn');
const $eraserBtn = $('#eraser-btn');
const $rectangleBtn = $('#rectangle-btn');
const $ellipseBtn = $('#ellipse-btn');

// Función para cargar imagen desde localStorage
function cargarImagenParaEditar() {
    const imagenAEditar = localStorage.getItem('imagenAEditar');
    if (imagenAEditar && imagenAEditar !== 'null' && imagenAEditar !== 'undefined') {
        try {
            const imagen = JSON.parse(imagenAEditar);
            console.log('Intentando cargar imagen para editar:', imagen);
            
            // Verificar que el canvas esté listo
            if (!$canvas || !ctx) {
                console.error('Canvas no está listo');
                return;
            }
            
            const img = new Image();
            img.onload = function() {
                console.log('Imagen cargada exitosamente, dimensiones:', img.width, 'x', img.height);
                console.log('Canvas dimensiones:', $canvas.width, 'x', $canvas.height);
                
                // Limpiar el canvas
                ctx.clearRect(0, 0, $canvas.width, $canvas.height);
                
                // Calcular dimensiones para mantener proporción
                const canvasAspect = $canvas.width / $canvas.height;
                const imgAspect = img.width / img.height;
                
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
                
                if (imgAspect > canvasAspect) {
                    // Imagen más ancha que el canvas
                    drawWidth = $canvas.width;
                    drawHeight = $canvas.width / imgAspect;
                    offsetY = ($canvas.height - drawHeight) / 2;
                } else {
                    // Imagen más alta que el canvas
                    drawHeight = $canvas.height;
                    drawWidth = $canvas.height * imgAspect;
                    offsetX = ($canvas.width - drawWidth) / 2;
                }
                
                // Dibujar la imagen en el canvas centrada
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                console.log('Imagen dibujada en el canvas exitosamente');
                
                // Limpiar localStorage después de cargar la imagen
                localStorage.removeItem('imagenAEditar');
            };
            img.onerror = function(error) {
                console.error('Error al cargar la imagen:', imagen.url, error);
                alert('Error al cargar la imagen para editar. Verifica la consola para más detalles.');
                // Limpiar localStorage en caso de error
                localStorage.removeItem('imagenAEditar');
            };
            
            // Cargar la imagen
            img.src = imagen.url;
        } catch (error) {
            console.error('Error al parsear la imagen del localStorage:', error);
            // Limpiar localStorage en caso de error
            localStorage.removeItem('imagenAEditar');
        }
    } else {
        console.log('No hay imagen para editar - Canvas vacío listo para dibujar');
    }
}


// Verifica que todos los elementos existen
if (!$canvas || !ctx || !$colorPicker || !$lineWidthSlider || !$drawBtn || !$eraserBtn || !$rectangleBtn || !$ellipseBtn) {
  console.error('Falta algún elemento en el HTML. Revisa los IDs y que el JS se cargue después del DOM.');
} else {
  // Modos
  const MODES = {
    DRAW: 'draw',
    ERASE: 'erase',
    RECTANGLE: 'rectangle',
    ELLIPSE: 'ellipse'
  };

  let mode = MODES.DRAW;
  let isDrawing = false;
  let startX = 0, startY = 0, lastX = 0, lastY = 0, endX = 0, endY = 0;
  let previewImage = null;

  // Configuración inicial
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = $colorPicker.value;
  ctx.lineWidth = $lineWidthSlider.value;

  // Cambiar color
  $colorPicker.addEventListener('input', e => {
    ctx.strokeStyle = e.target.value;
  });

  // Cambiar grosor
  $lineWidthSlider.addEventListener('input', e => {
    ctx.lineWidth = e.target.value;
  });

  // Botones de modo
  $drawBtn.addEventListener('click', () => setMode(MODES.DRAW));
  $eraserBtn.addEventListener('click', () => setMode(MODES.ERASE));
  $rectangleBtn.addEventListener('click', () => setMode(MODES.RECTANGLE));
  $ellipseBtn.addEventListener('click', () => setMode(MODES.ELLIPSE));
  

  function setMode(newMode) {
    mode = newMode;
    [$drawBtn, $eraserBtn, $rectangleBtn, $ellipseBtn].forEach(btn => btn.classList.remove('active'));
    if (mode === MODES.DRAW) $drawBtn.classList.add('active');
    if (mode === MODES.ERASE) $eraserBtn.classList.add('active');
    if (mode === MODES.RECTANGLE) $rectangleBtn.classList.add('active');
    if (mode === MODES.ELLIPSE) $ellipseBtn.classList.add('active');
  }

  // Eventos de canvas
  $canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { offsetX, offsetY } = e;
    startX = lastX = offsetX;
    startY = lastY = offsetY;
    if (mode === MODES.RECTANGLE || mode === MODES.ELLIPSE) {
      // Guarda la imagen para previsualización
      previewImage = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
    }
    if (mode === MODES.ERASE) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  $canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e;

    if (mode === MODES.DRAW) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      lastX = offsetX;
      lastY = offsetY;
    } else if (mode === MODES.ERASE) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      lastX = offsetX;
      lastY = offsetY;
    } else if (mode === MODES.RECTANGLE || mode === MODES.ELLIPSE) {
      // Previsualización
      ctx.putImageData(previewImage, 0, 0);
      endX = offsetX;
      endY = offsetY;
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      if (mode === MODES.RECTANGLE) {
        ctx.rect(startX, startY, endX - startX, endY - startY);
      } else if (mode === MODES.ELLIPSE) {
        const centerX = (startX + endX) / 2;
        const centerY = (startY + endY) / 2;
        const radiusX = Math.abs((endX - startX) / 2);
        const radiusY = Math.abs((endY - startY) / 2);
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  $canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    const { offsetX, offsetY } = e;
    if (mode === MODES.RECTANGLE || mode === MODES.ELLIPSE) {
      ctx.putImageData(previewImage, 0, 0);
      ctx.beginPath();
      if (mode === MODES.RECTANGLE) {
        ctx.rect(startX, startY, offsetX - startX, offsetY - startY);
      } else if (mode === MODES.ELLIPSE) {
        const centerX = (startX + offsetX) / 2;
        const centerY = (startY + offsetY) / 2;
        const radiusX = Math.abs((offsetX - startX) / 2);
        const radiusY = Math.abs((offsetY - startY) / 2);
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  });

  $canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    ctx.globalCompositeOperation = 'source-over';
  });

  // Cargar imagen para editar si existe en localStorage (después de configurar todo)
  setTimeout(() => {
    cargarImagenParaEditar();
  }, 100);

}

const $saveBtn = document.getElementById('save-btn');
if ($saveBtn) {
  $saveBtn.addEventListener('click', () => {
    const nombre = prompt("Ingresa el nombre del dibujo:", "MiDibujo");
    if (!nombre) return;

    const $canvas = document.getElementById('canvas');
    if (!$canvas) return alert('No se encontró el canvas');

    const imagenBase64 = $canvas.toDataURL('image/png');
    
    
    sessionStorage.setItem('dibujoPendiente', JSON.stringify({
      nombre,
      imagenBase64
    }));

    verificarSesionYGuardar((usuario) => {
      // Si está logueado, guardar directamente
      guardarDibujo(usuario, nombre, imagenBase64);
    });
  });
}

function guardarDibujo(usuario, nombre, imagenBase64) {
  fetch('http://localhost:5289/api/dibujo/guardar-simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: `${nombre}_${usuario.uuid}`,
      imagenBase64: imagenBase64
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!data || !data.ruta) {
      alert('Error al guardar el dibujo');
      return;
    }

     sessionStorage.setItem('dibujoGuardadoExito', data.ruta);
    if (confirm("Dibujo guardado exitosamente.\nRuta: " + data.ruta )) {
      window.location.href = " http://localhost:5289/front-end/viewCatalogo/index.html"; // Cambia la ruta si es necesario
    }
  })
  .catch(err => alert('Error al guardar el dibujo: ' + err.message));
}})
function verificarSesionYGuardar(callback) {
  let usuarioActivo = localStorage.getItem("usuarioActivo");
  if (!usuarioActivo || usuarioActivo === "undefined") {
    const irALogin = confirm("Debes estar registrado para guardar tu dibujo. ¿Deseas iniciar sesión ahora?");
    if (irALogin) {
      window.location.href = "../viewUsuario/login.html";
    }
    return;
  }

  const usuario = JSON.parse(usuarioActivo);
  if (!usuario || !usuario.uuid || usuario.uuid === ".") {
    const irALogin = confirm("Tu sesión no es válida. ¿Deseas iniciar sesión de nuevo?");
    if (irALogin) {
      window.location.href = "../viewUsuario/login.html";
    }
    return;
  }

  callback(usuario);
}

let usuarioActivo = localStorage.getItem('usuarioActivo');
let usuario = null;
console.log(usuarioActivo);

if (usuarioActivo && usuarioActivo !== "undefined") {
  usuario = JSON.parse(usuarioActivo);
  
  console.log("Usuario logueado:", usuario);
} else {
  
  console.log("No hay usuario en sesión");
}