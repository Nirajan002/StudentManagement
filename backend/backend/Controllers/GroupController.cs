using backend.DTOs;
using backend.Modules;
using backend.Services.Exceptions;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupsController : Controller
    {
        private readonly IGroupService groupService;
        private readonly IGroupPostService groupPostService;
        private readonly IReadStateService readStateService;
        private readonly IAssignmentSubmissionService submissionService;

        public GroupsController(IGroupService groupService, IGroupPostService groupPostService, IReadStateService readStateService, IAssignmentSubmissionService submissionService)
        {
            this.groupService = groupService;
            this.groupPostService = groupPostService;
            this.readStateService = readStateService;
            this.submissionService = submissionService;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin => User.IsInRole("Admin");
        private bool IsStudent => User.IsInRole("Student");

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost]
        public async Task<IActionResult> CreateGroup(CreateGroupRequest request)
        {
            try
            {
                return Ok(await groupService.CreateGroupAsync(CurrentUserId, request));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetGroups() =>
            Ok(await groupService.GetGroupsAsync(CurrentUserId, IsAdmin, IsStudent));

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroup(int id)
        {
            try
            {
                return Ok(await groupService.GetGroupAsync(id, CurrentUserId, IsAdmin, IsStudent));
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException) { return NotFound(); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddMembers(int id, AddGroupMembersRequest request)
        {
            try
            {
                var (added, skipped) = await groupService.AddMembersAsync(id, CurrentUserId, IsAdmin, request);
                return Ok(new { added, skipped });
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}/members/{studentId}")]
        public async Task<IActionResult> RemoveMember(int id, Guid studentId)
        {
            try
            {
                await groupService.RemoveMemberAsync(id, studentId, CurrentUserId, IsAdmin);
                return Ok(new { message = "Student removed from group." });
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            try
            {
                await groupService.DeleteGroupAsync(id, CurrentUserId, IsAdmin);
                return Ok(new { message = "Group deleted." });
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException) { return NotFound(); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetGroupsForStudent(Guid studentId) =>
            Ok(await groupService.GetGroupsForStudentAsync(studentId));

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("{id}/managers")]
        public async Task<IActionResult> AddManagers(int id, AddGroupManagersRequest request)
        {
            try
            {
                var (added, skipped) = await groupService.AddManagersAsync(id, CurrentUserId, IsAdmin, request);
                return Ok(new { added, skipped });
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}/managers/{teacherId}")]
        public async Task<IActionResult> RemoveManager(int id, Guid teacherId)
        {
            try
            {
                await groupService.RemoveManagerAsync(id, teacherId, CurrentUserId, IsAdmin);
                return Ok(new { message = "Co-teacher removed from group." });
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("{id}/posts")]
        public async Task<IActionResult> CreateGroupPost(int id, [FromForm] CreateGroupPostRequest request)
        {
            try
            {
                return Ok(await groupPostService.CreatePostAsync(id, CurrentUserId, IsAdmin, request));
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize]
        [HttpGet("{id}/posts")]
        public async Task<IActionResult> GetGroupPosts(int id)
        {
            try
            {
                return Ok(await groupPostService.GetPostsAsync(id, CurrentUserId, IsAdmin, IsStudent));
            }
            catch (ForbiddenException) { return Forbid(); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpDelete("{id}/posts/{postId}")]
        public async Task<IActionResult> DeleteGroupPost(int id, int postId)
        {
            try
            {
                await groupPostService.DeletePostAsync(id, postId, CurrentUserId, IsAdmin);
                return Ok(new { message = "Post deleted." });
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException) { return NotFound(); }
        }

        [Authorize]
        [HttpGet("{id}/posts/{postId}/download")]
        public async Task<IActionResult> DownloadGroupPost(int id, int postId)
        {
            try
            {
                var result = await groupPostService.DownloadPostAsync(id, postId, CurrentUserId, IsAdmin, IsStudent);
                return File(result.Bytes, "application/octet-stream", result.FileName);
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException) { return NotFound(); }
        }

        [Authorize]
        [HttpGet("notices")]
        public async Task<IActionResult> GetRecentNotices() =>
            Ok(await groupPostService.GetRecentNoticesAsync(CurrentUserId, IsAdmin));

        [Authorize]
        [HttpGet("{id}/last-viewed")]
        public async Task<IActionResult> GetGroupLastViewed(int id)
        {
            if (!await groupService.CanViewGroupAsync(id, CurrentUserId, IsAdmin, IsStudent)) return Forbid();

            var lastViewedAt = await readStateService.GetLastViewedAsync(CurrentUserId, ReadChannelType.Group, id);
            return Ok(new { lastViewedAt });
        }

        [Authorize]
        [HttpPost("{id}/mark-viewed")]
        public async Task<IActionResult> MarkGroupViewed(int id)
        {
            if (!await groupService.CanViewGroupAsync(id, CurrentUserId, IsAdmin, IsStudent)) return Forbid();

            var lastViewedAt = await readStateService.MarkViewedAsync(CurrentUserId, ReadChannelType.Group, id);
            return Ok(new { lastViewedAt });
        }

        [Authorize]
        [HttpGet("last-viewed")]
        public async Task<IActionResult> GetAllGroupsLastViewed() =>
            Ok(await readStateService.GetAllGroupLastViewedAsync(CurrentUserId));


        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("{id}/posts/{postId}/submissions")]
        public async Task<IActionResult> GetSubmissions(int id, int postId)
        {
            try { return Ok(await submissionService.GetSubmissionsAsync(postId, CurrentUserId, IsAdmin)); }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPut("{id}/posts/{postId}/submissions/{studentId}")]
        public async Task<IActionResult> SetSubmissionStatus(int id, int postId, Guid studentId, SetSubmissionStatusRequest request)
        {
            try { return Ok(await submissionService.SetSubmissionStatusAsync(postId, studentId, CurrentUserId, IsAdmin, request.Submitted)); }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Student")]
        [HttpGet("{id}/posts/{postId}/submissions/me")]
        public async Task<IActionResult> GetMySubmission(int id, int postId)
        {
            try { return Ok(await submissionService.GetMySubmissionAsync(postId, CurrentUserId)); }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Student")]
        [HttpPost("{id}/posts/{postId}/submissions/online")]
        public async Task<IActionResult> SubmitOnlineWork(int id, int postId, [FromForm] SubmitOnlineWorkRequest request)
        {
            try { return Ok(await submissionService.SubmitOnlineWorkAsync(postId, CurrentUserId, request.File)); }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Student")]
        [HttpGet("{id}/posts/{postId}/submissions/online/download")]
        public async Task<IActionResult> DownloadMyOnlineSubmission(int id, int postId)
        {
            try
            {
                var result = await submissionService.DownloadMyOnlineSubmissionAsync(postId, CurrentUserId);
                return File(result.Bytes, "application/octet-stream", result.FileName);
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException) { return NotFound(); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("{id}/posts/{postId}/online-submissions")]
        public async Task<IActionResult> GetOnlineSubmissions(int id, int postId)
        {
            try { return Ok(await submissionService.GetOnlineSubmissionsAsync(postId, CurrentUserId)); }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("{id}/posts/{postId}/online-submissions/{studentId}/download")]
        public async Task<IActionResult> DownloadOnlineSubmission(int id, int postId, Guid studentId)
        {
            try
            {
                var result = await submissionService.DownloadOnlineSubmissionAsync(postId, studentId, CurrentUserId);
                return File(result.Bytes, "application/octet-stream", result.FileName);
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException) { return NotFound(); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("my-assignments")]
        public async Task<IActionResult> GetMyAssignments() =>
            Ok(await groupPostService.GetMyAssignmentsAsync(CurrentUserId));
    }
}