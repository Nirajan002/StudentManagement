using backend.Data;
using backend.Modules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly StudentManagement dbContext;
        private readonly IConfiguration configuration;
        private readonly PasswordHasher<Teacher> passwordHasher;

        public AuthController(StudentManagement dbContext, IConfiguration configuration)
        {
            this.dbContext = dbContext;
            this.configuration = configuration;
            this.passwordHasher = new PasswordHasher<Teacher>();
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUsers(TeacherRegister userInsert)
        {
            var existingUser = await dbContext.Teachers
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == userInsert.Email.ToLower());

            if (existingUser != null)
            {
                return Conflict(new
                {
                    message = "An account with this email already exists."
                });
            }

            string? fileName = null;

            if (userInsert.Profile != null)
            {
                fileName = Guid.NewGuid().ToString()
                           + Path.GetExtension(userInsert.Profile.FileName);

                string uploadPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads"
                );

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                string filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await userInsert.Profile.CopyToAsync(stream);
                }
            }

            var user = new Teacher
            {
                Id = Guid.NewGuid(),
                FullName = userInsert.FullName,
                Email = userInsert.Email,
                Password = passwordHasher.HashPassword(
                    null,
                    userInsert.Password
                ),
                Profile = fileName,
            };

            dbContext.Teachers.Add(user);

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Profile,
                user.Role
            });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] TeacherLogin userLogin)
        {
            var user = await dbContext.Teachers
                .FirstOrDefaultAsync(u => u.Email == userLogin.Email);

            if (user == null)
            {
                return Unauthorized();
            }

            var result = passwordHasher.VerifyHashedPassword(
                user,
                user.Password,
                userLogin.Password
            );

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized();
            }



            var accessToken = GenerateAccessToken(user);

            var refreshToken = Convert.ToBase64String(
                RandomNumberGenerator.GetBytes(64)
            );

            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = refreshToken,
                TeacherId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };

            dbContext.RefreshTokens.Add(refreshTokenEntity);

            await dbContext.SaveChangesAsync();

            SetAccessTokenCookie(accessToken);

            Response.Cookies.Append(
                "refreshToken",
                refreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddHours(1),
                    Path = "/"
                }
            );

            return Ok(new
            {
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Profile,
                    user.Role
                }
            });
        }
        private string GenerateAccessToken(Teacher user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
             };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        private void SetAccessTokenCookie(string token)
        {
            Response.Cookies.Append(
                "token",
                token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddHours(1),
                    Path = "/"
                }
            );
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (!string.IsNullOrEmpty(refreshToken))
            {
                var storedToken = await dbContext.RefreshTokens
                    .FirstOrDefaultAsync(r => r.Token == refreshToken);

                if (storedToken != null)
                {
                    dbContext.RefreshTokens.Remove(storedToken);
                    await dbContext.SaveChangesAsync();
                }
            }

            Response.Cookies.Delete("token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            return Ok();
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized();
            }

            var storedToken = await dbContext.RefreshTokens
                .Include(r => r.Teacher)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
            {
                return Unauthorized();
            }

            var user = storedToken.Teacher;

            if (user == null)
            {
                return Unauthorized();
            }

            var accessToken = GenerateAccessToken(user);

            SetAccessTokenCookie(accessToken);

            return Ok();
        }
    }
}
