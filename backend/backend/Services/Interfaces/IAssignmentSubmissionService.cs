namespace backend.Services.Interfaces
{
    public interface IAssignmentSubmissionService
    {
        Task<object> GetSubmissionsAsync(int postId, Guid userId, bool isAdmin);
        Task<object> SetSubmissionStatusAsync(int postId, Guid studentId, Guid actingUserId, bool isAdmin, bool submitted);
        Task<object> SetSubmissionFeedbackAsync(int postId, Guid studentId, Guid actingUserId, bool isAdmin, string? feedback);
        Task<object> GetMySubmissionAsync(int postId, Guid studentId);

        Task<object> SubmitOnlineWorkAsync(int postId, Guid studentId, IFormFile file);
        Task<FileDownloadResult> DownloadMyOnlineSubmissionAsync(int postId, Guid studentId);
        Task<FileDownloadResult> DownloadOnlineSubmissionAsync(int postId, Guid studentId, Guid actingUserId, bool isAdmin);
    }
}