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
    public class AttendanceController : Controller
    {
        private readonly IAttendanceService attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            this.attendanceService = attendanceService;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin => User.IsInRole("Admin");
        private bool IsStudent => User.IsInRole("Student");

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost("mark")]
        public async Task<IActionResult> MarkAttendance(MarkAttendanceRequest request)
        {
            try
            {
                return Ok(await attendanceService.MarkAttendanceAsync(request, CurrentUserId, IsAdmin));
            }
            catch (ForbiddenException) { return Forbid(); }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (ValidationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("roster")]
        public async Task<IActionResult> GetRoster(int classSectionId, DateTime date)
        {
            try
            {
                return Ok(await attendanceService.GetRosterAsync(classSectionId, date));
            }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("sheet")]
        public async Task<IActionResult> GetSheet(int classSectionId, DateTime? from, DateTime? to)
        {
            try
            {
                return Ok(await attendanceService.GetAttendanceSheetAsync(classSectionId, from, to));
            }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("student/{studentId:guid}")]
        public async Task<IActionResult> GetStudentAttendance(Guid studentId, DateTime? from, DateTime? to)
        {
            if (IsStudent && studentId != CurrentUserId) return Forbid();

            try
            {
                return Ok(await attendanceService.GetStudentAttendanceAsync(studentId, from, to));
            }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Student")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyAttendance(DateTime? from, DateTime? to) =>
            Ok(await attendanceService.GetStudentAttendanceAsync(CurrentUserId, from, to));
    }
}