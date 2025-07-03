// Obtiene el nombre de la imagen desde la URL 
function getNombreImagenDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('imagen') || 'img.jpg'; // Valor por defecto si no hay parámetro
}

const nombreImagenGlobal = getNombreImagenDesdeURL();
//Esto es para poder guardar la plantilla
usuarioActivo = localStorage.getItem("usuarioActivo");
usuario = null;
if (usuarioActivo&& usuarioActivo !== "undefined") {
  usuario = JSON.parse(usuarioActivo);
  console.log(usuario);
}

async function restaurarImagenAUso(nombreImagen, idUsuario = "") {
  try {
    const response = await fetch(
      `http://localhost:5289/api/imagen/restaurar?nombreImagen=${encodeURIComponent(nombreImagen)}&idUsuario=${encodeURIComponent(idUsuario)}`,
      { method: "POST" }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || "Error al restaurar la imagen.");
    }
    const data = await response.json();
    const nuevoNombre = data.nombre;
    console.log("Imagen restaurada correctamente. Nuevo nombre:", nuevoNombre);
    obtenerImagen(nuevoNombre);
    return nuevoNombre;
  } catch (error) {
    console.log("Error al restaurar la imagen:", error.message);
  }
}
async function obtenerImagen(nuevoNombre) {
  try {
    const response = await fetch(`http://localhost:5289/api/imagen/obtener?nombreImagen=${nuevoNombre}`, { method: "GET" });
    if (!response.ok) throw new Error("Error al obtener la imagen del servidor");
    const blob = await response.blob();
    document.getElementById("imagenCargada").src = URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error al cargar la imagen:", error);
  }
}

let colorSeleccionado = "#ff0000"; // este es el color que se usa para pintar las cosas

function crearPaletaColores(colores) {
  const paletaColores = document.getElementById("paletaColores");
  if (!paletaColores) {
    console.error("Elemento 'paletaColores' no encontrado.");
    return;
  }
  let filaActual = document.createElement("div");
  filaActual.style.display = "flex";
  filaActual.style.gap = "10px";
  filaActual.style.marginBottom = "10px";
  paletaColores.appendChild(filaActual);

  colores.forEach((color, index) => {
    const boton = document.createElement("button");
    boton.style.backgroundColor = color;
    boton.id = `color-${index}`;
    boton.style.width = boton.style.height = "40px";

    boton.style.borderRadius = "50%";
    boton.style.border = "none";
    boton.style.cursor = "pointer";
    // Al hacer clic en un botón, se selecciona ese color
    boton.addEventListener("click", () => {
      colorSeleccionado = color;
    });
    filaActual.appendChild(boton);
    if ((index + 1) % 3 === 0 && index !== colores.length - 1) {
      filaActual = document.createElement("div");
      filaActual.style.display = "flex";
      filaActual.style.gap = "10px";
      filaActual.style.marginBottom = "10px";
      paletaColores.appendChild(filaActual);
    }
  });
  // Boton borrar (blanco)
  const botonBorrar = document.createElement("button");
  botonBorrar.style.backgroundColor = "#ffffff";
  botonBorrar.id = "borra";
  botonBorrar.textContent = "Borra";
  botonBorrar.style.width = botonBorrar.style.height = "40px";
  botonBorrar.style.borderRadius = "50%";
  botonBorrar.style.border = "2px solid #888";
  botonBorrar.style.cursor = "pointer";
  botonBorrar.addEventListener("click", () => {
    colorSeleccionado = "#ffffff";
  });
  filaActual.appendChild(botonBorrar);
  // Botón Guardar
  const botonGuardar = document.createElement("button");
  botonGuardar.id = "btGuardar";
  botonGuardar.textContent = "Guardar";
  botonGuardar.style.width = "80px";
  botonGuardar.style.height = "40px";
  botonGuardar.style.marginLeft = "10px";
  botonGuardar.style.borderRadius = "10px";
  botonGuardar.style.border = "2px solid #888";
  botonGuardar.style.marginTop = "260px";
  botonGuardar.style.cursor = "pointer";
  filaActual.appendChild(botonGuardar)
}

async function aplicarColor(nombreImagen, colorHex, x, y) {
  try {
    const url = `http://localhost:5289/api/imagen/pintaryborra?nombreImagen=${encodeURIComponent(nombreImagen)}&colorHex=${encodeURIComponent(colorHex)}&x=${x}&y=${y}`;
    const response = await fetch(url, { method: "POST" });  
    if (!response.ok) throw new Error("Error al procesar la imagen con el color");
    const blob = await response.blob();
    const linkImagen = URL.createObjectURL(blob);
    const imagenElemento = document.getElementById("imagenCargada");
    if (imagenElemento) imagenElemento.src = linkImagen;
    else console.error("Elemento 'imagenCargada' no encontrado.");
  } catch (error) {
    console.error("Error al aplicar color:", error);
  }
}
//Esto es para guardar la plantilla cuando este loguado o no 
async function guardarPlantillaEnBackend(nombreImagenGlobal, idUsuario, colores, nombreImagen) {
  const plantilla = {
    NombreCreacion: nombreImagenGlobal,
    IdCreador: idUsuario,
    Puntaje: 1,
    PaletaColores: colores,
    ImagenUrl: nombreImagen
  };
  try {
    const response = await fetch("http://localhost:5289/api/plantilla/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(plantilla)
    });
    if (!response.ok) throw new Error("Error al guardar la plantilla en el servidor");
    await response.json();
    alert("¡El dibujo se ha guardado correctamente!");
    window.location.href = "http://localhost:5289/front-end/viewCatalogo/index.html";
  } catch (error) {
    console.error("Error al guardar plantilla:", error);
  }
}

function guardarImagen(nombreImagenGlobal, nombreImagen, idUsuario, colores) {
  const primerGuion = nombreImagen.indexOf('_');
  const segundoGuion = nombreImagen.indexOf('_', primerGuion + 1);
  let valorDespuesSegundoGuion = "";
  if (segundoGuion !== -1) {
    valorDespuesSegundoGuion = nombreImagen.substring(segundoGuion + 1);
    const punto = valorDespuesSegundoGuion.lastIndexOf('.');
    if (punto !== -1) {
      valorDespuesSegundoGuion = valorDespuesSegundoGuion.substring(0, punto);
    }
    console.log("Valor después del segundo guion (sin extensión):", valorDespuesSegundoGuion);
  }
  if (valorDespuesSegundoGuion == ".") {
    // Guardar datos pendientes en sessionStorage
    sessionStorage.setItem("plantillaPendiente", JSON.stringify({nombreImagenGlobal,nombreImagen,colores}));
    if (confirm("Debe registrarse para guardar la plantilla. ¿Desea registrarse?")) {
      window.location.href = "http://localhost:5289/front-end/viewUsuario/login.html";
    }
  } else {
    guardarPlantillaEnBackend(nombreImagenGlobal, idUsuario, colores, nombreImagen);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  let nombreImagen = nombreImagenGlobal;
  let idUsuario = usuario && usuario.uuid ? usuario.uuid : "."; 
  console.log("variable usuario id",idUsuario);
  nombreImagen = await restaurarImagenAUso(nombreImagen,idUsuario);
  const colores = ["#ff0000", "#00ff00", "#0000ff", "#ffcc00", "#ff00ff"];// Rojo Verde Azul Amarillo Fucsia
  crearPaletaColores(colores);
  const imagenElemento = document.getElementById("imagenCargada");
  const botonGuardar=document.getElementById("btGuardar");
  const botonVolver=document.getElementById("volver-btn");
  let bloqueado = false;
  imagenElemento.addEventListener("click", async function(event) {
    if (bloqueado) return;
      bloqueado = true;
      const rect = imagenElemento.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) * imagenElemento.naturalWidth / rect.width);
      const y = Math.floor((event.clientY - rect.top) * imagenElemento.naturalHeight / rect.height);
      await aplicarColor(nombreImagen, colorSeleccionado, x, y);
      if (colorSeleccionado === "#ffffff") {
        alert("Estás usando el borrador. Si la zona ya está en blanco, no pasará nada.");
      }
      bloqueado = false;
  });

  botonGuardar.addEventListener("click", async function(event) {
    if (confirm("¿Está seguro de guardar la plantilla coloreada?")) {
      // Si el usuario no está logueado, guarda también el nombreImagen actualizado
      if (idUsuario === ".") {
        sessionStorage.setItem("nombreImagenRestaurada", nombreImagen);
      }
      guardarImagen(nombreImagenGlobal, nombreImagen, idUsuario, colores);
    }
  });
 
 
});
// Funcion Global
window.guardarPlantillaEnBackend = guardarPlantillaEnBackend;

