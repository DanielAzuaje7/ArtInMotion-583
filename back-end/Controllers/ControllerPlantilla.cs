using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using SixLabors.ImageSharp;//permite la manipulacion de imagenes
using SixLabors.ImageSharp.PixelFormats;//define formato de pixeles
using System.Text.Json;
[ApiController]
[Route("api/imagen")]
[EnableCors("PermitirTodo")]
public class ImagenController : ControllerBase
{
  private readonly string rutaImagenes = @"../back-end/Datos/Imagenes";
  private readonly string rutaImagenesUso = @"../back-end/Datos/ImagenesUso";

  //POST crea una copia de la imagen para que no se este reiniciando 
  [HttpPost("restaurar")]
  public IActionResult RestaurarImagenAUso([FromQuery] string nombreImagen, string idUsuario)
  {
    var rutaOriginal = Path.Combine(rutaImagenes, nombreImagen);
    var extension = Path.GetExtension(nombreImagen);
    var nombreSinExtension = Path.GetFileNameWithoutExtension(nombreImagen);
    var timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
    var nombreNuevo = nombreSinExtension + "_restaurada_" + idUsuario + "_" + timestamp + extension;
    var rutaCopia = Path.Combine(rutaImagenesUso, nombreNuevo);
    try
    {
      System.IO.File.Copy(rutaOriginal, rutaCopia, true);
    }
    catch (Exception ex)
    {
      return BadRequest(new { mensaje = "Error al restaurar la imagen: " + ex.Message });
    }
    return Ok(new { mensaje = "Imagen restaurada correctamente.", nombre = nombreNuevo });
  }
  //GET: Obtener imagen desde la carpeta de imagenes en uso 
  [HttpGet("obtener")]
  public IActionResult ObtenerImagen([FromQuery] string nombreImagen)
  {
    var rutaCompleta = Path.Combine(rutaImagenesUso, nombreImagen);
    if (!System.IO.File.Exists(rutaCompleta))
      return NotFound(new { mensaje = "La imagen no existe en la carpeta Imagenes." });
    var imageBytes = System.IO.File.ReadAllBytes(rutaCompleta);
    Response.Headers.Append("Access-Control-Allow-Origin", "*");
    Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
    Response.Headers.Append("Pragma", "no-cache");
    Response.Headers.Append("Expires", "0");
    return File(imageBytes, "image/png");
  }
  //Endpoint SEGUNDO SPRINT
  [HttpGet("imagen-sin-cache")]
  public IActionResult ObtenerImagenSinCache([FromQuery] string nombreImagen)
  {
    var rutaCompleta = Path.Combine(rutaImagenesUso, nombreImagen);
    if (!System.IO.File.Exists(rutaCompleta))
      return NotFound(new { mensaje = "La imagen no existe en la carpeta Imagenes." });
    
    var imageBytes = System.IO.File.ReadAllBytes(rutaCompleta);
    var timestamp = DateTime.Now.Ticks;
    Response.Headers.Append("Access-Control-Allow-Origin", "*");
    Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
    Response.Headers.Append("Pragma", "no-cache");
    Response.Headers.Append("Expires", "0");
    Response.Headers.Append("Last-Modified", DateTime.UtcNow.ToString("R"));  
    return File(imageBytes, "image/png");
  }
  /////////////////////////////////
  //POST:funciona para pintar las zonas que estan en blanco y elimina los colores de la paleta ya que los pinta de blanco
  [HttpPost("pintaryborra")]
  public IActionResult PintarYBorrar([FromQuery] string nombreImagen, [FromQuery] string colorHex, [FromQuery] int x, [FromQuery] int y, [FromQuery] string paletaColores)
  {
    var rutaCompleta = Path.Combine(rutaImagenesUso, nombreImagen);
    if (!System.IO.File.Exists(rutaCompleta))
      return NotFound("La imagen no existe en Imagenes.");
    using (var image = Image.Load<Rgba32>(rutaCompleta))
    {
      Rgba32 fillColor = new Rgba32(
        Convert.ToByte(colorHex.Substring(1, 2), 16),
        Convert.ToByte(colorHex.Substring(3, 2), 16),
        Convert.ToByte(colorHex.Substring(5, 2), 16)
      );
      if (x < 0 || x >= image.Width || y < 0 || y >= image.Height)
        return BadRequest("Coordenadas fuera de la imagen.");
      Rgba32 targetColor = image[x, y];
      List<Rgba32> coloresPaleta = new List<Rgba32>();
      if (!string.IsNullOrEmpty(paletaColores))
      {
        var colores = paletaColores.Split(',');
        foreach (var hex in colores)
        {
          if (hex.Length == 7 && hex[0] == '#')
          {
            coloresPaleta.Add(new Rgba32(
            Convert.ToByte(hex.Substring(1, 2), 16),
            Convert.ToByte(hex.Substring(3, 2), 16),
            Convert.ToByte(hex.Substring(5, 2), 16)
          ));
          }
        }
      }
      // Si el color es blanco, solo borra si el pixel es de la paleta
      if (fillColor.R == 255 && fillColor.G == 255 && fillColor.B == 255)
      {
        FloodFillSoloColoresPaleta(image, x, y, targetColor, fillColor, coloresPaleta.ToArray());
        image.Save(rutaCompleta);
      }
      else if (targetColor.R > 240 && targetColor.G > 240 && targetColor.B > 240)
      {
        FloodFill(image, x, y, targetColor, fillColor);
        image.Save(rutaCompleta);
      }
      using (var ms = new MemoryStream())
      {
        image.Save(ms, new SixLabors.ImageSharp.Formats.Png.PngEncoder());
        return File(ms.ToArray(), "image/png");
      }
    }
  }
  // FloodFill que solo borra colores de la paleta
  private void FloodFillSoloColoresPaleta(Image<Rgba32> image, int x, int y, Rgba32 targetColor, Rgba32 fillColor, Rgba32[] coloresPaleta, int tolerancia = 10){
    int width = image.Width;
    int height = image.Height;
    bool[,] visitado = new bool[width, height];
    Queue<(int, int)> pixels = new Queue<(int, int)>();
    pixels.Enqueue((x, y));
    while (pixels.Count > 0)
    {
      var (px, py) = pixels.Dequeue();
      if (px < 0 || px >= width || py < 0 || py >= height)
        continue;
      if (visitado[px, py])
        continue;
      Rgba32 currentColor = image[px, py];
      bool esPaleta = false;
      foreach (var color in coloresPaleta)
      {
        if (ColoresSimilares(currentColor, color, tolerancia))
        {
          esPaleta = true;
          break;
        }
      }
      if (esPaleta)
      {
        image[px, py] = fillColor;
        visitado[px, py] = true;
        pixels.Enqueue((px + 1, py));
        pixels.Enqueue((px - 1, py));
        pixels.Enqueue((px, py + 1));
        pixels.Enqueue((px, py - 1));
      }
    }
  }
  // FloodFill funcion que se encarga del manejo de lo pixeles
  private void FloodFill(Image<Rgba32> image, int x, int y, Rgba32 targetColor, Rgba32 fillColor, int tolerancia = 30, bool borrarTodo = false){
    if (ColoresSimilares(targetColor, fillColor, tolerancia)) return;
    Queue<(int, int)> pixels = new Queue<(int, int)>();
    pixels.Enqueue((x, y));
    while (pixels.Count > 0)
    {
      var (px, py) = pixels.Dequeue();
      if (px < 0 || px >= image.Width || py < 0 || py >= image.Height)
        continue;
      Rgba32 currentColor = image[px, py];
      // Si es borrador, pinta cualquier color; si no, solo pinta si es casi blanco
      if ((borrarTodo || EsCasiBlanco(currentColor, 240)) && !ColoresSimilares(currentColor, fillColor, 10))
      {
        image[px, py] = fillColor;
        pixels.Enqueue((px + 1, py));
        pixels.Enqueue((px - 1, py));
        pixels.Enqueue((px, py + 1));
        pixels.Enqueue((px, py - 1));
      }
    }
  }
  private bool EsCasiBlanco(Rgba32 color, int umbral = 240){
    return color.R >= umbral && color.G >= umbral && color.B >= umbral;
  }
  private bool ColoresSimilares(Rgba32 c1, Rgba32 c2, int tolerancia = 30){
    return Math.Abs(c1.R - c2.R) <= tolerancia &&
           Math.Abs(c1.G - c2.G) <= tolerancia &&
           Math.Abs(c1.B - c2.B) <= tolerancia;
  }
  [HttpPost("renombrar")]
  public IActionResult RenombrarImagen([FromQuery] string nombreActual, [FromQuery] string nombreNuevo)
  {
    var rutaActual = Path.Combine(rutaImagenesUso, nombreActual);
    var rutaDestino = Path.Combine(rutaImagenesUso, nombreNuevo);
    if (!System.IO.File.Exists(rutaActual))
      return NotFound(new { mensaje = "El archivo original no existe." });
    if (System.IO.File.Exists(rutaDestino))
      return BadRequest(new { mensaje = "Ya existe un archivo con el nombre nuevo." });
    try
    {
      System.IO.File.Move(rutaActual, rutaDestino);
      return Ok(new { mensaje = "Archivo renombrado correctamente.", nombre = nombreNuevo });
    }
    catch (Exception ex)
    {
      return BadRequest(new { mensaje = "Error al renombrar el archivo: " + ex.Message });
    }
  }

  // //Endpoint SEGUNDO SPRINT
  [HttpGet("buscar")]
  public IActionResult BuscarPlantillaPorImagen([FromQuery] string imagen)
  {
    string ruta = "../back-end/Datos/plantilla.json";

    if (string.IsNullOrWhiteSpace(imagen))
        return BadRequest("El parámetro 'imagen' es obligatorio.");
    if (!System.IO.File.Exists(ruta))
        return NotFound("El archivo JSON no existe.");
    try
    {
      var contenido = System.IO.File.ReadAllText(ruta);
      var listaPlantillas = JsonSerializer.Deserialize<List<Plantilla>>(contenido) ?? new List<Plantilla>();
      for (int i = 0; i < listaPlantillas.Count; i++)
      {
        var p = listaPlantillas[i];
      }
      var plantilla = listaPlantillas.FirstOrDefault(p =>
      {
        if (string.IsNullOrEmpty(p.ImagenUrl)) return false;
           if (string.Equals(p.ImagenUrl.Trim(), imagen.Trim(), StringComparison.OrdinalIgnoreCase))
              return true;
            var nombreImagenJson = Path.GetFileNameWithoutExtension(p.ImagenUrl);
            var nombreImagenBusqueda = Path.GetFileNameWithoutExtension(imagen);
            if (string.Equals(nombreImagenJson, nombreImagenBusqueda, StringComparison.OrdinalIgnoreCase))
                return true;
            return false;
        });
        if (plantilla != null)
        {
          return Ok(plantilla);
        }
        return NotFound($"No se encontró plantilla para la imagen: {imagen}");
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Error al procesar el archivo JSON: {ex.Message}");
    }
}
  /////////////////////////////
}



[ApiController]
[Route("api/plantilla")]
public class ControllerPlantilla : ControllerBase
{
  [HttpPost("guardar")]
  public IActionResult GuardarPlantilla([FromBody] Plantilla plantilla)
  {
    string ruta = "../back-end/Datos/plantilla.json";
    List<Plantilla> listaPlantillas;
    // Leer el archivo si existe, si no, crear una nueva lista
    if (System.IO.File.Exists(ruta))
    {
      var contenido = System.IO.File.ReadAllText(ruta);
      if (!string.IsNullOrWhiteSpace(contenido))
        listaPlantillas = JsonSerializer.Deserialize<List<Plantilla>>(contenido) ?? new List<Plantilla>();
      else
        listaPlantillas = new List<Plantilla>();
    }
    else
    {
      listaPlantillas = new List<Plantilla>();
    }
    // Agregar la nueva plantilla
    listaPlantillas.Add(plantilla);
    // Guardar la lista actualizada
    var json = JsonSerializer.Serialize(listaPlantillas, new JsonSerializerOptions { WriteIndented = true });
    System.IO.File.WriteAllText(ruta, json);
    return Ok(new { mensaje = "Plantilla guardada correctamente" });
  }

  //Endpoint SEGUNDO SPRINT
  [HttpGet("listar")]
  public IActionResult ListarTodasLasPlantillas()
  {
    string ruta = "../back-end/Datos/plantilla.json";

    if (!System.IO.File.Exists(ruta))
      return NotFound("El archivo JSON no existe.");

    try
    {
      var contenido = System.IO.File.ReadAllText(ruta);
      var listaPlantillas = JsonSerializer.Deserialize<List<Plantilla>>(contenido) ?? new List<Plantilla>();

      return Ok(new
      {
        total = listaPlantillas.Count,
        plantillas = listaPlantillas
      });
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Error al leer el archivo JSON: {ex.Message}");
    }
  }

  [HttpGet("debug")]
  public IActionResult DebugBusqueda([FromQuery] string imagen)
  {
    string ruta = "../back-end/Datos/plantilla.json";

    if (string.IsNullOrWhiteSpace(imagen))
      return BadRequest("El parámetro 'imagen' es obligatorio.");

    if (!System.IO.File.Exists(ruta))
      return NotFound("El archivo JSON no existe.");

    try
    {
      var contenido = System.IO.File.ReadAllText(ruta);
      var listaPlantillas = JsonSerializer.Deserialize<List<Plantilla>>(contenido) ?? new List<Plantilla>();

      var resultado = new
      {
        imagenBuscada = imagen,
        totalPlantillas = listaPlantillas.Count,
        todasLasPlantillas = listaPlantillas.Select((p, i) => new
        {
          indice = i,
          nombreCreacion = p.NombreCreacion,
          imagenUrl = p.ImagenUrl,
          idCreador = p.IdCreador,
          puntaje = p.Puntaje,
          paletaColores = p.PaletaColores?.Count ?? 0
        }).ToList(),
        coincidenciasExactas = listaPlantillas.Where(p =>
          string.Equals(p.ImagenUrl?.Trim(), imagen.Trim(), StringComparison.OrdinalIgnoreCase)).ToList(),
        coincidenciasParciales = listaPlantillas.Where(p =>
          p.ImagenUrl?.Contains(imagen, StringComparison.OrdinalIgnoreCase) == true).ToList()
      };

      return Ok(resultado);
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Error al procesar el archivo JSON: {ex.Message}");
    }
  }

  [HttpPut("actualizar")]
  public IActionResult ActualizarPlantilla([FromBody] Plantilla plantillaActualizada)
  {
    string ruta = "../back-end/Datos/plantilla.json";

    if (!System.IO.File.Exists(ruta))
      return NotFound("El archivo JSON no existe.");

    try
    {
      var contenido = System.IO.File.ReadAllText(ruta);
      var listaPlantillas = JsonSerializer.Deserialize<List<Plantilla>>(contenido) ?? new List<Plantilla>();

      // Buscar la plantilla por ImagenUrl
      var plantillaExistente = listaPlantillas.FirstOrDefault(p =>
        string.Equals(p.ImagenUrl?.Trim(), plantillaActualizada.ImagenUrl?.Trim(), StringComparison.OrdinalIgnoreCase));

      if (plantillaExistente == null)
        return NotFound($"No se encontró la plantilla con imagen: {plantillaActualizada.ImagenUrl}");

      // Actualizar los datos de la plantilla
      plantillaExistente.PaletaColores = plantillaActualizada.PaletaColores;
      plantillaExistente.Puntaje = plantillaActualizada.Puntaje;
      plantillaExistente.NombreCreacion = plantillaActualizada.NombreCreacion;
      plantillaExistente.IdCreador = plantillaActualizada.IdCreador;

      // Guardar la lista actualizada
      var json = JsonSerializer.Serialize(listaPlantillas, new JsonSerializerOptions { WriteIndented = true });
      System.IO.File.WriteAllText(ruta, json);

      return Ok(new { mensaje = "Plantilla actualizada correctamente" });
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Error al actualizar la plantilla: {ex.Message}");
    }
  }
  ////////////////////////////////////////

}