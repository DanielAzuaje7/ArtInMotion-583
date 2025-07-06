using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTodo",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

// Agregar controladores
builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting(); // Habilita el enrutamiento

app.UseCors("PermitirTodo"); // Aplica la política de CORS

// Habilita archivos estáticos desde la carpeta Imagenes
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Datos", "Imagenes")),
    RequestPath = "/Imagenes"
});

// Habilita archivos estáticos desde la carpeta front-end
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "front-end")),
    RequestPath = "/front-end"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "back-end")),
    RequestPath = "/back-end"
});
// Habilita archivos estáticos desde la carpeta ImagenesUso
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Datos", "ImagenesUso")),
    RequestPath = "/ImagenesUso",
    OnPrepareResponse = ctx =>
    {
        // Headers para evitar caché en imágenes de ImagenesUso
        ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
        ctx.Context.Response.Headers.Append("Pragma", "no-cache");
        ctx.Context.Response.Headers.Append("Expires", "0");
    }
});

// Habilita archivos estáticos desde la carpeta Dibujo
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Datos", "Dibujo")),
    RequestPath = "/Dibujo"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "resources")),
    RequestPath = "/resources"
});



app.UseAuthorization();

app.MapControllers(); // Registra los controladores

app.Run();
