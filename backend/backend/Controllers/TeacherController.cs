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
    public class TeacherController : Controller
    {
        private readonly StudentManagement dbContext;
        private readonly IConfiguration configuration;
        private readonly PasswordHasher<Teacher> passwordHasher;

        public TeacherController(StudentManagement dbContext, IConfiguration configuration)
        {
            this.dbContext = dbContext;
            this.configuration = configuration;
            this.passwordHasher = new PasswordHasher<Teacher>();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentTeacher()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(teacherId))
            {
                return Unauthorized();
            }

            var teacher = await dbContext.Teachers
                .FirstOrDefaultAsync(t => t.Id.ToString() == teacherId);

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

        [Authorize]
        [HttpPut("profile/{ID:guid}")]
        public async Task<IActionResult> TeacherProfileUpdate(
     [FromRoute] Guid ID,
     [FromForm] TeacherProfileUpdate teacherProfileUpdate)
        {
            var loggedInTeacherId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(loggedInTeacherId))
            {
                return Unauthorized();
            }

            if (!Guid.TryParse(loggedInTeacherId, out var currentTeacherId))
            {
                return Unauthorized();
            }

            if (currentTeacherId != ID)
            {
                return Forbid();
            }

            var teacher = await dbContext.Teachers.FindAsync(ID);

            if (teacher == null)
            {
                return NotFound();
            }
            // UPDATE NORMAL USER INFORMATION

            teacher.FullName = teacherProfileUpdate.FullName;
            teacher.Email = teacherProfileUpdate.Email;
            teacher.Gender = teacherProfileUpdate.Gender;
            teacher.Number = teacherProfileUpdate.Number;
            teacher.Address = teacherProfileUpdate.Address;

            // UPDATE PROFILE IMAGE

            if (teacherProfileUpdate.Profile != null &&
                teacherProfileUpdate.Profile.Length > 0)
            {
                string uploadPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads"
                );

                // Create uploads folder if it doesn't exist
                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                // DELETE OLD PROFILE IMAGE

                if (!string.IsNullOrEmpty(teacher.Profile))
                {
                    string oldFilePath = Path.Combine(
                        uploadPath,
                        teacher.Profile
                    );

                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // CREATE NEW FILE NAME

                string fileName =
                    Guid.NewGuid().ToString()
                    + Path.GetExtension(
                        teacherProfileUpdate.Profile.FileName
                    );

                string filePath = Path.Combine(
                    uploadPath,
                    fileName
                );

                // SAVE NEW IMAGE

                using (var stream = new FileStream(
                    filePath,
                    FileMode.Create))
                {
                    await teacherProfileUpdate.Profile.CopyToAsync(stream);
                }

                // SAVE FILE NAME IN DATABASE

                teacher.Profile = fileName;
            }

            // SAVE EVERYTHING

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                teacher.Id,
                teacher.FullName,
                teacher.Email,
                teacher.Profile,
                teacher.Number,
                teacher.Gender,
                teacher.Address
            });
        }

        [HttpGet("Teachers")]
        public IActionResult GetTeachers(int page = 1)
        {
            int pageSize = 10;

            var teacher = dbContext.Teachers
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(teacher => new
                {
                    teacher.Id,
                    teacher.FullName,
                    teacher.Gender,
                    teacher.Number,
                    teacher.Address,
                    teacher.Email,
                    teacher.Profile,
                })
                .ToList();

            return Ok(teacher);
        }

        [HttpGet("Teacher/{ID:guid}")]
        public IActionResult GetTeacher([FromRoute] Guid ID)
        {
            var teacher = dbContext.Teachers.Find(ID);

            if (teacher == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                teacher.Id,
                teacher.FullName,
                teacher.Email,
                teacher.Profile,
                teacher.Gender,
                teacher.Number,
                teacher.Address,
                teacher.Role,
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("teacher/{ID:guid}")]
        public async Task<IActionResult> DeleteTeacher([FromRoute] Guid ID)
        {
            var teacher = await dbContext.Teachers.FindAsync(ID);

            if (teacher == null)
            {
                return NotFound();
            }

            dbContext.Teachers.Remove(teacher);

            await dbContext.SaveChangesAsync();

            return Ok(teacher);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("teacher/{ID:guid}")]
        public async Task<IActionResult> UpdateTeacher(
    [FromRoute] Guid ID,
    [FromForm] UpdateTeacher updateTeacher)
        {
            var teacher = await dbContext.Teachers.FindAsync(ID);

            if (teacher == null)
            {
                return NotFound();
            }

            teacher.FullName = updateTeacher.FullName;
            teacher.Email = updateTeacher.Email;
            teacher.Gender = updateTeacher.Gender;
            teacher.Number = updateTeacher.Number;
            teacher.Address = updateTeacher.Address;
            teacher.Role = updateTeacher.Role;

            if (updateTeacher.Profile != null &&
                updateTeacher.Profile.Length > 0)
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

                // Delete old profile image
                if (!string.IsNullOrEmpty(teacher.Profile))
                {
                    string oldFilePath = Path.Combine(
                        uploadPath,
                        teacher.Profile
                    );

                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Generate new filename
                string fileName =
                    Guid.NewGuid().ToString()
                    + Path.GetExtension(updateTeacher.Profile.FileName);

                string filePath = Path.Combine(
                    uploadPath,
                    fileName
                );

                // Save new image
                using (var stream = new FileStream(
                    filePath,
                    FileMode.Create))
                {
                    await updateTeacher.Profile.CopyToAsync(stream);
                }

                teacher.Profile = fileName;
            }

            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                teacher.Id,
                teacher.FullName,
                teacher.Email,
                teacher.Profile,
                teacher.Number,
                teacher.Gender,
                teacher.Address,
                teacher.Role
            });
        }

        [HttpGet]
        [Route("searchTeacher")]
        public IActionResult SearchTeacher(
            string search = "",
            int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return Ok(new List<object>());
            }

            var teacher = dbContext.Teachers
                .Where(t =>
                    t.FullName != null &&
                    t.FullName.ToLower().Contains(search.ToLower()))
                .Take(limit)
                .Select(teacher => new
                {
                    teacher.Id,
                    teacher.FullName,
                    teacher.Profile
                })
                .ToList();

            return Ok(teacher);
        }
    }
}
