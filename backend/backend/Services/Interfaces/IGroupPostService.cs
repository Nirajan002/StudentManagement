namespace backend.Services.Interfaces
{
    using backend.DTOs;

    public record FileDownloadResult(byte[] Bytes, string FileName);

    public interface IGroupPostService
    {
        Task<object> CreatePostAsync(int groupId, Guid postedById, bool isAdmin, CreateGroupPostRequest request);
        Task<IEnumerable<object>> GetPostsAsync(int groupId, Guid userId, bool isAdmin, bool isStudent);
        Task DeletePostAsync(int groupId, int postId, Guid actingUserId, bool isAdmin);
        Task<FileDownloadResult> DownloadPostAsync(int groupId, int postId, Guid userId, bool isAdmin, bool isStudent);
        Task<IEnumerable<object>> GetRecentNoticesAsync(Guid userId, bool isAdmin);
    }
}