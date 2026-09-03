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
    public class StudentController : Controller
    {
        private readonly StudentManagement dbContext;
        private readonly IConfiguration configuration;
        private readonly PasswordHasher<Teacher> passwordHasher;

        public StudentController(StudentManagement dbContext, IConfiguration configuration)
        {
            this.dbContext = dbContext;
            this.configuration = configuration;
            this.passwordHasher = new PasswordHasher<Teacher>();
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
 

        [Authorize(Roles = "Admin")]
        [HttpPut("student/{ID:guid}")]
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
