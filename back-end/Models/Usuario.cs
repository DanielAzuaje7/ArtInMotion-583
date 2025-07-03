namespace Usuarioo.Models
{
    public class Usuario
    {
        public required string Email { get; set; }
        public required string Nombre { get; set; }
        public required string FechaNacimiento { get; set; }
        public required string Contrasena { get; set; }
        public required string Uuid { get; set; }
    }
}