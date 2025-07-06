let nombre = document.getElementById('nombre-b');
let correo = document.getElementById('email-b');
let fechaNac = document.getElementById('fecha-nac-b');
let clave = document.getElementById('password-b');
let usuarioActivo = localStorage.getItem("usuarioActivo");
let usuario = JSON.parse(usuarioActivo);

console.log(usuarioActivo);
if (usuario!==null&& usuario !== "undefined") {
  //usuario = JSON.parse(usuarioActivo);
  console.log(usuario);
  llenarHtmlConInfoUsuario(usuario);
}else{
  console.log(usuarioActivo);
  //alert('123');
  window.location.href = "http://localhost:5289/front-end/viewUsuario/login.html";
}

//Esto es para guardar la planatilla si todavia no esta logueado 
document.getElementById('volver-btn').addEventListener('click', function() {
  const plantillaPendiente = sessionStorage.getItem("plantillaPendiente");
  const nombreImagenRestaurada = sessionStorage.getItem("nombreImagenRestaurada");
  if (plantillaPendiente && usuario && usuario.uuid && usuario.uuid !== ".") {
    const datos = JSON.parse(plantillaPendiente);
    // Usa el nombreImagen restaurado si existe
    let nombreActual = nombreImagenRestaurada || datos.nombreImagen;

    // Quitar el punto después del segundo guion bajo en nombreActual
    const primerGuion = nombreActual.indexOf('_');
    const segundoGuion = nombreActual.indexOf('_', primerGuion + 1);
    if (segundoGuion !== -1) {
      const punto = nombreActual.indexOf('.', segundoGuion);
      if (punto !== -1) {
        nombreActual = nombreActual.slice(0, punto) + nombreActual.slice(punto + 1);
      }
    }

    // Adicionar usuario.uuid al nombre
    const extension = nombreActual.substring(nombreActual.lastIndexOf('.'));
    const baseNombre = nombreActual.substring(0, nombreActual.lastIndexOf('.'));
    const nombreNuevo = `${baseNombre}_${usuario.uuid}${extension}`;

    fetch(`http://localhost:5289/api/imagen/renombrar?nombreActual=${encodeURIComponent(nombreImagenRestaurada)}&nombreNuevo=${encodeURIComponent(nombreNuevo)}`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));

    guardarPlantillaEnBackend(datos.nombreImagenGlobal, usuario.uuid, datos.colores, nombreNuevo);
    sessionStorage.removeItem("plantillaPendiente");
    sessionStorage.removeItem("nombreImagenRestaurada");
  }
});

function llenarHtmlConInfoUsuario (usuario){
  let nombreB = document.getElementById('nombre-b');
  let emailB = document.getElementById('email-b');
  let fechaNacB = document.getElementById('fecha-nac-b');
  let passwordB = document.getElementById('password-b');

  nombreB.innerHTML = `${usuario.nombre}`;
  emailB.innerHTML = `${usuario.email}`;
  fechaNacB.innerHTML = `${usuario.fechaNacimiento}`;
  passwordB.innerHTML = `${usuario.contrasena}`;
}

document.getElementById("volver-dibujo-btn").addEventListener("click", () => {
  const dibujoPendiente = sessionStorage.getItem("dibujoPendiente");
  const usuarioActivo = localStorage.getItem("usuarioActivo");

  if (dibujoPendiente && usuarioActivo) {
    const datos = JSON.parse(dibujoPendiente);
    const usuario = JSON.parse(usuarioActivo);

    fetch('http://localhost:5289/api/dibujo/guardar-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: `${datos.nombre}_${usuario.uuid}`,
        imagenBase64: datos.imagenBase64
      })
    })
    .then(res => res.json())
    .then(data => {
      sessionStorage.removeItem("dibujoPendiente");
      sessionStorage.setItem("dibujoGuardadoExito", data.ruta);

      window.location.href = "http://localhost:5289/front-end/viewCatalogo/index.html";
    })
    .catch(err => {
      alert("Error al guardar el dibujo después del login: " + err.message);
    });
  } else {
    window.location.href = "http://localhost:5289/front-end/viewCatalogo/index.html";
  }
});

document.getElementById("cerrar-sesion-btn").addEventListener("click", () => {
  localStorage.setItem("usuarioActivo",null);
  console.log('usuarioActual borrado ');
  console.log(localStorage.getItem("usuarioActual"));
  window.location.href = "http://localhost:5289/front-end/viewCatalogo/index.html";
});

function fetchActualizarUsuario(usuarioParaActualizar){
  fetch('http://localhost:5289/api/usuarios/actualizar', { // Cambia la URL según tu servidor
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioParaActualizar)
      })
        .then(response => response.json())
        .then(data => {
          console.log('Respuesta del servidor:', data.mensaje);
          //handleMessage(data.mensaje);
        })
        .catch(error => {
          console.error('Error:', error);
        });    
}

function toInputDateFormat(fechaTexto) {
  // Convierte de DD/MM/YYYY a YYYY-MM-DD
  const partes = fechaTexto.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }
  return fechaTexto; // Si ya está en formato correcto
}

function toDisplayDateFormat(fechaInput) {
  // Convierte de YYYY-MM-DD a DD/MM/YYYY
  const partes = fechaInput.split('-');
  if (partes.length === 3) {
    return `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`;
  }
  return fechaInput;
}

const fields = [
  { id: "nombre-b", type: "text" },
  { id: "email-b", type: "email" },
  { id: "fecha-nac-b", type: "date" },
  { id: "password-b", type: "password" }
];

let isEditing = false;
let updatedEmail = document.getElementById('email-b');
document.getElementById("editar-perfil-btn").addEventListener("click", function() {
  if (!isEditing) {
    // Cambiar a modo edición
    fields.forEach(field => {
      const b = document.getElementById(field.id);
      let value = b.textContent;
      const input = document.createElement("input");
      input.type = field.type;
      if (field.type === "date") {
        console.log("entro al date!");
        console.log(value);
        //console.log(toDisplayDateFormat(value));
        input.value = value;
        console.log(input.value);
      } else {
        console.log("normal");
        input.value = value;
      }
      input.id = field.id + "-input";
      b.replaceWith(input);
});
    this.textContent = "Guardar";
    isEditing = true;
  } else {
    // Guardar cambios y volver a modo visualización
    fields.forEach(field => {
    const input = document.getElementById(field.id + "-input");
    const b = document.createElement("b");
    b.className = "b-fillable";
    b.id = field.id;
    let value = input.value;
    if (field.type === "date") {
      value = toInputDateFormat(value);
    }
    b.textContent = value;
    input.replaceWith(b);
    });
    this.textContent = "Editar Perfil";
    isEditing = false;
    
    const usuarioActualizadoMsg = { Email: document.getElementById('email-b').textContent, Nombre: document.getElementById('nombre-b').textContent, FechaNacimiento: document.getElementById('fecha-nac-b').textContent, Contrasena: document.getElementById('password-b').textContent, Uuid: usuario.uuid };
    const usuarioActualizadoJs = { email: document.getElementById('email-b').textContent, nombre: document.getElementById('nombre-b').textContent, fechaNacimiento: document.getElementById('fecha-nac-b').textContent, contrasena: document.getElementById('password-b').textContent, uuid: usuario.uuid };
    console.log(usuarioActualizadoMsg);
    fetchActualizarUsuario(usuarioActualizadoMsg);
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizadoJs));  
    console.log(usuarioActivo);
  }
});

