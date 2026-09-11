namespace backend.Services.Interfaces
{
    using backend.DTOs;

    public interface ITeacherService
    {
        Task<object> GetCurrentAsync(Guid teacherId);
        Task<object> UpdateProfileAsync(Guid id, TeacherProfileUpdate request);
        List<object> GetPaged(int page);
        object GetById(Guid id);
        Task DeleteAsync(Guid id);
        Task<object> UpdateAsync(Guid id, UpdateTeacher request);
        List<object> Search(string search, int limit);
    }
}