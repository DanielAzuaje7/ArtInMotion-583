using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;
using Usuarioo.Models;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly string rutaUsuarios = @"..\back-end\Datos\usuarios.json";

    [HttpPost("guardar")]
    public IActionResult GuardarUsuario([FromBody] Usuario usuario)
    {
        List<Usuario> usuarios = new List<Usuario>();

        // Verifica si el archivo existe y lo lee
        if (System.IO.File.Exists(rutaUsuarios))
        {
            var lineas = System.IO.File.ReadAllLines(rutaUsuarios);
            foreach (var linea in lineas)
            {
                if (!string.IsNullOrWhiteSpace(linea))
                {
                    try
                    {
                        var u = JsonSerializer.Deserialize<Usuario>(linea);
                        if (u != null)
                            usuarios.Add(u);
                    }
                    catch
                    {
                        // Ignora líneas mal formateadas
                    }
                }
            }
        }

        // Busca si ya existe un usuario con el mismo email (ignorando mayúsculas/minúsculas)
        bool existe = usuarios.Any(u =>
            u.Email.Trim().ToLower() == usuario.Email.Trim().ToLower()
        );

        if (existe)
        {
            return BadRequest(new { mensaje = "emailAlreadyRegistered" });
        }

        // Si no existe, guarda el usuario
        usuario.Uuid = Guid.NewGuid().ToString();
        var usuarioJson = JsonSerializer.Serialize(usuario);
        System.IO.File.AppendAllText(rutaUsuarios, usuarioJson + Environment.NewLine);

        return Ok(new { mensaje = "userSuccesfullyRegistered" });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] JsonElement login)
    {
        // Extraer los valores del JSON recibido
        if (!login.TryGetProperty("Email", out JsonElement emailElement) ||
            !login.TryGetProperty("Contrasena", out JsonElement contrasenaElement))
        {
            return BadRequest(new { mensaje = "Faltan datos de login" });
        }
    
        string email = emailElement.GetString() ?? "";
        string contrasena = contrasenaElement.GetString() ?? "";
    
        List<Usuario> usuarios = new List<Usuario>();
    
        // Leer el archivo de usuarios
        if (System.IO.File.Exists(rutaUsuarios))
        {
            var lineas = System.IO.File.ReadAllLines(rutaUsuarios);
            foreach (var linea in lineas)
            {
                if (!string.IsNullOrWhiteSpace(linea))
                {
                    try
                    {
                        var u = JsonSerializer.Deserialize<Usuario>(linea);
                        if (u != null)
                            usuarios.Add(u);
                    }
                    catch
                    {
                        // Ignora líneas mal formateadas
                    }
                }
            }
        }
    
        // Buscar usuario por email (ignorando mayúsculas/minúsculas)
        var usuario = usuarios.FirstOrDefault(u =>
            u.Email.Trim().ToLower() == email.Trim().ToLower()
        );
    
        if (usuario == null)
        {
            return BadRequest(new { mensaje = "userNotFound" });
        }
    
        // Comparar contraseñas
        if (usuario.Contrasena == contrasena)
        {
            return Ok(new { mensaje = "loginSuccesful" });
        }
        else
        {
            return BadRequest(new { mensaje = "incorrectPassword" });
        }
    }

    
    [HttpPost("search")]
    public IActionResult SearchUser([FromBody] JsonElement login)
    {
        // Extraer los valores del JSON recibido
        if (!login.TryGetProperty("Email", out JsonElement emailElement) ||
            !login.TryGetProperty("Contrasena", out JsonElement contrasenaElement))
        {
            return BadRequest(new { mensaje = "Faltan datos de login" });
        }
    
        string email = emailElement.GetString() ?? "";
        string contrasena = contrasenaElement.GetString() ?? "";
    
        List<Usuario> usuarios = new List<Usuario>();
    
        // Leer el archivo de usuarios
        if (System.IO.File.Exists(rutaUsuarios))
        {
            var lineas = System.IO.File.ReadAllLines(rutaUsuarios);
            foreach (var linea in lineas)
            {
                if (!string.IsNullOrWhiteSpace(linea))
                {
                    try
                    {
                        var u = JsonSerializer.Deserialize<Usuario>(linea);
                        if (u != null)
                            usuarios.Add(u);
                    }
                    catch
                    {
                        // Ignora líneas mal formateadas
                    }
                }
            }
        }
    
        // Buscar usuario por email (ignorando mayúsculas/minúsculas)
        var usuario = usuarios.FirstOrDefault(u =>
            u.Email.Trim().ToLower() == email.Trim().ToLower()
        );
    
        if (usuario == null)
        {
            // Si no existe, retorna mensaje de usuario no encontrado
            return BadRequest(new { mensaje = "userNotFound" });
        }
    
        // Comparar contraseñas
        if (usuario.Contrasena == contrasena)
        {
            // Devuelve el objeto usuario al cliente
            return Ok(usuario);
        }
        else
        {
            return BadRequest(new { mensaje = "incorrectPassword" });
        }
    }
    
}

