using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly IDashboardService dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            this.dashboardService = dashboardService;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [Authorize(Roles = "Admin")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetAdminDashboard() => Ok(await dashboardService.GetAdminDashboardAsync());

        [Authorize(Roles = "Teacher,Admin")]
        [HttpGet("teacher-dashboard")]
        public async Task<IActionResult> GetTeacherDashboard() => Ok(await dashboardService.GetTeacherDashboardAsync(CurrentUserId));

        [Authorize(Roles = "Student")]
        [HttpGet("student-dashboard")]
        public async Task<IActionResult> GetStudentDashboard() => Ok(await dashboardService.GetStudentDashboardAsync(CurrentUserId));
    }
}