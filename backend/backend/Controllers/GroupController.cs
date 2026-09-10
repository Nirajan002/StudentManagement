using backend.Data;
using backend.DTOs;
using backend.Modules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // every action requires a logged-in Teacher/Admin, refined per-action below
    public class GroupsController : Controller
    {
        private readonly StudentManagement dbContext;

        public GroupsController(StudentManagement dbContext)
        {
            this.dbContext = dbContext;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin =>
            User.IsInRole("Admin");

        private bool IsStudent =>
            User.IsInRole("Student");

        private bool IsCreatorOrAdmin(Group group) => IsAdmin || group.CreatedById == CurrentUserId;

        private async Task<bool> CanManageGroup(int groupId)
        {
            if (IsAdmin) return true;

            var userId = CurrentUserId;

            return await dbContext.Groups.AnyAsync(g =>
                g.Id == groupId &&
                (g.CreatedById == userId ||
                 g.Managers.Any(m => m.UserId == userId)));
        }

        // POST api/groups
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost]
        public async Task<IActionResult> CreateGroup(CreateGroupRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "Group name is required." });
            }

            var group = new Group
            {
                Name = request.Name,
                Description = request.Description,
                CreatedById = CurrentUserId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            dbContext.Groups.Add(group);
            await dbContext.SaveChangesAsync();

            // Optionally add initial members in the same call
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
                        AddedById = CurrentUserId,
                        AddedAt = DateTime.UtcNow
                    });
                }

                await dbContext.SaveChangesAsync();
            }

            return Ok(new
            {
                group.Id,
                group.Name,
                group.Description,
                group.CreatedById,
                group.CreatedAt
            });
        }


        // sees groups they're a member of
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var query = dbContext.Groups
                .Where(g => g.IsActive);

            if (IsAdmin)
            {
                // Admins see everything, no extra filter
            }
            else if (IsStudent)
            {
                var studentId = CurrentUserId;

                query = query.Where(g =>
                    g.Members.Any(m => m.StudentId == studentId && m.RemovedAt == null));
            }
            else
            {
                // Teacher
                var userId = CurrentUserId;

                query = query.Where(g =>
                    g.CreatedById == userId ||
                    g.Managers.Any(m => m.UserId == userId));
            }

            var groups = await query
                .Select(g => new
                {
                    g.Id,
                    g.Name,
                    g.Description,
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
                var result = groups.Select(g => new
                {
                    g.Id,
                    g.Name,
                    g.Description,
                    g.CreatedById,
                    g.CreatedByName,
                    CreatedAt = DateTime.SpecifyKind(g.CreatedAt, DateTimeKind.Utc),
                    g.MemberCount,
                    LastPostAt = g.LastPostAt.HasValue
                        ? DateTime.SpecifyKind(g.LastPostAt.Value, DateTimeKind.Utc)
                        : (DateTime?)null
                });

            return Ok(result);
        }

        // GET api/groups/{id}
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroup(int id)
        {
            if (!await CanViewGroup(id))
            {
                return Forbid();
            }

            var group = await dbContext.Groups
                .Where(g => g.Id == id)
                .Select(g => new
                {
                    g.Id,
                    g.Name,
                    g.Description,
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

            if (group == null)
            {
                return NotFound();
            }

            return Ok(group);
        }

        private async Task<bool> CanViewGroup(int groupId)
        {
            if (IsAdmin) return true;

            var userId = CurrentUserId;

            if (IsStudent)
            {
                return await dbContext.GroupMembers.AnyAsync(m =>
                    m.GroupId == groupId &&
                    m.StudentId == userId &&
                    m.RemovedAt == null);
            }

            // Teacher
            return await dbContext.Groups.AnyAsync(g =>
                g.Id == groupId &&
                (g.CreatedById == userId ||
                 g.Managers.Any(m => m.UserId == userId)));
        }

        // POST api/groups/{id}/members
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddMembers(int id, AddGroupMembersRequest request)
        {
            if (!await CanManageGroup(id))
            {
                return Forbid();
            }

            var group = await dbContext.Groups.FindAsync(id);
            if (group == null)
            {
                return NotFound(new { message = "Group not found." });
            }

            if (request.StudentIds == null || !request.StudentIds.Any())
            {
                return BadRequest(new { message = "At least one student is required." });
            }

            // Existing active members — skip duplicates
            var existingActiveIds = await dbContext.GroupMembers
                .Where(gm => gm.GroupId == id && gm.RemovedAt == null)
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
                    GroupId = id,
                    StudentId = studentId,
                    AddedById = CurrentUserId,
                    AddedAt = DateTime.UtcNow
                });
            }

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                added = toAdd.Count,
                skipped = validStudentIds.Count - toAdd.Count
            });
        }

        // DELETE api/groups/{id}/members/{studentId}
        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}/members/{studentId}")]
        public async Task<IActionResult> RemoveMember(int id, Guid studentId)
        {
            if (!await CanManageGroup(id))
            {
                return Forbid();
            }

            var member = await dbContext.GroupMembers
                .FirstOrDefaultAsync(gm =>
                    gm.GroupId == id &&
                    gm.StudentId == studentId &&
                    gm.RemovedAt == null);

            if (member == null)
            {
                return NotFound(new { message = "Active membership not found." });
            }

            member.RemovedAt = DateTime.UtcNow; // soft remove, keeps audit trail

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Student removed from group." });
        }

        // Deactivate a group (soft delete)
        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var group = await dbContext.Groups.FindAsync(id);
            if (group == null)
            {
                return NotFound();
            }

            if (!IsAdmin && group.CreatedById != CurrentUserId)
            {
                return Forbid();
            }

            group.IsActive = false;
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Group deleted." });
        }

        // Lists groups a given student belongs to 
        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetGroupsForStudent(Guid studentId)
        {
            var groups = await dbContext.GroupMembers
                .Where(gm => gm.StudentId == studentId && gm.RemovedAt == null)
                .Select(gm => new
                {
                    gm.Group.Id,
                    gm.Group.Name,
                    gm.Group.Description
                })
                .ToListAsync();

            return Ok(groups);
        }

        // POST api/groups/{id}/managers
        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("{id}/managers")]
        public async Task<IActionResult> AddManagers(int id, AddGroupManagersRequest request)
        {
            var group = await dbContext.Groups
                .Include(g => g.Managers)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
            {
                return NotFound(new { message = "Group not found." });
            }

            if (!IsCreatorOrAdmin(group))
            {
                return Forbid();
            }

            if (request.TeacherIds == null || !request.TeacherIds.Any())
            {
                return BadRequest(new { message = "At least one teacher is required." });
            }

            var existingManagerIds = group.Managers.Select(m => m.UserId).ToList();

            var validTeacherIds = await dbContext.Teachers
                .Where(t => request.TeacherIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync();

            // Can't add the creator as a manager (already implicitly owns the group)
            var toAdd = validTeacherIds
                .Except(existingManagerIds)
                .Where(tid => tid != group.CreatedById)
                .ToList();

            foreach (var teacherId in toAdd)
            {
                dbContext.GroupManagers.Add(new GroupManager
                {
                    GroupId = id,
                    UserId = teacherId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                added = toAdd.Count,
                skipped = validTeacherIds.Count - toAdd.Count
            });
        }

        // DELETE api/groups/{id}/managers/{teacherId}
        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}/managers/{teacherId}")]
        public async Task<IActionResult> RemoveManager(int id, Guid teacherId)
        {
            var group = await dbContext.Groups.FindAsync(id);

            if (group == null)
            {
                return NotFound();
            }

            if (!IsCreatorOrAdmin(group))
            {
                return Forbid();
            }

            var manager = await dbContext.GroupManagers
                .FirstOrDefaultAsync(m => m.GroupId == id && m.UserId == teacherId);

            if (manager == null)
            {
                return NotFound(new { message = "Manager not found." });
            }

            dbContext.GroupManagers.Remove(manager);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Co-teacher removed from group." });
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("{id}/posts")]
        public async Task<IActionResult> CreateGroupPost(int id, [FromForm] CreateGroupPostRequest request)
        {
            if (!await CanManageGroup(id))
            {
                return Forbid();
            }

            var group = await dbContext.Groups.FindAsync(id);
            if (group == null)
            {
                return NotFound(new { message = "Group not found." });
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(new { message = "Title is required." });
            }

            var type = request.Type == "Notice" ? "Notice" : "Assignment";

            if (type == "Notice" && string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { message = "Notice content is required." });
            }

            if (type == "Assignment" && (request.File == null || request.File.Length == 0))
            {
                return BadRequest(new { message = "A file is required for assignments." });
            }

            if (request.AutoDeleteAt.HasValue && request.AutoDeleteAt.Value <= DateTime.UtcNow)
            {
                return BadRequest(new { message = "Auto-delete date must be in the future." });
            }

            string? storedFileName = null;
            string? originalFileName = null;

            if (request.File != null && request.File.Length > 0)
            {
                string uploadPath = Path.Combine(
                    Directory.GetCurrentDirectory(), "wwwroot", "uploads"
                );

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                storedFileName = Guid.NewGuid().ToString() + Path.GetExtension(request.File.FileName);
                originalFileName = request.File.FileName;

                string filePath = Path.Combine(uploadPath, storedFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }
            }

            var post = new GroupPost
            {
                GroupId = id,
                Type = type,
                Title = request.Title,
                Content = request.Content,
                FileName = storedFileName,
                OriginalFileName = originalFileName,
                DueDate = type == "Assignment" ? request.DueDate : null,
                AutoDeleteAt = request.AutoDeleteAt,
                PostedById = CurrentUserId,
                PostedAt = DateTime.UtcNow
            };

            dbContext.GroupPosts.Add(post);
            await dbContext.SaveChangesAsync();

            var postedBy = await dbContext.Teachers.FindAsync(CurrentUserId);

            return Ok(new
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
                post.PostedById,
                PostedByName = postedBy?.FullName,
                post.PostedAt
            });
        }


        // Anyone who can view the group (creator, co-teacher, admin, or member student) can list posts
        [Authorize]
        [HttpGet("{id}/posts")]
        public async Task<IActionResult> GetGroupPosts(int id)
        {
            if (!await CanViewGroup(id))
            {
                return Forbid();
            }

            await RemoveExpiredPostsAsync(id);

            var posts = await dbContext.GroupPosts
                .Where(p => p.GroupId == id)
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
                    p.PostedById,
                    PostedByName = p.PostedBy.FullName,
                    p.PostedAt
                })
                .ToListAsync();

            return Ok(posts);
        }

        // Admin can delete any post; otherwise only the original poster can delete their own
        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}/posts/{postId}")]
        public async Task<IActionResult> DeleteGroupPost(int id, int postId)
        {
            var post = await dbContext.GroupPosts
                .FirstOrDefaultAsync(p => p.Id == postId && p.GroupId == id);

            if (post == null)
            {
                return NotFound();
            }

            if (!IsAdmin && post.PostedById != CurrentUserId)
            {
                return Forbid();
            }

            if (!string.IsNullOrEmpty(post.FileName))
            {
                string uploadPath = Path.Combine(
                    Directory.GetCurrentDirectory(), "wwwroot", "uploads"
                );
                string filePath = Path.Combine(uploadPath, post.FileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            dbContext.GroupPosts.Remove(post);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Post deleted." });
        }

        // GET api/groups/{id}/posts/{postId}/download
        // Anyone who can view the group can download an attached file
        [Authorize]
        [HttpGet("{id}/posts/{postId}/download")]
        public async Task<IActionResult> DownloadGroupPost(int id, int postId)
        {
            if (!await CanViewGroup(id))
            {
                return Forbid();
            }

            var post = await dbContext.GroupPosts
                .FirstOrDefaultAsync(p => p.Id == postId && p.GroupId == id);

            if (post == null || string.IsNullOrEmpty(post.FileName))
            {
                return NotFound();
            }

            string uploadPath = Path.Combine(
                Directory.GetCurrentDirectory(), "wwwroot", "uploads"
            );
            string filePath = Path.Combine(uploadPath, post.FileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var downloadName = post.OriginalFileName ?? post.FileName;

            return File(bytes, "application/octet-stream", downloadName);
        }


        [Authorize]
        [HttpGet("notices")]
        public async Task<IActionResult> GetRecentNotices()
        {
            await RemoveExpiredPostsAsync();

            var query = dbContext.GroupPosts
                .Where(p => p.Type == "Notice")
                .Where(p => p.Group.IsActive);

            if (!IsAdmin)
            {
                var userId = CurrentUserId;

                query = query.Where(p =>
                    p.Group.CreatedById == userId ||
                    p.Group.Managers.Any(m => m.UserId == userId) ||
                    p.Group.Members.Any(m => m.StudentId == userId && m.RemovedAt == null));
            }

            var notices = await query
                .OrderByDescending(p => p.PostedAt)
                .Take(50)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Title,
                    p.PostedAt,
                    PostedByName = p.PostedBy.FullName
                })
                .ToListAsync();

            return Ok(notices);
        }

        private async Task RemoveExpiredPostsAsync(int? groupId = null)
        {
            var now = DateTime.UtcNow;

            var query = dbContext.GroupPosts
                .Where(p => p.AutoDeleteAt != null && p.AutoDeleteAt <= now);

            if (groupId.HasValue)
            {
                query = query.Where(p => p.GroupId == groupId.Value);
            }

            var expired = await query.ToListAsync();
            if (expired.Count == 0) return;

            foreach (var post in expired)
            {
                if (!string.IsNullOrEmpty(post.FileName))
                {
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", post.FileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }

            dbContext.GroupPosts.RemoveRange(expired);
            await dbContext.SaveChangesAsync();
        }

        [Authorize]
        [HttpGet("{id}/last-viewed")]
        public async Task<IActionResult> GetGroupLastViewed(int id)
        {
            if (!await CanViewGroup(id)) return Forbid();

            var state = await dbContext.ReadStates.FirstOrDefaultAsync(r =>
                r.UserId == CurrentUserId &&
                r.ChannelType == ReadChannelType.Group &&
                r.GroupId == id);

            return Ok(new { lastViewedAt = state?.LastReadAt });
        }

        [Authorize]
        [HttpPost("{id}/mark-viewed")]
        public async Task<IActionResult> MarkGroupViewed(int id)
        {
            if (!await CanViewGroup(id)) return Forbid();

            var now = DateTime.UtcNow;

            var state = await dbContext.ReadStates.FirstOrDefaultAsync(r =>
                r.UserId == CurrentUserId &&
                r.ChannelType == ReadChannelType.Group &&
                r.GroupId == id);

            if (state == null)
            {
                dbContext.ReadStates.Add(new ReadState
                {
                    UserId = CurrentUserId,
                    ChannelType = ReadChannelType.Group,
                    GroupId = id,
                    LastReadAt = now
                });
            }
            else
            {
                state.LastReadAt = now;
            }

            await dbContext.SaveChangesAsync();

            return Ok(new { lastViewedAt = now });
        }

        [Authorize]
        [HttpGet("last-viewed")]
        public async Task<IActionResult> GetAllGroupsLastViewed()
        {
            var states = await dbContext.ReadStates
                .Where(r => r.UserId == CurrentUserId && r.ChannelType == ReadChannelType.Group)
                .ToListAsync();

            var result = states.ToDictionary(
                s => s.GroupId!.Value.ToString(),
                s => s.LastReadAt
            );

            return Ok(result);
        }
    }
}