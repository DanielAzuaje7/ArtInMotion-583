public class DibujoRequest : Actividad
{
    public string ImagenBase64 { get; set; } // Para recibir la imagen en formato base64

    public DibujoRequest() { }

    public DibujoRequest(string nombreCreacion, string idCreador, int puntaje, string imagenUrl, string imagenBase64)
        : base(nombreCreacion, idCreador, puntaje, imagenUrl)
    {
        ImagenBase64 = imagenBase64;
    }
}