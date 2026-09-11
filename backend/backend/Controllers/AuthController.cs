using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly IAuthService authService;
        private readonly StudentManagement dbContext; // only for GET /me lookups

        public AuthController(IAuthService authService, StudentManagement dbContext)
        {
            this.authService = authService;
            this.dbContext = dbContext;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var id) || string.IsNullOrEmpty(role))
                return Unauthorized();

            if (role is "Admin" or "Teacher")
            {
                var teacher = await dbContext.Teachers.FindAsync(id);
                if (teacher == null) return Unauthorized();
                return Ok(new { teacher.Id, teacher.FullName, teacher.Email, teacher.Profile, teacher.Role, teacher.Gender, teacher.Number, teacher.Address });
            }

            if (role == "Student")
            {
                var student = await dbContext.Students.FindAsync(id);
                if (student == null) return Unauthorized();
                return Ok(new { student.Id, student.FullName, student.Email, student.Profile, student.Role, student.Gender, student.Number, Address = student.Addresh });
            }

            return Unauthorized();
        }

        [HttpPost("TeacherRegister")]
        public async Task<IActionResult> RegisterTeacher(TeacherRegister request)
        {
            try
            {
                return Ok(await authService.RegisterTeacherAsync(request));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("AddStudent")]
        public async Task<IActionResult> AddStudent(AddStudent request)
        {
            var (conflict, result) = await authService.AddStudentAsync(request);
            if (conflict) return Conflict(new { message = "A student with this email already exists." });
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] TeacherLogin request)
        {
            var result = await authService.LoginAsync(request);
            if (!result.Success) return Unauthorized(result.ErrorMessage);

            SetCookie("token", result.AccessToken!);
            SetCookie("refreshToken", result.RefreshToken!);

            return Ok(new { user = result.User });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await authService.LogoutAsync(Request.Cookies["refreshToken"]);

            var opts = new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None, Path = "/" };
            Response.Cookies.Delete("token", opts);
            Response.Cookies.Delete("refreshToken", opts);

            return Ok();
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var result = await authService.RefreshAsync(Request.Cookies["refreshToken"]);
            if (!result.Success) return Unauthorized();

            SetCookie("token", result.AccessToken!);
            return Ok();
        }

        private void SetCookie(string name, string value)
        {
            Response.Cookies.Append(name, value, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1),
                Path = "/"
            });
        }
    }
}