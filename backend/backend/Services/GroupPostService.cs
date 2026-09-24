namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Modules;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class GroupPostService : IGroupPostService
    {
        private readonly StudentManagement dbContext;
        private readonly IFileStorageService fileStorage;
        private readonly IGroupService groupService;
        private readonly IRealtimeNotifier realtimeNotifier;

        public GroupPostService(StudentManagement dbContext, IFileStorageService fileStorage, IGroupService groupService, IRealtimeNotifier realtimeNotifier)
        {
            this.dbContext = dbContext;
            this.fileStorage = fileStorage;
            this.groupService = groupService;
            this.realtimeNotifier = realtimeNotifier;
        }

        public async Task<object> CreatePostAsync(int groupId, Guid postedById, bool isAdmin, CreateGroupPostRequest request)
        {
            if (!await groupService.CanManageGroupAsync(groupId, postedById, isAdmin))
                throw new ForbiddenException();

            var group = await dbContext.Groups.FindAsync(groupId)
                ?? throw new NotFoundException("Group not found.");

            if (string.IsNullOrWhiteSpace(request.Title))
                throw new ValidationException("Title is required.");

            var type = request.Type == "Notice" ? "Notice" : "Assignment";

            if (type == "Notice" && string.IsNullOrWhiteSpace(request.Content))
                throw new ValidationException("Notice content is required.");

            if (type == "Assignment" && (request.File == null || request.File.Length == 0))
                throw new ValidationException("A file is required for assignments.");

            if (request.AutoDeleteAt.HasValue && request.AutoDeleteAt.Value <= DateTime.UtcNow)
                throw new ValidationException("Auto-delete date must be in the future.");

            AssignmentSubmissionMode? submissionMode = null;

            if (type == "Assignment")
            {
                submissionMode = request.SubmissionMode?.Trim().ToLowerInvariant() switch
                {
                    "online" => AssignmentSubmissionMode.Online,
                    "both" => AssignmentSubmissionMode.Both,
                    _ => AssignmentSubmissionMode.Physical
                };
            }

            string? storedFileName = null;
            string? originalFileName = null;

            if (request.File != null && request.File.Length > 0)
            {
                storedFileName = await fileStorage.SaveAsync(request.File);
                originalFileName = request.File.FileName;
            }

            var post = new GroupPost
            {
                GroupId = groupId,
                Type = type,
                Title = request.Title,
                Content = request.Content,
                FileName = storedFileName,
                OriginalFileName = originalFileName,
                DueDate = type == "Assignment" ? request.DueDate : null,
                AutoDeleteAt = request.AutoDeleteAt,
                PostedById = postedById,
                PostedAt = DateTime.UtcNow,

                // Assignment submission mode
                SubmissionMode = submissionMode
            };

            dbContext.GroupPosts.Add(post);
            await dbContext.SaveChangesAsync();

            var postedBy = await dbContext.Teachers.FindAsync(postedById);

            var result = new
            {
                post.Id,
                post.GroupId,
                post.Type,
                post.Title,
                post.Content,
                post.FileName,
                post.OriginalFileName,
                post.DueDate,
                post.AutoDeleteAt,

                // Assignment submission mode
                SubmissionMode = post.SubmissionMode?.ToString(),

                post.PostedById,
                PostedByName = postedBy?.FullName,
                post.PostedAt
            };

            var memberIds = await dbContext.GroupMembers
                .Where(m => m.GroupId == groupId && m.RemovedAt == null)
                .Select(m => m.StudentId)
                .ToListAsync();

            var managerIds = await dbContext.GroupManagers
                .Where(m => m.GroupId == groupId)
                .Select(m => m.UserId)
                .ToListAsync();

            var recipientIds = memberIds
                .Concat(managerIds)
                .Append(group.CreatedById)
                .Where(uid => uid != postedById)
                .Distinct();

            await realtimeNotifier.NotifyGroupPostAsync(groupId, recipientIds, result);

            return result;
        }

        public async Task<IEnumerable<object>> GetPostsAsync(int groupId, Guid userId, bool isAdmin, bool isStudent)
        {
            if (!await groupService.CanViewGroupAsync(groupId, userId, isAdmin, isStudent))
                throw new ForbiddenException();

            await RemoveExpiredAsync(groupId);

            // Students now see all assignments, including past-due ones — they just
            // can't submit once the due date passes (enforced server-side in
            // AssignmentSubmissionService.SubmitOnlineWorkAsync).
            var query = dbContext.GroupPosts.Where(p => p.GroupId == groupId);

            return await query
                .OrderByDescending(p => p.PostedAt)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    p.Type,
                    p.Title,
                    p.Content,
                    p.FileName,
                    p.OriginalFileName,
                    p.DueDate,
                    p.AutoDeleteAt,
                    SubmissionMode = p.SubmissionMode == null ? null : p.SubmissionMode.ToString(),

                    // Loophole fix: this is true only once the teacher has ticked it,
                    // not just because a file exists.
                    HasSubmitted = p.Type == "Assignment" && dbContext.AssignmentSubmissions.Any(s =>
                        s.GroupPostId == p.Id &&
                        s.StudentId == userId &&
                        s.Status == SubmissionStatus.Submitted),

                    p.PostedById,
                    PostedByName = p.PostedBy.FullName,
                    p.PostedAt
                })
                .ToListAsync();
        }

        public async Task DeletePostAsync(
            int groupId,
            int postId,
            Guid actingUserId,
            bool isAdmin)
        {
            var post = await dbContext.GroupPosts
                .FirstOrDefaultAsync(p => p.Id == postId && p.GroupId == groupId)
                ?? throw new NotFoundException();

            if (!isAdmin && post.PostedById != actingUserId)
                throw new ForbiddenException();

            fileStorage.Delete(post.FileName);

            dbContext.GroupPosts.Remove(post);
            await dbContext.SaveChangesAsync();
        }

        public async Task<FileDownloadResult> DownloadPostAsync(
            int groupId,
            int postId,
            Guid userId,
            bool isAdmin,
            bool isStudent)
        {
            if (!await groupService.CanViewGroupAsync(groupId, userId, isAdmin, isStudent))
                throw new ForbiddenException();

            var post = await dbContext.GroupPosts
                .FirstOrDefaultAsync(p => p.Id == postId && p.GroupId == groupId);

            if (post == null || string.IsNullOrEmpty(post.FileName))
                throw new NotFoundException();

            if (isStudent &&
                post.Type == "Assignment" &&
                post.DueDate != null &&
                post.DueDate < DateTime.UtcNow)
            {
                throw new ForbiddenException();
            }

            var bytes = await fileStorage.ReadAsync(post.FileName)
                ?? throw new NotFoundException();

            return new FileDownloadResult(
                bytes,
                post.OriginalFileName ?? post.FileName);
        }

        public async Task<IEnumerable<object>> GetRecentNoticesAsync(
    Guid userId,
    bool isAdmin)
        {
            await RemoveExpiredAsync(null);

            var query = dbContext.GroupPosts
                .Where(p => p.Group.IsActive);

            if (!isAdmin)
            {
                query = query.Where(p =>
                    p.Group.CreatedById == userId ||
                    p.Group.Managers.Any(m => m.UserId == userId) ||
                    p.Group.Members.Any(m =>
                        m.StudentId == userId &&
                        m.RemovedAt == null));
            }

            return await query
                .OrderByDescending(p => p.PostedAt)
                .Take(50)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Type,
                    p.Title,
                    p.PostedAt,
                    PostedByName = p.PostedBy.FullName
                })
                .ToListAsync();
        }

        private async Task RemoveExpiredAsync(int? groupId)
        {
            var now = DateTime.UtcNow;

            var query = dbContext.GroupPosts
                .Where(p =>
                    p.AutoDeleteAt != null &&
                    p.AutoDeleteAt <= now);

            if (groupId.HasValue)
            {
                query = query.Where(p =>
                    p.GroupId == groupId.Value);
            }

            var expired = await query.ToListAsync();

            if (expired.Count == 0)
                return;

            foreach (var post in expired)
            {
                fileStorage.Delete(post.FileName);
            }

            dbContext.GroupPosts.RemoveRange(expired);
            await dbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<object>> GetMyAssignmentsAsync(Guid userId)
        {
            await RemoveExpiredAsync(null);

            var now = DateTime.UtcNow;

            // One query, no N+1: member count and submitted count are correlated
            // subqueries evaluated server-side.
            return await dbContext.GroupPosts
                .Where(p =>
                    p.Type == "Assignment" &&
                    p.PostedById == userId &&
                    p.Group.IsActive)
                .OrderByDescending(p => p.PostedAt)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Title,
                    p.OriginalFileName,
                    p.DueDate,
                    p.AutoDeleteAt,

                    // Assignment submission mode
                    SubmissionMode = p.SubmissionMode == null
                        ? null
                        : p.SubmissionMode.ToString(),

                    p.PostedAt,
                    IsPast = p.DueDate != null && p.DueDate < now,

                    TotalStudents = p.Group.Members.Count(
                        m => m.RemovedAt == null),

                    SubmittedCount = dbContext.AssignmentSubmissions
                        .Count(s =>
                            s.GroupPostId == p.Id &&
                            s.Status == SubmissionStatus.Submitted)
                })
                .ToListAsync();
        }
    }
}