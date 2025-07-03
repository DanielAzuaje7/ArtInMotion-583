using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Cors;
using System.IO;


public class GuardarSimpleRequest
{
    public string Nombre { get; set; }
    public string ImagenBase64 { get; set; }
}

[ApiController]
[Route("api/dibujo")]
[EnableCors("PermitirTodo")]
public class DibujoController : ControllerBase
{
    private readonly string _carpetaDibujos = @"../back-end/Datos/Dibujo";
   

    [HttpPost("guardar-simple")]
    public IActionResult GuardarSimple([FromBody] GuardarSimpleRequest req)
    {
        if (req == null || string.IsNullOrEmpty(req.ImagenBase64) || string.IsNullOrEmpty(req.Nombre))
        {
            return BadRequest(new { mensaje = "Datos inválidos. Envía nombre e imagenBase64." });
        }

        try
        {
            string safeName = Regex.Replace(req.Nombre, @"[^a-zA-Z0-9_-]", "");
            var base64Data = Regex.Match(req.ImagenBase64, @"data:image/(?<type>.+?),(?<data>.+)").Groups["data"].Value;
            byte[] bytes = Convert.FromBase64String(base64Data);

            string fileName = $"{safeName}_{DateTime.Now.Ticks}.png";
            string carpetaDibujos = @"../back-end/Datos/Dibujo";
            if (!Directory.Exists(carpetaDibujos))
                Directory.CreateDirectory(carpetaDibujos);

            string pathFisico = Path.Combine(carpetaDibujos, fileName);
            System.IO.File.WriteAllBytes(pathFisico, bytes);

            string rutaWeb = $"/Dibujo/{fileName}";

         string uuid = extraerUUIDDeNombre(safeName); 
        var dibujoNuevo = new DibujoRequest
        {
            NombreCreacion = req.Nombre,
            IdCreador = uuid,
            Puntaje = 0,
            ImagenUrl = rutaWeb,
            ImagenBase64 = req.ImagenBase64
        };

        string jsonPath = Path.Combine(carpetaDibujos, "dibujos.json");

        List<DibujoRequest> dibujos = new List<DibujoRequest>();
        if (System.IO.File.Exists(jsonPath))
        {
            string jsonExistente = System.IO.File.ReadAllText(jsonPath);
            dibujos = System.Text.Json.JsonSerializer.Deserialize<List<DibujoRequest>>(jsonExistente) ?? new List<DibujoRequest>();
        }

        dibujos.Add(dibujoNuevo);
        string jsonNuevo = System.Text.Json.JsonSerializer.Serialize(dibujos, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        System.IO.File.WriteAllText(jsonPath, jsonNuevo);


            return Ok(new
            {
                mensaje = "Dibujo guardado exitosamente",
                ruta = rutaWeb,
                nombreArchivo = fileName
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = "Error al guardar el dibujo", error = ex.Message });
        }
    }
private string extraerUUIDDeNombre(string nombre)
{
    var partes = nombre.Split('_');
    if (partes.Length > 1)
        return partes.Last();
    return "desconocido";
}
}
