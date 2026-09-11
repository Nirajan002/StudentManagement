namespace backend.Services.Interfaces
{
    using backend.DTOs;

    public interface IStudentService
    {
        List<object> GetPaged(int page);
        Task<object?> GetByIdAsync(Guid id);
        Task<object?> UpdateAsync(Guid id, UpdateStudent request);
        Task<bool> DeleteAsync(Guid id);
        List<object> Search(string search, int limit);
        Task<object?> UpdateProfileAsync(Guid id, StudentProfileUpdate request);
    }
}