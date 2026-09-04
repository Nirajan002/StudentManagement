using backend.Data;
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

        // Checks whether the current user can manage (edit members of) a given group:
        // Admins can manage any group; Teachers only groups they created or co-manage.
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

        // GET api/groups
        // Admin sees all groups; Teacher sees groups they created or co-manage
        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var query = dbContext.Groups
                .Where(g => g.IsActive);

            if (!IsAdmin)
            {
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
                    g.CreatedAt,
                    MemberCount = g.Members.Count(m => m.RemovedAt == null)
                })
                .ToListAsync();

            return Ok(groups);
        }

        // GET api/groups/{id}
        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroup(int id)
        {
            if (!await CanManageGroup(id) && !IsAdmin)
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
                    g.CreatedAt,
                    Members = g.Members
                        .Where(m => m.RemovedAt == null)
                        .Select(m => new
                        {
                            m.StudentId,
                            m.Student.FullName,
                            m.Student.Email,
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

        // DELETE api/groups/{id}
        // Deactivate a group (soft delete) — Admin only, or the Teacher who created it
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

        // GET api/groups/student/{studentId}
        // Lists groups a given student belongs to (for admin/teacher lookup)
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
    }
}