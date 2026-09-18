using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : Controller
    {
        private readonly IStudentService studentService;

        public StudentController(IStudentService studentService)
        {
            this.studentService = studentService;
        }

        [Authorize]
        [HttpGet("Students")]
        public IActionResult GetStudent(int page = 1) => Ok(studentService.GetPaged(page));

        [Authorize]
        [HttpGet("{ID:guid}")]
        public async Task<IActionResult> GetStudent([FromRoute] Guid ID)
        {
            var result = await studentService.GetByIdAsync(ID);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("student/{ID:guid}")]
        public async Task<IActionResult> UpdateStudent([FromRoute] Guid ID, UpdateStudent request)
        {
            var result = await studentService.UpdateAsync(ID, request);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{ID:guid}")]
        public async Task<IActionResult> DeleteStudents([FromRoute] Guid ID)
        {
            var deleted = await studentService.DeleteAsync(ID);
            return deleted ? Ok() : NotFound();
        }

        [Authorize]
        [HttpGet("search")]
        public IActionResult SearchStudent(string search = "", int limit = 20) =>
            Ok(studentService.Search(search, limit));

        [Authorize]
        [HttpPut("profile/{ID:guid}")]
        public async Task<IActionResult> StudentProfileUpdate([FromRoute] Guid ID, [FromForm] StudentProfileUpdate request)
        {
            var loggedInId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(loggedInId) || !Guid.TryParse(loggedInId, out var currentId))
                return Unauthorized();
            if (currentId != ID) return Forbid();

            var result = await studentService.UpdateProfileAsync(ID, request);
            return result == null ? NotFound() : Ok(result);
        }
    }
}