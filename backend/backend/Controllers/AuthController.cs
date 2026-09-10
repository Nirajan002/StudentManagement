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
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly StudentManagement dbContext;
        private readonly IConfiguration configuration;
        private readonly IPasswordHasher<Teacher> teacherPasswordHasher;
        private readonly IPasswordHasher<Student> studentPasswordHasher;

        public AuthController(StudentManagement dbContext, IConfiguration configuration)
        {
            this.dbContext = dbContext;
            this.configuration = configuration;
            this.teacherPasswordHasher = new PasswordHasher<Teacher>();
            this.studentPasswordHasher = new PasswordHasher<Student>();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
            {
                return Unauthorized();
            }

            if (!Guid.TryParse(userId, out var id))
            {
                return Unauthorized();
            }

            // Admins and Teachers both live in the Teachers table
            if (role == "Admin" || role == "Teacher")
            {
                var teacher = await dbContext.Teachers.FindAsync(id);

                if (teacher == null)
                {
                    return Unauthorized();
                }

                return Ok(new
                {
                    teacher.Id,
                    teacher.FullName,
                    teacher.Email,
                    teacher.Profile,
                    teacher.Role,
                    teacher.Gender,
                    teacher.Number,
                    teacher.Address
                });
            }

            // Students live in the Students table
            if (role == "Student")
            {
                var student = await dbContext.Students.FindAsync(id);

                if (student == null)
                {
                    return Unauthorized();
                }

                return Ok(new
                {
                    student.Id,
                    student.FullName,
                    student.Email,
                    student.Profile,
                    student.Role,
                    student.Gender,
                    student.Number,
                    Address = student.Addresh
                });
            }

            return Unauthorized();
        }

        [HttpPost("TeacherRegister")]
        public async Task<IActionResult> RegisterTeacher(TeacherRegister teacherRegister)
        {
            var existingTeacher = await dbContext.Teachers
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == teacherRegister.Email.ToLower());

            if (existingTeacher != null)
            {
                return Conflict(new
                {
                    message = "An account with this email already exists."
                });
            }

            var teacher = new Teacher
            {
                Id = Guid.NewGuid(),
                FullName = teacherRegister.FullName,
                Email = teacherRegister.Email,
                Password = teacherPasswordHasher.HashPassword(
                    null,
                    teacherRegister.Password
                ),
            };

            dbContext.Teachers.Add(teacher);

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                teacher.Id,
                teacher.FullName,
                teacher.Email,
                teacher.Role
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("AddStudent")]
        public async Task<IActionResult> AddStudent(AddStudent addStudent)
        {
            var existingStudent = await dbContext.Students
                .FirstOrDefaultAsync(s =>
                    s.Email.ToLower() == addStudent.Email.ToLower());

            if (existingStudent != null)
            {
                return Conflict(new
                {
                    message = "A student with this email already exists."
                });
            }

            var student = new Student
            {
                Id = Guid.NewGuid(),
                FullName = addStudent.FullName,
                Email = addStudent.Email,
                Password = studentPasswordHasher.HashPassword(
                    null,
                    addStudent.Password
                ),
            };

            dbContext.Students.Add(student);

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                student.Id,
                student.FullName,
                student.Email,
            });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] TeacherLogin userLogin)
            {
            // First check Teachers table
            var teacher = await dbContext.Teachers
                .FirstOrDefaultAsync(u => u.Email == userLogin.Email);

            if (teacher != null)
            {
                var result = teacherPasswordHasher.VerifyHashedPassword(
                    teacher,
                    teacher.Password,
                    userLogin.Password
                );

                if (result == PasswordVerificationResult.Failed)
                {
                    return Unauthorized("Invalid email or password.");
                }

                var accessToken = GenerateAccessToken(teacher);

                var refreshToken = Convert.ToBase64String(
                    RandomNumberGenerator.GetBytes(64)
                );

                var refreshTokenEntity = new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    Token = refreshToken,
                    TeacherId = teacher.Id,
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
                        teacher.Id,
                        teacher.FullName,
                        teacher.Email,
                        teacher.Profile,
                        teacher.Role
                    }
                });
            }


            // If not a teacher, check Students table
            var student = await dbContext.Students
                .FirstOrDefaultAsync(u => u.Email == userLogin.Email);

            if (student != null)
            {
                var result = studentPasswordHasher.VerifyHashedPassword(
                    student,
                    student.Password,
                    userLogin.Password
                );

                if (result == PasswordVerificationResult.Failed)
                {
                    return Unauthorized("Invalid email or password.");
                }

                var accessToken = GenerateAccessToken(student);

                var refreshToken = Convert.ToBase64String(
                    RandomNumberGenerator.GetBytes(64)
                );

                var refreshTokenEntity = new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    Token = refreshToken,
                    StudentId = student.Id,
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
                        student.Id,
                        student.FullName,
                        student.Email,
                        student.Profile,
                        student.Role
                    }
                });
            }


            // Email doesn't exist in either table
            return Unauthorized("Invalid email or password.");
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

        private string GenerateAccessToken(Student user)
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
                .Include(r => r.Student)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
            {
                return Unauthorized();
            }

            if (storedToken.Teacher != null)
            {
                var accessToken = GenerateAccessToken(storedToken.Teacher);

                SetAccessTokenCookie(accessToken);

                return Ok();
            }

            if (storedToken.Student != null)
            {
                var accessToken = GenerateAccessToken(storedToken.Student);

                SetAccessTokenCookie(accessToken);

                return Ok();
            }

            return Unauthorized();
        }
    }
}
