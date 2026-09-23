namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Modules;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class GroupService : IGroupService
    {
        private readonly StudentManagement dbContext;
        private readonly IFileStorageService fileStorage; // NEW

        public GroupService(StudentManagement dbContext, IFileStorageService fileStorage) // NEW param
        {
            this.dbContext = dbContext;
            this.fileStorage = fileStorage;
        }

        public async Task<object> CreateGroupAsync(Guid creatorId, CreateGroupRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ValidationException("Group name is required.");

            string? backgroundImage = null;
            if (request.BackgroundImage is { Length: > 0 })
            {
                backgroundImage = await fileStorage.SaveAsync(request.BackgroundImage, FileCategory.Image);
            }

            var group = new Group
            {
                Name = request.Name,
                Description = request.Description,
                BackgroundImage = backgroundImage,
                CreatedById = creatorId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            dbContext.Groups.Add(group);
            await dbContext.SaveChangesAsync();

            if (request.StudentIds != null && request.StudentIds.Any())
            {
                var validStudentIds = await dbContext.Students
                    .Where(s => request.StudentIds.Contains(s.Id))
                    .Select(s => s.Id)
                    .ToListAsync();

                foreach (var studentId in validStudentIds)
                {
                    dbContext.GroupMembers.Add(new GroupMember
                    {
                        GroupId = group.Id,
                        StudentId = studentId,
                        AddedById = creatorId,
                        AddedAt = DateTime.UtcNow
                    });
                }

                await dbContext.SaveChangesAsync();
            }

            return new { group.Id, group.Name, group.Description, group.BackgroundImage, group.CreatedById, group.CreatedAt };
        }

        public async Task<object> UpdateGroupAsync(int groupId, Guid actingUserId, bool isAdmin, UpdateGroupRequest request)
        {
            var group = await dbContext.Groups.FindAsync(groupId) ?? throw new NotFoundException();

            if (!isAdmin && group.CreatedById != actingUserId)
                throw new ForbiddenException();

            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ValidationException("Group name is required.");

            group.Name = request.Name;
            group.Description = request.Description;

            if (request.RemoveBackgroundImage)
            {
                fileStorage.Delete(group.BackgroundImage);
                group.BackgroundImage = null;
            }
            else if (request.BackgroundImage is { Length: > 0 })
            {
                fileStorage.Delete(group.BackgroundImage);
                group.BackgroundImage = await fileStorage.SaveAsync(request.BackgroundImage, FileCategory.Image);
            }

            await dbContext.SaveChangesAsync();

            return new { group.Id, group.Name, group.Description, group.BackgroundImage };
        }

        public async Task<IEnumerable<object>> GetGroupsAsync(Guid userId, bool isAdmin, bool isStudent)
        {
            var query = dbContext.Groups.Where(g => g.IsActive);

            if (isAdmin) { }
            else if (isStudent)
                query = query.Where(g => g.Members.Any(m => m.StudentId == userId && m.RemovedAt == null));
            else
                query = query.Where(g => g.CreatedById == userId || g.Managers.Any(m => m.UserId == userId));

            var groups = await query
                .Select(g => new
                {
                    g.Id,
                    g.Name,
                    g.Description,
                    g.BackgroundImage, // NEW
                    g.CreatedById,
                    CreatedByName = g.CreatedBy.FullName,
                    g.CreatedAt,
                    MemberCount = g.Members.Count(m => m.RemovedAt == null),
                    LastPostAt = dbContext.GroupPosts
                        .Where(p => p.GroupId == g.Id)
                        .OrderByDescending(p => p.PostedAt)
                        .Select(p => (DateTime?)p.PostedAt)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return groups.Select(g => new
            {
                g.Id,
                g.Name,
                g.Description,
                g.BackgroundImage,
                g.CreatedById,
                g.CreatedByName,
                CreatedAt = DateTime.SpecifyKind(g.CreatedAt, DateTimeKind.Utc),
                g.MemberCount,
                LastPostAt = g.LastPostAt.HasValue
                    ? DateTime.SpecifyKind(g.LastPostAt.Value, DateTimeKind.Utc)
                    : (DateTime?)null
            });
        }

        public async Task<object> GetGroupAsync(int id, Guid userId, bool isAdmin, bool isStudent)
        {
            if (!await CanViewGroupAsync(id, userId, isAdmin, isStudent))
                throw new ForbiddenException();

            var group = await dbContext.Groups
                .Where(g => g.Id == id)
                .Select(g => new
                {
                    g.Id,
                    g.Name,
                    g.Description,
                    g.BackgroundImage, // NEW
                    g.CreatedById,
                    CreatedByName = g.CreatedBy.FullName,
                    CreatedByRole = g.CreatedBy.Role,
                    g.CreatedAt,
                    Managers = g.Managers.Select(m => new
                    {
                        TeacherId = m.UserId,
                        m.User.FullName,
                        m.User.Email,
                        m.User.Profile,
                        m.AssignedAt
                    }),
                    Members = g.Members
                        .Where(m => m.RemovedAt == null)
                        .Select(m => new
                        {
                            m.StudentId,
                            m.Student.FullName,
                            m.Student.Email,
                            m.Student.Profile,
                            m.AddedAt
                        })
                })
                .FirstOrDefaultAsync();

            return group ?? throw new NotFoundException();
        }

        public async Task<bool> CanViewGroupAsync(int groupId, Guid userId, bool isAdmin, bool isStudent)
        {
            if (isAdmin) return true;

            if (isStudent)
                return await dbContext.GroupMembers.AnyAsync(m =>
                    m.GroupId == groupId && m.StudentId == userId && m.RemovedAt == null);

            return await dbContext.Groups.AnyAsync(g =>
                g.Id == groupId && (g.CreatedById == userId || g.Managers.Any(m => m.UserId == userId)));
        }

        public async Task<bool> CanManageGroupAsync(int groupId, Guid userId, bool isAdmin)
        {
            if (isAdmin) return true;

            return await dbContext.Groups.AnyAsync(g =>
                g.Id == groupId && (g.CreatedById == userId || g.Managers.Any(m => m.UserId == userId)));
        }

        public async Task<(int Added, int Skipped)> AddMembersAsync(int groupId, Guid actingUserId, bool isAdmin, AddGroupMembersRequest request)
        {
            if (!await CanManageGroupAsync(groupId, actingUserId, isAdmin))
                throw new ForbiddenException();

            var group = await dbContext.Groups.FindAsync(groupId) ?? throw new NotFoundException("Group not found.");

            if (request.StudentIds == null || !request.StudentIds.Any())
                throw new ValidationException("At least one student is required.");

            var existingActiveIds = await dbContext.GroupMembers
                .Where(gm => gm.GroupId == groupId && gm.RemovedAt == null)
                .Select(gm => gm.StudentId)
                .ToListAsync();

            var validStudentIds = await dbContext.Students
                .Where(s => request.StudentIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            var toAdd = validStudentIds.Except(existingActiveIds).ToList();

            foreach (var studentId in toAdd)
            {
                dbContext.GroupMembers.Add(new GroupMember
                {
                    GroupId = groupId,
                    StudentId = studentId,
                    AddedById = actingUserId,
                    AddedAt = DateTime.UtcNow
                });
            }

            await dbContext.SaveChangesAsync();

            return (toAdd.Count, validStudentIds.Count - toAdd.Count);
        }

        public async Task RemoveMemberAsync(int groupId, Guid studentId, Guid actingUserId, bool isAdmin)
        {
            if (!await CanManageGroupAsync(groupId, actingUserId, isAdmin))
                throw new ForbiddenException();

            var member = await dbContext.GroupMembers.FirstOrDefaultAsync(gm =>
                gm.GroupId == groupId && gm.StudentId == studentId && gm.RemovedAt == null)
                ?? throw new NotFoundException("Active membership not found.");

            member.RemovedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }

        public async Task DeleteGroupAsync(int groupId, Guid actingUserId, bool isAdmin)
        {
            var group = await dbContext.Groups.FindAsync(groupId) ?? throw new NotFoundException();

            if (!isAdmin && group.CreatedById != actingUserId)
                throw new ForbiddenException();

            group.IsActive = false;
            await dbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<object>> GetGroupsForStudentAsync(Guid studentId)
        {
            return await dbContext.GroupMembers
                .Where(gm => gm.StudentId == studentId && gm.RemovedAt == null)
                .Select(gm => new { gm.Group.Id, gm.Group.Name, gm.Group.Description })
                .ToListAsync();
        }

        public async Task<(int Added, int Skipped)> AddManagersAsync(int groupId, Guid actingUserId, bool isAdmin, AddGroupManagersRequest request)
        {
            var group = await dbContext.Groups
                .Include(g => g.Managers)
                .FirstOrDefaultAsync(g => g.Id == groupId) ?? throw new NotFoundException("Group not found.");

            if (!isAdmin && group.CreatedById != actingUserId)
                throw new ForbiddenException();

            if (request.TeacherIds == null || !request.TeacherIds.Any())
                throw new ValidationException("At least one teacher is required.");

            var existingManagerIds = group.Managers.Select(m => m.UserId).ToList();

            var validTeacherIds = await dbContext.Teachers
                .Where(t => request.TeacherIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync();

            var toAdd = validTeacherIds
                .Except(existingManagerIds)
                .Where(tid => tid != group.CreatedById)
                .ToList();

            foreach (var teacherId in toAdd)
            {
                dbContext.GroupManagers.Add(new GroupManager
                {
                    GroupId = groupId,
                    UserId = teacherId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await dbContext.SaveChangesAsync();

            return (toAdd.Count, validTeacherIds.Count - toAdd.Count);
        }

        public async Task RemoveManagerAsync(int groupId, Guid teacherId, Guid actingUserId, bool isAdmin)
        {
            var group = await dbContext.Groups.FindAsync(groupId) ?? throw new NotFoundException();

            if (!isAdmin && group.CreatedById != actingUserId)
                throw new ForbiddenException();

            var manager = await dbContext.GroupManagers
                .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == teacherId)
                ?? throw new NotFoundException("Manager not found.");

            dbContext.GroupManagers.Remove(manager);
            await dbContext.SaveChangesAsync();
        }
    }
}