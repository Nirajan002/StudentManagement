namespace backend.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<object> GetAdminDashboardAsync();
        Task<object> GetTeacherDashboardAsync(Guid teacherId);
        Task<object> GetStudentDashboardAsync(Guid studentId);
    }
}