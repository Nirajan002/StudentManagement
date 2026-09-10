using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly StudentManagement dbContext;

        public DashboardController(StudentManagement dbContext)
        {
            this.dbContext = dbContext;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [Authorize(Roles = "Admin")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var now = DateTime.UtcNow;
            var weekAgo = now.AddDays(-7);

            var totalTeachers = await dbContext.Teachers.CountAsync(t => t.Role != "Admin");
            var totalAdmins = await dbContext.Teachers.CountAsync(t => t.Role == "Admin");
            var totalStudents = await dbContext.Students.CountAsync();

            var activeGroups = await dbContext.Groups.CountAsync(g => g.IsActive);
            var inactiveGroups = await dbContext.Groups.CountAsync(g => !g.IsActive);

            var totalNotices = await dbContext.GroupPosts.CountAsync(p => p.Type == "Notice");
            var totalAssignments = await dbContext.GroupPosts.CountAsync(p => p.Type == "Assignment");

            var newStudentsThisWeek = await dbContext.Students.CountAsync(s => s.CreatedAt >= weekAgo);
            var newTeachersThisWeek = await dbContext.Teachers.CountAsync(t => t.CreatedAt >= weekAgo && t.Role != "Admin");

            var genderBreakdown = await dbContext.Students
                .GroupBy(s => s.Gender ?? "Not specified")
                .Select(g => new { Gender = g.Key, Count = g.Count() })
                .ToListAsync();

            var groupsMissingCoTeacher = await dbContext.Groups
                .Where(g => g.IsActive && !g.Managers.Any())
                .CountAsync();

            var activeMemberCount = await dbContext.GroupMembers
                .CountAsync(m => m.RemovedAt == null && m.Group.IsActive);

            var averageGroupSize = activeGroups > 0
                ? Math.Round(activeMemberCount / (double)activeGroups, 1)
                : 0;

            var recentActivity = await dbContext.GroupPosts
                .OrderByDescending(p => p.PostedAt)
                .Take(8)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Type,
                    p.Title,
                    PostedByName = p.PostedBy.FullName,
                    p.PostedAt
                })
                .ToListAsync();

            var upcomingAssignments = await dbContext.GroupPosts
                .Where(p => p.Type == "Assignment" && p.DueDate != null && p.DueDate >= now)
                .OrderBy(p => p.DueDate)
                .Take(5)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Title,
                    p.DueDate
                })
                .ToListAsync();

            return Ok(new
            {
                totalTeachers,
                totalAdmins,
                totalStudents,
                activeGroups,
                inactiveGroups,
                totalNotices,
                totalAssignments,
                newStudentsThisWeek,
                newTeachersThisWeek,
                genderBreakdown,
                groupsMissingCoTeacher,
                averageGroupSize,
                recentActivity,
                upcomingAssignments
            });
        }

        // =========================
        // TEACHER DASHBOARD
        // =========================
        [Authorize(Roles = "Teacher,Admin")]
        [HttpGet("teacher-dashboard")]
        public async Task<IActionResult> GetTeacherDashboard()
        {
            var userId = CurrentUserId;
            var now = DateTime.UtcNow;

            var myGroupsQuery = dbContext.Groups.Where(g =>
                g.IsActive &&
                (g.CreatedById == userId || g.Managers.Any(m => m.UserId == userId)));

            var totalGroups = await myGroupsQuery.CountAsync();
            var ownedGroups = await myGroupsQuery.CountAsync(g => g.CreatedById == userId);
            var coManagedGroups = totalGroups - ownedGroups;

            var totalStudents = await dbContext.GroupMembers
                .Where(m =>
                    m.RemovedAt == null &&
                    m.Group.IsActive &&
                    (m.Group.CreatedById == userId || m.Group.Managers.Any(mg => mg.UserId == userId)))
                .Select(m => m.StudentId)
                .Distinct()
                .CountAsync();

            var totalNotices = await dbContext.GroupPosts
                .CountAsync(p =>
                    p.Type == "Notice" &&
                    p.Group.IsActive &&
                    (p.Group.CreatedById == userId || p.Group.Managers.Any(m => m.UserId == userId)));

            var totalAssignmentsPosted = await dbContext.GroupPosts
                .CountAsync(p => p.Type == "Assignment" && p.PostedById == userId);

            var recentActivity = await dbContext.GroupPosts
                .Where(p =>
                    p.Group.IsActive &&
                    (p.Group.CreatedById == userId || p.Group.Managers.Any(m => m.UserId == userId)))
                .OrderByDescending(p => p.PostedAt)
                .Take(8)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Type,
                    p.Title,
                    PostedByName = p.PostedBy.FullName,
                    p.PostedAt
                })
                .ToListAsync();

            // Only assignments this teacher personally posted
            var upcomingAssignments = await dbContext.GroupPosts
                .Where(p =>
                    p.Type == "Assignment" &&
                    p.PostedById == userId &&
                    p.DueDate != null &&
                    p.DueDate >= now)
                .OrderBy(p => p.DueDate)
                .Take(5)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Title,
                    p.DueDate
                })
                .ToListAsync();

            var myGroups = await myGroupsQuery
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new
                {
                    g.Id,
                    g.Name,
                    MemberCount = g.Members.Count(m => m.RemovedAt == null),
                    IsOwner = g.CreatedById == userId
                })
                .Take(6)
                .ToListAsync();

            return Ok(new
            {
                totalGroups,
                ownedGroups,
                coManagedGroups,
                totalStudents,
                totalNotices,
                totalAssignmentsPosted,
                recentActivity,
                upcomingAssignments,
                myGroups
            });
        }

        // =========================
        // STUDENT DASHBOARD
        // =========================
        [Authorize(Roles = "Student")]
        [HttpGet("student-dashboard")]
        public async Task<IActionResult> GetStudentDashboard()
        {
            var studentId = CurrentUserId;
            var now = DateTime.UtcNow;

            var totalGroups = await dbContext.GroupMembers
                .CountAsync(m => m.StudentId == studentId && m.RemovedAt == null && m.Group.IsActive);

            var totalAssignments = await dbContext.GroupPosts
                .CountAsync(p =>
                    p.Type == "Assignment" &&
                    p.Group.IsActive &&
                    p.Group.Members.Any(m => m.StudentId == studentId && m.RemovedAt == null));

            var totalNotices = await dbContext.GroupPosts
                .CountAsync(p =>
                    p.Type == "Notice" &&
                    p.Group.IsActive &&
                    p.Group.Members.Any(m => m.StudentId == studentId && m.RemovedAt == null));

            var recentActivity = await dbContext.GroupPosts
                .Where(p =>
                    p.Group.IsActive &&
                    p.Group.Members.Any(m => m.StudentId == studentId && m.RemovedAt == null))
                .OrderByDescending(p => p.PostedAt)
                .Take(8)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Type,
                    p.Title,
                    PostedByName = p.PostedBy.FullName,
                    p.PostedAt
                })
                .ToListAsync();

            var upcomingAssignments = await dbContext.GroupPosts
                .Where(p =>
                    p.Type == "Assignment" &&
                    p.DueDate != null &&
                    p.DueDate >= now &&
                    p.Group.IsActive &&
                    p.Group.Members.Any(m => m.StudentId == studentId && m.RemovedAt == null))
                .OrderBy(p => p.DueDate)
                .Take(5)
                .Select(p => new
                {
                    p.Id,
                    p.GroupId,
                    GroupName = p.Group.Name,
                    p.Title,
                    p.DueDate
                })
                .ToListAsync();

            var myGroups = await dbContext.GroupMembers
                .Where(m => m.StudentId == studentId && m.RemovedAt == null && m.Group.IsActive)
                .OrderByDescending(m => m.AddedAt)
                .Select(m => new
                {
                    m.Group.Id,
                    m.Group.Name,
                    MemberCount = m.Group.Members.Count(mm => mm.RemovedAt == null)
                })
                .Take(6)
                .ToListAsync();

            return Ok(new
            {
                totalGroups,
                totalAssignments,
                totalNotices,
                recentActivity,
                upcomingAssignments,
                myGroups
            });
        }
    }
}