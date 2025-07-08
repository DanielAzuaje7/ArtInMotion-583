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


document.getElementById("cerrar-sesion-btn").addEventListener("click", () => {
  localStorage.setItem("usuarioActivo",null);
  console.log('usuarioActual borrado ');
  console.log(localStorage.getItem("usuarioActual"));
  window.location.href = "http://localhost:5289/front-end/viewCatalogo/index.html";
});

function fetchActualizarUsuario(usuarioParaActualizar){
  fetch('http://localhost:5289/api/usuarios/actualizar', { 
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

function fetchEliminarUsuario(usuarioParaEliminar){
  const usuarioParaEliminarMsg =  { Email: usuarioParaEliminar.email, Nombre: usuarioParaEliminar.nombre, FechaNacimiento: usuarioParaEliminar.fechaNacimiento, Contrasena: usuarioParaEliminar.contrasena, Uuid: usuarioParaEliminar.uuid };
  console.log(usuarioParaEliminarMsg);
  console.log(usuario);
  fetch('http://localhost:5289/api/usuarios/eliminar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioParaEliminarMsg)
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
const mensajeError = document.getElementById('msg-error');
let passwordConfirmer = document.getElementById('password-confirmer');
let passwordConfirmerDiv = document.getElementById('password-confirmer-div');

document.getElementById('atributes-container').addEventListener('input', function(event) {
  if (event.target.id === 'password-b-input') {
    // Validación de contraseña
    if (event.target.value.length < 8) {
      mensajeError.style.display = 'inline';
      mensajeError.innerText = 'La contraseña debe tener 8 caracteres como mínimo';
    } else {
      mensajeError.style.display = 'none';
    }
    // Mostrar confirmador solo cuando se edita la contraseña
    passwordConfirmer.style.display = 'inline';
    passwordConfirmerDiv.style.display = 'inline';
  }
});


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
document.getElementById("info-items-div").addEventListener("submit", function() {
  event.preventDefault();
  let editarPerfilBtn = document.getElementById('editar-perfil-btn');
  if (!isEditing) {
    // Cambiar a modo edición
    fields.forEach(field => {
      const b = document.getElementById(field.id);
      let value = b.textContent;
      const input = document.createElement("input");
      input.type = field.type;
      
      if (field.type === "date") {
        
        input.value = value;
        
      } else {
        
        input.value = value;
      }
      input.id = field.id + "-input";
      input.required = true;
      b.replaceWith(input);
      clave = document.getElementById('password-b-input');
      ;
});
    editarPerfilBtn.value = "Guardar";
    isEditing = true;
  } else {
    // Guardar cambios y volver a modo visualización
    
    if(((clave.value == passwordConfirmer.value)||(passwordConfirmer.style.display=='none'))&&(clave.value.length>=8)){
      fields.forEach(field => {
      const input = document.getElementById(field.id + '-input');
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
      editarPerfilBtn.value = "Editar Perfil";
      isEditing = false;

      const usuarioActualizadoMsg = { Email: document.getElementById('email-b').textContent, Nombre: document.getElementById('nombre-b').textContent, FechaNacimiento: document.getElementById('fecha-nac-b').textContent, Contrasena: document.getElementById('password-b').textContent, Uuid: usuario.uuid };
      const usuarioActualizadoJs = { email: document.getElementById('email-b').textContent, nombre: document.getElementById('nombre-b').textContent, fechaNacimiento: document.getElementById('fecha-nac-b').textContent, contrasena: document.getElementById('password-b').textContent, uuid: usuario.uuid };
      console.log(usuarioActualizadoMsg);
      fetchActualizarUsuario(usuarioActualizadoMsg);
      localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizadoJs));  
      //console.log(usuarioActivo);
      clave = document.getElementById('password-b');
      //console.log(clave);
      passwordConfirmer.style.display='none';
      passwordConfirmer.value='';
    }else{
      if(clave.value != passwordConfirmer.value){
      alert('Las contraseñas no coinciden, por favor, verifica');
      }
      if(clave.value <8){
      alert('La contraseña debe tener mínimo 8 caracteres');
      }
    }
  }
  
});

document.getElementById('eliminar-perfil-btn').addEventListener('click', function(event) {
  event.preventDefault();

  const confirmado1 = confirm('¿Estás seguro de que deseas eliminar tu perfil? Esta acción no se puede deshacer.');
  
  if (confirmado1) {
    const confirmado2 = confirm('Esta es tu última oportunidad. ¿Segurísimo de los segurísimos que quieres eliminar tu perfil?');
    if (confirmado2) {
      fetchEliminarUsuario(usuario);
      alert('Perfil eliminado.');
      localStorage.setItem("usuarioActivo",null);
      location.reload();
    } else {
      // El usuario canceló en la segunda confirmación
    }
  } else {
    // El usuario canceló en la primera confirmación
  }
});



