namespace backend.Services.Interfaces
{
    using backend.DTOs;

    public interface IGlobalNoticeService
    {
        Task<IEnumerable<object>> GetNoticesAsync();
        Task<object> CreateNoticeAsync(Guid postedById, CreateGlobalNoticeRequest request);
        Task DeleteNoticeAsync(int id);
        Task<FileDownloadResult> DownloadNoticeAsync(int id);
    }
}