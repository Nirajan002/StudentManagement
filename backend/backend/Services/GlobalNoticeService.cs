namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Modules;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;


    public class GlobalNoticeService : IGlobalNoticeService
    {
        private readonly StudentManagement dbContext;
        private readonly IFileStorageService fileStorage;

        public GlobalNoticeService(StudentManagement dbContext, IFileStorageService fileStorage)
        {
            this.dbContext = dbContext;
            this.fileStorage = fileStorage;
        }

        public async Task<IEnumerable<object>> GetNoticesAsync()
        {
            await RemoveExpiredAsync();

            return await dbContext.GlobalNotices
                .OrderByDescending(n => n.PostedAt)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Content,
                    n.FileName,
                    n.OriginalFileName,
                    n.AutoDeleteAt,
                    n.PostedById,
                    PostedByName = n.PostedBy.FullName,
                    n.PostedAt
                })
                .ToListAsync();
        }

        public async Task<object> CreateNoticeAsync(Guid postedById, CreateGlobalNoticeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                throw new ValidationException("Title is required.");

            if (string.IsNullOrWhiteSpace(request.Content) && (request.File == null || request.File.Length == 0))
                throw new ValidationException("Add a message or attach a file.");

            if (request.AutoDeleteAt.HasValue && request.AutoDeleteAt.Value <= DateTime.UtcNow)
                throw new ValidationException("Auto-delete date must be in the future.");

            string? storedFileName = null;
            string? originalFileName = null;

            if (request.File != null && request.File.Length > 0)
            {
                storedFileName = await fileStorage.SaveAsync(request.File);
                originalFileName = request.File.FileName;
            }

            var notice = new GlobalNotice
            {
                Title = request.Title,
                Content = request.Content,
                FileName = storedFileName,
                OriginalFileName = originalFileName,
                AutoDeleteAt = request.AutoDeleteAt,
                PostedById = postedById,
                PostedAt = DateTime.UtcNow
            };

            dbContext.GlobalNotices.Add(notice);
            await dbContext.SaveChangesAsync();

            var postedBy = await dbContext.Teachers.FindAsync(postedById);

            return new
            {
                notice.Id,
                notice.Title,
                notice.Content,
                notice.FileName,
                notice.OriginalFileName,
                notice.AutoDeleteAt,
                notice.PostedById,
                PostedByName = postedBy?.FullName,
                notice.PostedAt
            };
        }

        public async Task DeleteNoticeAsync(int id)
        {
            var notice = await dbContext.GlobalNotices.FindAsync(id) ?? throw new NotFoundException();

            fileStorage.Delete(notice.FileName);

            dbContext.GlobalNotices.Remove(notice);
            await dbContext.SaveChangesAsync();
        }

        public async Task<FileDownloadResult> DownloadNoticeAsync(int id)
        {
            var notice = await dbContext.GlobalNotices.FindAsync(id);

            if (notice == null || string.IsNullOrEmpty(notice.FileName))
                throw new NotFoundException();

            var bytes = await fileStorage.ReadAsync(notice.FileName) ?? throw new NotFoundException();

            return new FileDownloadResult(bytes, notice.OriginalFileName ?? notice.FileName);
        }

        private async Task RemoveExpiredAsync()
        {
            var now = DateTime.UtcNow;

            var expired = await dbContext.GlobalNotices
                .Where(n => n.AutoDeleteAt != null && n.AutoDeleteAt <= now)
                .ToListAsync();

            if (expired.Count == 0) return;

            foreach (var notice in expired)
            {
                fileStorage.Delete(notice.FileName);
            }

            dbContext.GlobalNotices.RemoveRange(expired);
            await dbContext.SaveChangesAsync();
        }
    }
}