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

  nombreB.innerHTML = `  ${usuario.nombre}`;
  emailB.innerHTML = `  ${usuario.email}`;
  fechaNacB.innerHTML = `  ${usuario.fechaNacimiento}`;
  passwordB.innerHTML = `  ${usuario.contrasena}`;
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


