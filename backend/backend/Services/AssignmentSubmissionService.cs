namespace backend.Services
{
    using backend.Data;
    using backend.Modules;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class AssignmentSubmissionService : IAssignmentSubmissionService
    {
        private readonly StudentManagement dbContext;
        private readonly IGroupService groupService;
        private readonly IFileStorageService fileStorage;

        public AssignmentSubmissionService(StudentManagement dbContext, IGroupService groupService, IFileStorageService fileStorage)
        {
            this.dbContext = dbContext;
            this.groupService = groupService;
            this.fileStorage = fileStorage;
        }

        private async Task<GroupPost> GetAssignmentAsync(int postId)
        {
            var post = await dbContext.GroupPosts.FindAsync(postId)
                ?? throw new NotFoundException("Assignment not found.");

            if (post.Type != "Assignment")
                throw new ValidationException("Submission tracking is only available for assignments.");

            return post;
        }

        private async Task<bool> IsGroupMemberAsync(int groupId, Guid studentId) =>
            await dbContext.GroupMembers.AnyAsync(m =>
                m.GroupId == groupId && m.StudentId == studentId && m.RemovedAt == null);

        private static bool AllowsOnline(GroupPost post) =>
            post.SubmissionMode is AssignmentSubmissionMode.Online or AssignmentSubmissionMode.Both;

        // =========================
        // PHYSICAL TRACKING (unchanged authorization — creator, co-teachers, or Admin)
        // =========================

        public async Task<object> GetSubmissionsAsync(int postId, Guid userId, bool isAdmin)
        {
            var post = await GetAssignmentAsync(postId);

            if (!await groupService.CanManageGroupAsync(post.GroupId, userId, isAdmin))
                throw new ForbiddenException();

            var members = await dbContext.GroupMembers
                .Where(m => m.GroupId == post.GroupId && m.RemovedAt == null)
                .Select(m => new { m.StudentId, m.Student.FullName, m.Student.Email, m.Student.Profile })
                .ToListAsync();

            var submissionsByStudent = await dbContext.AssignmentSubmissions
                .Where(s => s.GroupPostId == postId)
                .ToDictionaryAsync(s => s.StudentId);

            var students = members
                .OrderBy(m => m.FullName)
                .Select(m =>
                {
                    submissionsByStudent.TryGetValue(m.StudentId, out var submission);

                    return new
                    {
                        m.StudentId,
                        m.FullName,
                        m.Email,
                        m.Profile,
                        Status = (submission?.Status ?? SubmissionStatus.NotSubmitted).ToString(),
                        SubmittedAt = submission?.SubmittedAt
                    };
                })
                .ToList();

            return new
            {
                AssignmentId = post.Id,
                post.Title,
                post.GroupId,
                post.DueDate,
                TotalStudents = students.Count,
                SubmittedCount = students.Count(s => s.Status == nameof(SubmissionStatus.Submitted)),
                Students = students
            };
        }

        public async Task<object> SetSubmissionStatusAsync(int postId, Guid studentId, Guid actingUserId, bool isAdmin, bool submitted)
        {
            var post = await GetAssignmentAsync(postId);

            if (!await groupService.CanManageGroupAsync(post.GroupId, actingUserId, isAdmin))
                throw new ForbiddenException();

            if (!await IsGroupMemberAsync(post.GroupId, studentId))
                throw new NotFoundException("This student is not a member of the assignment's group.");

            var submission = await dbContext.AssignmentSubmissions
                .FirstOrDefaultAsync(s => s.GroupPostId == postId && s.StudentId == studentId);

            if (submission == null)
            {
                submission = new AssignmentSubmission { GroupPostId = postId, StudentId = studentId };
                dbContext.AssignmentSubmissions.Add(submission);
            }

            submission.Status = submitted ? SubmissionStatus.Submitted : SubmissionStatus.NotSubmitted;
            submission.SubmittedAt = submitted ? DateTime.UtcNow : null;
            submission.UpdatedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            return new { submission.StudentId, Status = submission.Status.ToString(), submission.SubmittedAt };
        }

        public async Task<object> GetMySubmissionAsync(int postId, Guid studentId)
        {
            var post = await GetAssignmentAsync(postId);

            if (!await IsGroupMemberAsync(post.GroupId, studentId))
                throw new ForbiddenException();

            var submission = await dbContext.AssignmentSubmissions
                .FirstOrDefaultAsync(s => s.GroupPostId == postId && s.StudentId == studentId);

            return new
            {
                Status = (submission?.Status ?? SubmissionStatus.NotSubmitted).ToString(),
                SubmittedAt = submission?.SubmittedAt,
                OriginalFileName = submission?.OriginalFileName,
                OnlineSubmittedAt = submission?.OnlineSubmittedAt
            };
        }

        // =========================
        // ONLINE SUBMISSIONS
        // =========================

        public async Task<object> SubmitOnlineWorkAsync(int postId, Guid studentId, IFormFile file)
        {
            var post = await GetAssignmentAsync(postId);

            if (!AllowsOnline(post))
                throw new ValidationException("This assignment does not accept online submissions.");

            if (!await IsGroupMemberAsync(post.GroupId, studentId))
                throw new ForbiddenException();

            if (file == null || file.Length == 0)
                throw new ValidationException("Please choose a file to submit.");

            var submission = await dbContext.AssignmentSubmissions
                .FirstOrDefaultAsync(s => s.GroupPostId == postId && s.StudentId == studentId);

            if (submission == null)
            {
                submission = new AssignmentSubmission { GroupPostId = postId, StudentId = studentId };
                dbContext.AssignmentSubmissions.Add(submission);
            }

            // Re-submitting replaces the previous file rather than keeping both.
            fileStorage.Delete(submission.FileName);

            submission.FileName = await fileStorage.SaveAsync(file, FileCategory.Document);
            submission.OriginalFileName = file.FileName;
            submission.OnlineSubmittedAt = DateTime.UtcNow;
            submission.UpdatedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            return new { submission.OriginalFileName, submission.OnlineSubmittedAt };
        }

        public async Task<FileDownloadResult> DownloadMyOnlineSubmissionAsync(int postId, Guid studentId)
        {
            var post = await GetAssignmentAsync(postId);

            if (!await IsGroupMemberAsync(post.GroupId, studentId))
                throw new ForbiddenException();

            var submission = await dbContext.AssignmentSubmissions
                .FirstOrDefaultAsync(s => s.GroupPostId == postId && s.StudentId == studentId);

            if (submission == null || string.IsNullOrEmpty(submission.FileName))
                throw new NotFoundException();

            var bytes = await fileStorage.ReadAsync(submission.FileName) ?? throw new NotFoundException();

            return new FileDownloadResult(bytes, submission.OriginalFileName ?? submission.FileName);
        }

        public async Task<object> GetOnlineSubmissionsAsync(int postId, Guid actingUserId)
        {
            var post = await GetAssignmentAsync(postId);

            // Deliberately stricter than the physical tracker: only the exact
            // teacher who posted this assignment can see who submitted online
            // — not co-teachers, not Admin.
            if (post.PostedById != actingUserId)
                throw new ForbiddenException();

            var members = await dbContext.GroupMembers
                .Where(m => m.GroupId == post.GroupId && m.RemovedAt == null)
                .Select(m => new { m.StudentId, m.Student.FullName, m.Student.Email, m.Student.Profile })
                .ToListAsync();

            var submissionsByStudent = await dbContext.AssignmentSubmissions
                .Where(s => s.GroupPostId == postId)
                .ToDictionaryAsync(s => s.StudentId);

            var students = members
                .OrderBy(m => m.FullName)
                .Select(m =>
                {
                    submissionsByStudent.TryGetValue(m.StudentId, out var submission);
                    var hasSubmitted = submission != null && !string.IsNullOrEmpty(submission.FileName);

                    return new
                    {
                        m.StudentId,
                        m.FullName,
                        m.Email,
                        m.Profile,
                        HasSubmitted = hasSubmitted,
                        OriginalFileName = submission?.OriginalFileName,
                        OnlineSubmittedAt = submission?.OnlineSubmittedAt
                    };
                })
                .ToList();

            return new
            {
                AssignmentId = post.Id,
                post.Title,
                post.GroupId,
                TotalStudents = students.Count,
                SubmittedCount = students.Count(s => s.HasSubmitted),
                Students = students
            };
        }

        public async Task<FileDownloadResult> DownloadOnlineSubmissionAsync(int postId, Guid studentId, Guid actingUserId)
        {
            var post = await GetAssignmentAsync(postId);

            if (post.PostedById != actingUserId)
                throw new ForbiddenException();

            var submission = await dbContext.AssignmentSubmissions
                .FirstOrDefaultAsync(s => s.GroupPostId == postId && s.StudentId == studentId);

            if (submission == null || string.IsNullOrEmpty(submission.FileName))
                throw new NotFoundException();

            var bytes = await fileStorage.ReadAsync(submission.FileName) ?? throw new NotFoundException();

            return new FileDownloadResult(bytes, submission.OriginalFileName ?? submission.FileName);
        }
    }
}