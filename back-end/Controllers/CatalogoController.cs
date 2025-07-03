using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Collections.Generic;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class CatalogoController : ControllerBase
{

    private readonly string _rutaImagenes =  @"../back-end/Datos/Imagenes";
///back-end/Datos/Imagenes
    // GET: api/catalogo
    [HttpGet]
    public ActionResult<List<string>> Get()
    {
        // Si la carpeta no existe, devuelve una lista vacía
        if (!Directory.Exists(_rutaImagenes))
            return Ok(new List<string>());

        // Obtiene todos los archivos de la carpeta Imagenes y construye la URL accesible
        var archivos = Directory.GetFiles(_rutaImagenes)
            .Select(nombreArchivo => "/Imagenes/" + Path.GetFileName(nombreArchivo))
            .ToList();

        return Ok(archivos);
    }
}
