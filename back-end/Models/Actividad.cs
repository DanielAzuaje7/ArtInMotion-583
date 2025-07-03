
public class Actividad{
  public string NombreCreacion { get; set; }
  public string IdCreador { get; set; }
  public int Puntaje { get; set; }
  public string ImagenUrl { get; set; }

  public Actividad() { }
  public Actividad(string nombreCreacion, string idCreador, int puntaje, string imagenUrl ){
    NombreCreacion = nombreCreacion;
    IdCreador = idCreador;
    Puntaje = puntaje;
    ImagenUrl = imagenUrl;
  }
}