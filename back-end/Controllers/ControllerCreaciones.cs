using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

[ApiController]
[Route("api/[controller]")]
public class CreacionesController : ControllerBase
{
    private readonly string _rutaPlantillasJson = @"../back-end/Datos/plantilla.json"; 
    private readonly string _rutaDibujosJson = @"../back-end/Datos/Dibujo/dibujos.json";
    private readonly string _carpetaDibujos = @"../back-end/Datos/Dibujo";
    private readonly string _carpetaPlantillas = @"../back-end/Datos/ImagenesUso";

    [HttpGet("plantillas")]
    public ActionResult<List<Plantilla>> GetPlantillas()
    {
        if (!System.IO.File.Exists(_rutaPlantillasJson))
            return Ok(new List<Plantilla>());

        var json = System.IO.File.ReadAllText(_rutaPlantillasJson);
        var plantillas = JsonConvert.DeserializeObject<List<Plantilla>>(json) ?? new List<Plantilla>();
        return Ok(plantillas);
    }

    [HttpGet("dibujos")]
    public ActionResult<List<DibujoRequest>> GetDibujos()
    {
        if (!System.IO.File.Exists(_rutaDibujosJson))
            return Ok(new List<DibujoRequest>());

        var json = System.IO.File.ReadAllText(_rutaDibujosJson);
        var dibujos = JsonConvert.DeserializeObject<List<DibujoRequest>>(json) ?? new List<DibujoRequest>();
        return Ok(dibujos);
    }

    // Eliminar una creación (plantilla o dibujo) y su archivo local
    [HttpDelete("{tipo}/{nombre}")]
    public IActionResult Delete(string tipo, string nombre)
    {
        if (tipo == "plantilla")
        {
            var json = System.IO.File.ReadAllText(_rutaPlantillasJson);
            var plantillas = JsonConvert.DeserializeObject<List<Plantilla>>(json) ?? new List<Plantilla>();
            var plantilla = plantillas.FirstOrDefault(p => p.NombreCreacion == nombre);
            if (plantilla == null) return NotFound();

            // Eliminar del JSON
            plantillas.Remove(plantilla);
            System.IO.File.WriteAllText(_rutaPlantillasJson, JsonConvert.SerializeObject(plantillas));

            // Eliminar el archivo físico de la imagen
            if (!string.IsNullOrEmpty(plantilla.ImagenUrl))
            {
                var rutaImagen = Path.Combine(_carpetaPlantillas, plantilla.ImagenUrl);
                if (System.IO.File.Exists(rutaImagen))
                {
                    System.IO.File.Delete(rutaImagen);
                }
            }
            return NoContent();
        }
        else if (tipo == "dibujo")
        {
            var json = System.IO.File.ReadAllText(_rutaDibujosJson);
            var dibujos = JsonConvert.DeserializeObject<List<DibujoRequest>>(json) ?? new List<DibujoRequest>();
            var dibujo = dibujos.FirstOrDefault(d => d.NombreCreacion == nombre);
            if (dibujo == null) return NotFound();

            // Eliminar del JSON
            dibujos.Remove(dibujo);
            System.IO.File.WriteAllText(_rutaDibujosJson, JsonConvert.SerializeObject(dibujos));

            // Eliminar el archivo físico de la imagen
            if (!string.IsNullOrEmpty(dibujo.ImagenUrl))
            {
                var rutaImagen = Path.Combine(_carpetaDibujos, dibujo.ImagenUrl);
                if (System.IO.File.Exists(rutaImagen))
                {
                    System.IO.File.Delete(rutaImagen);
                }
            }
            return NoContent();
        }
        return BadRequest("Tipo no válido");
    }

[HttpPost("calificar")]
public IActionResult Calificar([FromBody] Dictionary<string, object> calificacion)
{
    string tipo = null, nombre = null, idCreador = null;
    int calificacionValor = 0;

    foreach (var key in calificacion.Keys)
    {
        if (key.Equals("tipo", System.StringComparison.OrdinalIgnoreCase))
            tipo = calificacion[key]?.ToString();
        else if (key.Equals("nombre", System.StringComparison.OrdinalIgnoreCase))
            nombre = calificacion[key]?.ToString();
        else if (key.Equals("idcreador", System.StringComparison.OrdinalIgnoreCase))
            idCreador = calificacion[key]?.ToString();
        else if (key.Equals("calificacion", System.StringComparison.OrdinalIgnoreCase))
        {
            var val = calificacion[key];
            if (val is long l) calificacionValor = (int)l;
            else if (val is int i) calificacionValor = i;
            else if (int.TryParse(val?.ToString(), out int parsed)) calificacionValor = parsed;
        }
    }

    if (string.IsNullOrWhiteSpace(tipo) || string.IsNullOrWhiteSpace(nombre) || string.IsNullOrWhiteSpace(idCreador))
        return BadRequest("Faltan datos obligatorios.");

    if (tipo.Equals("plantilla", System.StringComparison.OrdinalIgnoreCase))
    {
        var json = System.IO.File.ReadAllText(_rutaPlantillasJson);
        var plantillas = JsonConvert.DeserializeObject<List<Plantilla>>(json) ?? new List<Plantilla>();
        var plantilla = plantillas.FirstOrDefault(p =>
            p.NombreCreacion.Trim().Equals(nombre.Trim(), System.StringComparison.OrdinalIgnoreCase) &&
            p.IdCreador.Trim().Equals(idCreador.Trim(), System.StringComparison.OrdinalIgnoreCase));
        if (plantilla == null) return NotFound();

        plantilla.Puntaje = calificacionValor;
        System.IO.File.WriteAllText(_rutaPlantillasJson, JsonConvert.SerializeObject(plantillas));
        return Ok(new { mensaje = $"Puntaje actualizado a {plantilla.Puntaje} para {plantilla.NombreCreacion}" });
    }
    else if (tipo.Equals("dibujo", System.StringComparison.OrdinalIgnoreCase))
    {
        var json = System.IO.File.ReadAllText(_rutaDibujosJson);
        var dibujos = JsonConvert.DeserializeObject<List<DibujoRequest>>(json) ?? new List<DibujoRequest>();
        var dibujo = dibujos.FirstOrDefault(d =>
            d.NombreCreacion.Trim().Equals(nombre.Trim(), System.StringComparison.OrdinalIgnoreCase) &&
            d.IdCreador.Trim().Equals(idCreador.Trim(), System.StringComparison.OrdinalIgnoreCase));
        if (dibujo == null) return NotFound();

        dibujo.Puntaje = calificacionValor;
        System.IO.File.WriteAllText(_rutaDibujosJson, JsonConvert.SerializeObject(dibujos));
        return Ok(new { mensaje = $"Puntaje actualizado a {dibujo.Puntaje} para {dibujo.NombreCreacion}" });
    }
    return BadRequest("Tipo no válido");
}
}