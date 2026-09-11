using backend.DTOs;
using backend.Services.Exceptions;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeacherController : Controller
    {
        private readonly ITeacherService teacherService;

        public TeacherController(ITeacherService teacherService)
        {
            this.teacherService = teacherService;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentTeacher()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(teacherId) || !Guid.TryParse(teacherId, out var id))
                return Unauthorized();

            try
            {
                return Ok(await teacherService.GetCurrentAsync(id));
            }
            catch (NotFoundException)
            {
                return Unauthorized();
            }
        }

        [Authorize]
        [HttpPut("profile/{ID:guid}")]
        public async Task<IActionResult> TeacherProfileUpdate([FromRoute] Guid ID, [FromForm] TeacherProfileUpdate request)
        {
            var loggedInId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(loggedInId) || !Guid.TryParse(loggedInId, out var currentId))
                return Unauthorized();
            if (currentId != ID) return Forbid();

            try
            {
                return Ok(await teacherService.UpdateProfileAsync(ID, request));
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("Teachers")]
        public IActionResult GetTeachers(int page = 1) => Ok(teacherService.GetPaged(page));

        [HttpGet("Teacher/{ID:guid}")]
        public IActionResult GetTeacher([FromRoute] Guid ID)
        {
            try
            {
                return Ok(teacherService.GetById(ID));
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("teacher/{ID:guid}")]
        public async Task<IActionResult> DeleteTeacher([FromRoute] Guid ID)
        {
            try
            {
                await teacherService.DeleteAsync(ID);
                return Ok();
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("teacher/{ID:guid}")]
        public async Task<IActionResult> UpdateTeacher([FromRoute] Guid ID, [FromForm] UpdateTeacher request)
        {
            try
            {
                return Ok(await teacherService.UpdateAsync(ID, request));
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("searchTeacher")]
        public IActionResult SearchTeacher(string search = "", int limit = 20) =>
            Ok(teacherService.Search(search, limit));
    }
}