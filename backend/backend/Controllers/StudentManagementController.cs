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
    public class StudentManagementController : Controller
    {
        private readonly StudentManagement dbContext;
        private readonly IConfiguration configuration;
        private readonly PasswordHasher<User> passwordHasher;

        public StudentManagementController(StudentManagement dbContext, IConfiguration configuration)
        {
            this.dbContext = dbContext;
            this.configuration = configuration;
            this.passwordHasher = new PasswordHasher<User>();
        }
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUsers(UserRegister userInsert)
        {
            var existingUser = await dbContext.Users
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

            var user = new User
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

            dbContext.Users.Add(user);

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
        public async Task<IActionResult> Login([FromBody] UserLogin userLogin)
        {
            var user = await dbContext.Users
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
                UserId = user.Id,
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
        private string GenerateAccessToken(User user)
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

            string? fileName = null;

            if (addStudent.Profile != null)
            {
                fileName = Guid.NewGuid().ToString()
                           + Path.GetExtension(addStudent.Profile.FileName);

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
                    await addStudent.Profile.CopyToAsync(stream);
                }
            }

            var student = new Student
            {
                Id = Guid.NewGuid(),
                FullName = addStudent.FullName,
                Email = addStudent.Email,
                Gender = addStudent.Gender,
                Number = addStudent.Number,
                Addresh = addStudent.Addresh,
                Profile = fileName,
                Education = addStudent.Education
            };

            dbContext.Students.Add(student);

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                student.Id,
                student.FullName,
                student.Email,
                student.Gender,
                student.Number,
                student.Addresh,
                student.Profile,
                student.Education
            });
        }

        [HttpGet("Students")]
        public IActionResult GetStudent(int page = 1)
        {
            int pageSize = 10;

            var student = dbContext.Students
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(student => new
                {
                    student.Id,
                    student.FullName,
                    student.Gender,
                    student.Number,
                    student.Addresh,
                    student.Email,
                    student.Profile,
                    student.Education,
                })
                .ToList();

            return Ok(student);
        }

        [HttpGet]
        [Route("{ID:guid}")]
        public IActionResult GetStudent([FromRoute] Guid ID)
        {
            var student = dbContext.Students.Find(ID);

            if (student == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                student.Id,
                student.FullName,
                student.Email,
                student.Profile,
                student.Education,
                student.Gender,
                student.Number,
                student.Addresh,
            });
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
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
            {
                return Unauthorized();
            }

            var user = storedToken.User;

            if (user == null)
            {
                return Unauthorized();
            }

            var accessToken = GenerateAccessToken(user);

            SetAccessTokenCookie(accessToken);

            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        [Route("{ID:guid}")]
        public async Task<IActionResult> UpdateStudent([FromRoute] Guid ID,UpdateStudent updateStudent)
        {
            var student = await dbContext.Students.FindAsync(ID);

            if (student == null)
            {
                return NotFound();
            }

            student.FullName = updateStudent.FullName;
            student.Email = updateStudent.Email;
            student.Education = updateStudent.Education;
            student.Gender = updateStudent.Gender;
            student.Number = updateStudent.Number;
            student.Addresh = updateStudent.Addresh;

            if (updateStudent.Profile != null)
            {
                string uploadPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads"
                );

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                if (!string.IsNullOrEmpty(student.Profile))
                {
                    string oldFilePath = Path.Combine(
                        uploadPath,
                        student.Profile
                    );

                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                string fileName = Guid.NewGuid().ToString()
                                  + Path.GetExtension(
                                      updateStudent.Profile.FileName
                                  );

                string filePath = Path.Combine(
                    uploadPath,
                    fileName
                );

                using (var stream = new FileStream(
                    filePath,
                    FileMode.Create))
                {
                    await updateStudent.Profile.CopyToAsync(stream);
                }

                student.Profile = fileName;
            }

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                student.Id,
                student.FullName,
                student.Email,
                student.Profile,
                student.Education,
                student.Number,
                student.Gender,
                student.Addresh,
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete]
        [Route("{ID:guid}")]
        public async Task<IActionResult> DeleteStudents([FromRoute] Guid ID)
        {
            var student = await dbContext.Students.FindAsync(ID);

            if (student == null)
            {
                return NotFound();
            }

            dbContext.Students.Remove(student);

            await dbContext.SaveChangesAsync();

            return Ok(student);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Profile,
                user.Role
            });
        }

        [HttpGet]
        [Route("search")]
        public IActionResult SearchStudent(
            string search = "",
            int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return Ok(new List<object>());
            }

            var students = dbContext.Students
                .Where(s =>
                    s.FullName != null &&
                    s.FullName.ToLower().Contains(search.ToLower()))
                .Take(limit)
                .Select(student => new
                {
                    student.Id,
                    student.FullName,
                    student.Profile
                })
                .ToList();

            return Ok(students);
        }
    }
}
