namespace backend.Services.Interfaces
{
    using backend.DTOs;

    public interface IAttendanceService
    {
        Task<object> MarkAttendanceAsync(MarkAttendanceRequest request, Guid markedById, bool isAdmin);
        Task<object> GetRosterAsync(int classSectionId, DateTime date);
        Task<object> GetAttendanceSheetAsync(int classSectionId, DateTime? from, DateTime? to);
        Task<object> GetStudentAttendanceAsync(Guid studentId, DateTime? from, DateTime? to);
    }
}