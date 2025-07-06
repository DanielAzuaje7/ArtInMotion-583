public class Plantilla : Actividad{

  public List<string> PaletaColores { get; set; } // son los colores con los que cuenta el dibujo

  public Plantilla() : base() {
    PaletaColores = new List<string>();
  }

  public Plantilla(string nombreCreacion, string idCreador, int puntaje, List<string> paletaColores, string imagenUrl):base(nombreCreacion, idCreador, puntaje, imagenUrl){
    PaletaColores = paletaColores;
  }
}