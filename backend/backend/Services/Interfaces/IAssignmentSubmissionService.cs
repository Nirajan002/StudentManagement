namespace backend.Services.Interfaces
{
    public interface IAssignmentSubmissionService
    {
        // Physical tracking — unchanged behaviour, creator/co-teacher/Admin
        Task<object> GetSubmissionsAsync(int postId, Guid userId, bool isAdmin);
        Task<object> SetSubmissionStatusAsync(int postId, Guid studentId, Guid actingUserId, bool isAdmin, bool submitted);
        Task<object> GetMySubmissionAsync(int postId, Guid studentId);

        // Online submissions — student uploads; viewing restricted to the
        // exact teacher who posted the assignment
        Task<object> SubmitOnlineWorkAsync(int postId, Guid studentId, IFormFile file);
        Task<FileDownloadResult> DownloadMyOnlineSubmissionAsync(int postId, Guid studentId);
        Task<object> GetOnlineSubmissionsAsync(int postId, Guid actingUserId);
        Task<FileDownloadResult> DownloadOnlineSubmissionAsync(int postId, Guid studentId, Guid actingUserId);
    }
}