using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class CatalogoController : ControllerBase
{
    private readonly string _rutaImagenes = @"../back-end/Datos/Imagenes";

    // GET: api/catalogo
    [HttpGet]
    public ActionResult<List<string>> Get()
    {
        if (!Directory.Exists(_rutaImagenes))
            return Ok(new List<string>());

        var archivos = Directory.GetFiles(_rutaImagenes)
            .Select(nombreArchivo => "/Imagenes/" + Path.GetFileName(nombreArchivo))
            .ToList();

        return Ok(archivos);
    }

    // POST: api/catalogo/subir
    [HttpPost("subir")]
    public async Task<IActionResult> SubirPlantilla([FromForm] IFormFile archivo)
    {
        if (archivo == null || archivo.Length == 0)
            return BadRequest("No se seleccionó ningún archivo.");

        var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (!extensionesPermitidas.Contains(extension))
            return BadRequest("Solo se permiten archivos de imagen.");

        // Crea la carpeta si no existe
        if (!Directory.Exists(_rutaImagenes))
            Directory.CreateDirectory(_rutaImagenes);

        // Busca el mayor número de subida ya existente
        var archivos = Directory.GetFiles(_rutaImagenes, "subida*.*");
        int maxNum = 0;
        foreach (var archivoExistente in archivos)
        {
            var nombre = Path.GetFileNameWithoutExtension(archivoExistente);
            if (nombre.StartsWith("subida"))
            {
                var numeroStr = nombre.Substring(6); // "subida".Length == 6
                if (int.TryParse(numeroStr, out int num))
                {
                    if (num > maxNum) maxNum = num;
                }
            }
        }
        int nuevoNum = maxNum + 1;
        var nombreArchivo = $"subida{nuevoNum}{extension}";
        var rutaDestino = Path.Combine(_rutaImagenes, nombreArchivo);

        using (var stream = new FileStream(rutaDestino, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        // Devuelve la URL relativa
        return Ok(new { url = "/Imagenes/" + nombreArchivo });
    }
}
