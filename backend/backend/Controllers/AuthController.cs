using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using backend.Data;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly IAuthService authService;
        private readonly StudentManagement dbContext;

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
                return Ok(new { teacher.Id, teacher.FullName, teacher.Email, teacher.Profile, teacher.Role, teacher.Gender, teacher.Number, teacher.Address, teacher.EmailVerified });
            }

            if (role == "Student")
            {
                var student = await dbContext.Students.FindAsync(id);
                if (student == null) return Unauthorized();
                return Ok(new { student.Id, student.FullName, student.Email, student.Profile, student.Role, student.Gender, student.Number, Address = student.Addresh, student.EmailVerified });
            }

            return Unauthorized();
        }

        [EnableRateLimiting("auth")]
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

        [EnableRateLimiting("auth")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] TeacherLogin request)
        {
            var result = await authService.LoginAsync(request);
            if (!result.Success) return Unauthorized(result.ErrorMessage);

            SetCookie("token", result.AccessToken!, TimeSpan.FromHours(1));
            SetCookie("refreshToken", result.RefreshToken!, TimeSpan.FromDays(7));

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

        [EnableRateLimiting("auth")]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var result = await authService.RefreshAsync(Request.Cookies["refreshToken"]);
            if (!result.Success) return Unauthorized();

            SetCookie("token", result.AccessToken!, TimeSpan.FromHours(1));
            SetCookie("refreshToken", result.RefreshToken!, TimeSpan.FromDays(7));

            return Ok();
        }

        private void SetCookie(string name, string value, TimeSpan lifetime)
        {
            Response.Cookies.Append(name, value, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.Add(lifetime),
                Path = "/"
            });
        }

        [HttpPost("verification/send")]
        [Authorize]
        public async Task<IActionResult> SendVerification()
        {
            var (userId, role) = GetCurrentUserIdAndRole();
            if (userId == null) return Unauthorized();

            try { return Ok(await authService.SendEmailVerificationAsync(userId.Value, role!)); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("verification/change-email")]
        [Authorize]
        public async Task<IActionResult> ChangePendingEmail(ChangePendingEmailRequest request)
        {
            var (userId, role) = GetCurrentUserIdAndRole();
            if (userId == null) return Unauthorized();

            try { return Ok(await authService.ChangePendingEmailAsync(userId.Value, role!, request.NewEmail)); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("verification/confirm")]
        [Authorize]
        public async Task<IActionResult> ConfirmVerification(VerifyEmailCodeRequest request)
        {
            var (userId, role) = GetCurrentUserIdAndRole();
            if (userId == null) return Unauthorized();

            var (success, error) = await authService.ConfirmEmailVerificationAsync(userId.Value, role!, request.Code);
            return success ? Ok(new { message = "Email verified successfully." }) : BadRequest(new { message = error });
        }

        [EnableRateLimiting("auth")]
        [HttpPost("password/forgot")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            await authService.RequestPasswordResetAsync(request.Email);
            return Ok(new { message = "If an account with that email exists and is verified, a reset code has been sent." });
        }

        [EnableRateLimiting("auth")]
        [HttpPost("password/reset")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
        {
            var (success, error) = await authService.ResetPasswordAsync(request.Email, request.Code, request.NewPassword);
            return success ? Ok(new { message = "Password reset successfully." }) : BadRequest(new { message = error });
        }

        private (Guid? Id, string? Role) GetCurrentUserIdAndRole()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (idStr == null || !Guid.TryParse(idStr, out var id)) return (null, null);
            return (id, role);
        }
    }
}