namespace backend.Services
{
    using backend.Services.Interfaces;

    public class FileStorageService : IFileStorageService
    {
        private readonly string uploadPath;

        public FileStorageService(IWebHostEnvironment env)
        {
            uploadPath = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");
        }

        public async Task<string> SaveAsync(IFormFile file)
        {
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string filePath = Path.Combine(uploadPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return fileName;
        }

        public void Delete(string? storedFileName)
        {
            if (string.IsNullOrEmpty(storedFileName)) return;

            string filePath = Path.Combine(uploadPath, storedFileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        public async Task<byte[]?> ReadAsync(string storedFileName)
        {
            string filePath = Path.Combine(uploadPath, storedFileName);
            if (!File.Exists(filePath)) return null;

            return await File.ReadAllBytesAsync(filePath);
        }
    }
}