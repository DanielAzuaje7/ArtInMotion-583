//REGISTRO DE USUARIOS
let registerForm = document.getElementById('register-form');
let passwordConfirm = document.getElementById('password-confirm');
let nameForm = document.getElementById('name');
let fechaNacimiento = document.getElementById('fecha-nacimiento');
let email = document.getElementById('mail');
let nombre = document.getElementById('name');
const password = document.getElementById('password');
const mensajeError = document.getElementById('password-reviewer');


// Evento submit

registerForm.addEventListener('submit', function (event) {

  if (password != null) {
    event.preventDefault();
    if (password.value !== passwordConfirm.value) {
      alert('Las contraseñas no coinciden. Por favor, verifica.');
    } else {
      event.preventDefault();
      const usuarioNuevo = { Email: email.value, Nombre: nombre.value, FechaNacimiento: fechaNacimiento.value, Contrasena: password.value, Uuid: "porAsignar" };
      localStorage.setItem("usuarioActivo", JSON.stringify(usuarioNuevo));
      console.log(usuarioNuevo);
      console.log(usuarioNuevo.uuid);


      fetch('http://localhost:5289/api/usuarios/guardar', { // Cambia la URL según tu servidor
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioNuevo)
      })
        .then(response => response.json())
        .then(data => {
          console.log('Respuesta del servidor:', data.mensaje);
          handleMessage(data.mensaje);
        })
        .catch(error => {
          console.error('Error:', error);
        });


    }
  }
});

// Evento input para validación en tiempo real
password.addEventListener('input', () => {
  if ((password.value.length < 7)) {
    mensajeError.style.display = 'inline';
  }
  if ((password.value == null) || (password.value == '') || (password.value.length >= 8)) {
    mensajeError.style.display = 'none';
  }
});

document.getElementById('btn-continuar-pup').addEventListener('click', function () {
  document.getElementById('popup-exito').style.display = 'none';
  document.getElementById('popup-exito').style.position = 'relative';
  window.location.href = 'http://localhost:5289/front-end/viewUsuario/profile-info.html';
});

function mostrarPopupExito() {
  document.getElementById('popup-exito').style.display = 'flex';
  document.getElementById('popup-exito').style.position = 'fixed';
}

function fetchUserContrasenaEmail(contrasena, email) {
  fetch('http://localhost:5289/api/usuarios/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Email: email,
      Contrasena: contrasena
    })
  })
    .then(response => {
      if (response.ok) {
        // Si el login es exitoso, recibes el objeto usuario
        return response.json();
      } else {
        // Si hay error, recibes un mensaje
        return response.json().then(data => { throw data; });
      }
    })
    .then(usuario => {
      // Guarda el usuario en sessionStorage
      console.log("Usuario recibido:");
      console.log(usuario);
      localStorage.setItem('usuarioActivo', JSON.stringify(usuario));


    })
    .catch(error => {
      if (error.mensaje === "userNotFound") {
        alert("Usuario no encontrado");
      } else if (error.mensaje === "incorrectPassword") {
        alert("Contraseña incorrecta");
      } else {
        console.log(error);
        alert("Error desconocido");
      }
    });
}

function handleMessage(message) {
  switch (message) {
    case "emailAlreadyRegistered":
      alert("Ya existe una cuenta registrada con ese e-mail");
      break;
    case "userSuccesfullyRegistered":
      console.log("Usuario registrado exitosamente en el sistema");
      fetchUserContrasenaEmail(passwordConfirm.value, email.value);
      mostrarPopupExito();
      break;
    case "loginSuccesful":

      alert("Usuario logueado exitosamente en el sistema");

      fetch('http://localhost:5289/api/usuarios/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: loginEmail.value,
          Contrasena: loginPassword.value
        })
      })
        .then(response => {
          if (response.ok) {
            // Si el login es exitoso, recibes el objeto usuario
            return response.json();
          } else {
            // Si hay error, recibes un mensaje
            return response.json().then(data => { throw data; });
          }
        })
        .then(usuario => {
          // Guarda el usuario en sessionStorage
          console.log("Usuario recibido:");
          console.log(usuario);
          localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
          window.location.href = 'http://localhost:5289/front-end/viewUsuario/profile-info.html';

        })
        .catch(error => {
          if (error.mensaje === "userNotFound") {
            alert("Usuario no encontrado");
          } else if (error.mensaje === "incorrectPassword") {
            alert("Contraseña incorrecta");
          } else {
            console.log(error);
            alert("Error desconocido");
          }
        });
      // Redirige al perfil

      break;
    case "userNotFound":
      alert("No existen cuentas registradas con ese email");
      //mostrarPopupExito();
      break;
    case "incorrectPassword":
      alert("Contraseña incorrecta");
      //mostrarPopupExito();
      break;
    default:
      console.log("No se reconoce el mensaje: ");
      console.log(message);
  }
}


//INICIO DE SESIÓN

let loginEmail = document.getElementById('l-mail');
let loginPassword = document.getElementById('l-password');
let loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const loginData = {
    Email: loginEmail.value,
    Contrasena: loginPassword.value
  };


  fetch('http://localhost:5289/api/usuarios/login', { // Cambia la URL y puerto según tu servidor
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
  })
    .then(response => response.json())
    .then(data => { handleMessage(data.mensaje) })
    .catch(error => {
      console.error('Error en la petición:', error);
      alert("Error de conexión con el servidor.");
    });
}
);