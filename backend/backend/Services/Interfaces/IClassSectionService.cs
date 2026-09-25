namespace backend.Services.Interfaces
{
    public interface IClassSectionService
    {
        Task<IEnumerable<object>> GetAllAsync();
        Task<object> AssignInstructorAsync(int classSectionId, Guid? teacherId);
        Task<IEnumerable<object>> GetMineAsync(Guid teacherId);
    }
}