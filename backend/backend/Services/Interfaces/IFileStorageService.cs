namespace backend.Services.Interfaces
{
    public interface IFileStorageService
    {
        /// Saves a file into wwwroot/uploads and returns the stored (guid) filename.
        Task<string> SaveAsync(IFormFile file);

        /// Deletes a file from wwwroot/uploads if it exists. Safe to call with null/empty.
        void Delete(string? storedFileName);

        /// Reads raw bytes for a stored file. Returns null if missing.
        Task<byte[]?> ReadAsync(string storedFileName);
    }
}