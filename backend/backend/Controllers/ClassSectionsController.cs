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
    [Authorize]
    public class ClassSectionsController : Controller
    {
        private readonly IClassSectionService classSectionService;

        public ClassSectionsController(IClassSectionService classSectionService)
        {
            this.classSectionService = classSectionService;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET /api/ClassSections — every class and section, with student count and instructor
        [Authorize(Roles = "Admin, Teacher")]
        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await classSectionService.GetAllAsync());

        // PUT /api/ClassSections/{id}/instructor — assign or clear the instructor
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/instructor")]
        public async Task<IActionResult> AssignInstructor(int id, AssignInstructorRequest request)
        {
            try
            {
                return Ok(await classSectionService.AssignInstructorAsync(id, request.TeacherId));
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/ClassSections/mine — the class-sections the logged-in teacher instructs
        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine() => Ok(await classSectionService.GetMineAsync(CurrentUserId));
    }
}