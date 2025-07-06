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
let coloresPersonalizados = Array(10).fill(null); // 10 espacios para colores personalizados
function crearPaletaColores(colores) {
  if (!Array.isArray(colores)) {
    colores = ["#ff0000", "#00ff00", "#0000ff", "#ffcc00", "#ff00ff"]; // Colores por defecto
  }
  
  const paletaColores = document.getElementById("paletaColores");
  if (!paletaColores) {
    console.error("Elemento 'paletaColores' no encontrado.");
    return;
  }
  paletaColores.innerHTML = "";

  // Haz que el contenedor principal sea una columna
  paletaColores.style.display = "flex";
  paletaColores.style.flexDirection = "column";
  paletaColores.style.alignItems = "center";

  // Contenedor para las filas de colores
  const contenedorFilas = document.createElement("div");
  contenedorFilas.style.display = "flex";
  contenedorFilas.style.flexDirection = "column";
  contenedorFilas.style.gap = "10px";
  paletaColores.appendChild(contenedorFilas);

  let filaActual = document.createElement("div");
  filaActual.style.display = "flex";
  filaActual.style.gap = "10px";
  contenedorFilas.appendChild(filaActual);

  // Crear todos los botones en un array primero
  const todosLosBotones = [];
  
  // Agregar botones de colores originales
  colores.forEach((color, index) => {
    const boton = document.createElement("button");
    boton.style.backgroundColor = color;
    boton.id = `color-${index}`;
    boton.style.width = boton.style.height = "40px";
    boton.style.borderRadius = "50%";
    boton.style.cursor = "pointer";
    boton.style.border = "2px solid #888";
    boton.addEventListener("click", () => {
      colorSeleccionado = color;
    });
    todosLosBotones.push(boton);
  });

  // Agregar botones de espacios personalizados
  const espaciosNecesarios = 15 - colores.length;
  for (let i = 0; i < espaciosNecesarios; i++) {
    const botonPersonal = document.createElement("button");
    botonPersonal.style.backgroundColor = coloresPersonalizados[i] || "#fff";
    botonPersonal.style.width = botonPersonal.style.height = "40px";
    botonPersonal.style.borderRadius = "50%";
    botonPersonal.style.cursor = "pointer";
    botonPersonal.style.border = "2px solid #888";
    botonPersonal.innerHTML = coloresPersonalizados[i] ? "" : "+";

    const inputColor = document.createElement("input");
    inputColor.type = "color";
    inputColor.style.display = "none";

    botonPersonal.addEventListener("click", () => {
      if (!coloresPersonalizados[i]) {
        inputColor.click();
      } else {
        colorSeleccionado = coloresPersonalizados[i];
      }
    });

    inputColor.addEventListener("input", (e) => {
      const nuevoColor = e.target.value;
      botonPersonal.style.backgroundColor = nuevoColor;
      botonPersonal.innerHTML = "";
      colorSeleccionado = nuevoColor;
      coloresPersonalizados[i] = nuevoColor;
      botonPersonal.style.opacity = "0.6";
      botonPersonal.style.cursor = "pointer";
    });

    botonPersonal.appendChild(inputColor);
    todosLosBotones.push(botonPersonal);
  }

  // Ahora crear las filas de manera uniforme
  for (let i = 0; i < todosLosBotones.length; i++) {
    filaActual.appendChild(todosLosBotones[i]);
    
    // Crear nueva fila cada 3 elementos, excepto en el último
    if ((i + 1) % 3 === 0 && i < todosLosBotones.length - 1) {
      filaActual = document.createElement("div");
      filaActual.style.display = "flex";
      filaActual.style.gap = "10px";
      contenedorFilas.appendChild(filaActual);
    }
  }

  // Contenedor para el botón borrar y guardar
  const contenedorAcciones = document.createElement("div");
  contenedorAcciones.style.display = "flex";
  contenedorAcciones.style.gap = "20px";
  contenedorAcciones.style.marginTop = "20px";
  contenedorAcciones.style.justifyContent = "center";
  contenedorAcciones.style.width = "100%";

  // Botón borrar (blanco)
  const botonBorrar = document.createElement("button");
  botonBorrar.style.backgroundColor = "#ffffff";
  botonBorrar.id = "borra";
  botonBorrar.textContent = "Borra";
  botonBorrar.style.width = botonBorrar.style.height = "40px";
  botonBorrar.style.borderRadius = "50%";
  botonBorrar.style.border = "none";
  botonBorrar.style.cursor = "pointer";
  botonBorrar.addEventListener("click", () => {
    colorSeleccionado = "#ffffff";
    // Opcional: resalta el botón borrar
    botonBorrar.style.boxShadow = "0 0 0 3px #ccc";
    setTimeout(() => botonBorrar.style.boxShadow = "", 500);
  });
  contenedorAcciones.appendChild(botonBorrar);

  // Botón Guardar
  const botonGuardar = document.createElement("button");
  botonGuardar.id = "btGuardar";
  botonGuardar.textContent = "Guardar";
  botonGuardar.style.width = "80px";
  botonGuardar.style.height = "40px";
  botonGuardar.style.borderRadius = "10px";
  botonGuardar.style.border = "2px solid #888";
  botonGuardar.style.cursor = "pointer";
  contenedorAcciones.appendChild(botonGuardar);

  paletaColores.appendChild(contenedorAcciones);
}
async function aplicarColor(nombreImagen, colorHex, x, y, paletaColores) {
  try {
    // Codifica la paleta como un string separado por comas
    const paletaString = paletaColores.map(c => encodeURIComponent(c)).join(",");
    const url = `http://localhost:5289/api/imagen/pintaryborra?nombreImagen=${encodeURIComponent(nombreImagen)}&colorHex=${encodeURIComponent(colorHex)}&x=${x}&y=${y}&paletaColores=${paletaString}`;
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
async function actualizarPlantillaEnBackend(plantilla) {
  try {
    const response = await fetch("http://localhost:5289/api/plantilla/actualizar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(plantilla)
    });
    if (!response.ok) throw new Error("Error al actualizar la plantilla en el servidor");
    await response.json();
    alert("¡La plantilla se ha actualizado correctamente!");
    return true;
  } catch (error) {
    console.error("Error al actualizar plantilla:", error);
    return false;
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

////Funciones del SEGUNDO SPRINT
async function cargarImagenEditada(nombreImagen) {
  try {
    const endpoint = `http://localhost:5289/ImagenesUso/${encodeURIComponent(nombreImagen)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`No se pudo obtener la imagen: ${response.statusText}`);
    }
    const blob = await response.blob(); 
    const urlImagen = URL.createObjectURL(blob); 
    const imagenElemento = document.getElementById("imagenCargada");
    if (imagenElemento) {
      imagenElemento.src = urlImagen;
    } 
  } catch (error) {
    console.error("Error al cargar la imagen desde el servidor:", error);
  }
}
async function buscarObjetoEnController(nombreImagen) {
  try {
    const debugResponse = await fetch(`http://localhost:5289/api/plantilla/debug?imagen=${encodeURIComponent(nombreImagen)}`);
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      if (debugData.coincidenciasExactas.length > 0) {
        return debugData.coincidenciasExactas[0];
      } else if (debugData.coincidenciasParciales.length > 0) {
        return debugData.coincidenciasParciales[0];
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
////////////////////////


//Aqui se maneja la parte de si una plantilla es nueva o si una plantilla se va a editar 
document.addEventListener("DOMContentLoaded", async () => {
  const modoPlantilla = localStorage.getItem("modoPlantilla");
  if (modoPlantilla === "nueva"){
    await flujoNuevaPlantilla();
  } else if (modoPlantilla === "editar"){
    await flujoEditarPlantilla();
  } else {
    console.warn("modoPlantilla no está definido");
  }
});

async function flujoNuevaPlantilla() {
  const params = new URLSearchParams(window.location.search);
  const nombreImagen = params.get('imagen');
  const idUsuario = usuario && usuario.uuid ? usuario.uuid : ".";
  const nombreFinal = await restaurarImagenAUso(nombreImagen, idUsuario);
  const colores = ["#ff0000", "#00ff00", "#0000ff", "#ffcc00", "#ff00ff"];
  coloresPersonalizados = Array(10).fill(null);
  crearPaletaColores(colores);
  const imagenElemento = document.getElementById("imagenCargada");
  const botonGuardar = document.getElementById("btGuardar");
  let bloqueado = false;

  imagenElemento.addEventListener("click", async function(event) {
    if (bloqueado) return;
    bloqueado = true;
    const rect = imagenElemento.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * imagenElemento.naturalWidth / rect.width);
    const y = Math.floor((event.clientY - rect.top) * imagenElemento.naturalHeight / rect.height);
    const paletaFinal = colores.concat(coloresPersonalizados.filter(c => c));
    await aplicarColor(nombreFinal, colorSeleccionado, x, y, paletaFinal);
    if (colorSeleccionado === "#ffffff") {
      alert("Estás usando el borrador. Si la zona ya está en blanco, no pasará nada.");
    }
    bloqueado = false;
  });
  botonGuardar.addEventListener("click", async function() {
    if (confirm("¿Está seguro de guardar la plantilla coloreada?")) {
      const paletaFinal = [...colores];
      coloresPersonalizados.forEach(color => {
        if (color) {
          paletaFinal.push(color);
        }
      });
      if (idUsuario === ".") {
        sessionStorage.setItem("nombreImagenRestaurada", nombreFinal);
      }
      guardarImagen(nombreImagenGlobal, nombreFinal, idUsuario, paletaFinal);
    }
  });
}
async function flujoEditarPlantilla() {
  const params = new URLSearchParams(window.location.search);
  const nombreImagen = params.get('imagen');
  await cargarImagenEditada(nombreImagen);
  let paletaColores = [];
  buscarObjetoEnController( nombreImagen).then(objeto => {
    if (objeto) {
      paletaColores = objeto.paletaColores || objeto.PaletaColores || [];
      coloresPersonalizados = Array(10).fill(null);
      crearPaletaColores(paletaColores);
      let bloqueado = false;
      const imagenElemento = document.getElementById("imagenCargada");
      const botonGuardar = document.getElementById("btGuardar");

      imagenElemento.addEventListener("click", async function(event) {
        if (bloqueado) return;
          bloqueado = true;
          const rect = imagenElemento.getBoundingClientRect();
          const x = Math.floor((event.clientX - rect.left) * imagenElemento.naturalWidth / rect.width);
          const y = Math.floor((event.clientY - rect.top) * imagenElemento.naturalHeight / rect.height);
          const paletaFinal = paletaColores.concat(coloresPersonalizados.filter(c => c));
          await aplicarColor(nombreImagen, colorSeleccionado, x, y, paletaFinal);
          if (colorSeleccionado === "#ffffff") {
            alert("Estás usando el borrador. Si la zona ya está en blanco, no pasará nada.");
          }
        bloqueado = false;
      });
      
      botonGuardar.addEventListener("click", async function () {
        if (confirm("¿Está seguro de guardar la plantilla coloreada?")) {
          const paletaFinal = [...paletaColores];
          coloresPersonalizados.forEach(color => {
            if (color) {
              paletaFinal.push(color);
            }
          });
          objeto.PaletaColores = paletaFinal;
          const actualizado = await actualizarPlantillaEnBackend(objeto);
          if (actualizado) {
            window.location.href = "http://localhost:5289/front-end/viewCatalogo/index.html?reload=" + Date.now();
          }
        }
      });
    }
  });
}

// Funcion Global
window.guardarPlantillaEnBackend = guardarPlantillaEnBackend;

