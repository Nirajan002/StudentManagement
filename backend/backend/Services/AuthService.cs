namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Modules;
    using backend.Services.Interfaces;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;

    public class AuthService : IAuthService
    {
        private readonly StudentManagement dbContext;
        private readonly IJwtTokenService jwtTokenService;
        private readonly IPasswordHasher<Teacher> teacherPasswordHasher;
        private readonly IPasswordHasher<Student> studentPasswordHasher;

        public AuthService(StudentManagement dbContext, IJwtTokenService jwtTokenService)
        {
            this.dbContext = dbContext;
            this.jwtTokenService = jwtTokenService;
            teacherPasswordHasher = new PasswordHasher<Teacher>();
            studentPasswordHasher = new PasswordHasher<Student>();
        }

        public async Task<object> RegisterTeacherAsync(TeacherRegister request)
        {
            var existing = await dbContext.Teachers
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (existing != null)
            {
                throw new InvalidOperationException("An account with this email already exists.");
            }

            var teacher = new Teacher
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                Password = teacherPasswordHasher.HashPassword(null!, request.Password),
            };

            dbContext.Teachers.Add(teacher);
            await dbContext.SaveChangesAsync();

            return new { teacher.Id, teacher.FullName, teacher.Email, teacher.Role };
        }

        public async Task<(bool Conflict, object? Result)> AddStudentAsync(AddStudent request)
        {
            var existing = await dbContext.Students
                .FirstOrDefaultAsync(s => s.Email.ToLower() == request.Email.ToLower());

            if (existing != null) return (true, null);

            var student = new Student
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                Password = studentPasswordHasher.HashPassword(null!, request.Password),
            };

            dbContext.Students.Add(student);
            await dbContext.SaveChangesAsync();

            return (false, new { student.Id, student.FullName, student.Email });
        }

        public async Task<LoginResult> LoginAsync(TeacherLogin request)
        {
            var teacher = await dbContext.Teachers
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (teacher != null)
            {
                var verify = teacherPasswordHasher.VerifyHashedPassword(teacher, teacher.Password, request.Password);
                if (verify == PasswordVerificationResult.Failed)
                    return new LoginResult(false, "Invalid email or password.", null, null, null);

                var accessToken = jwtTokenService.GenerateAccessToken(teacher);
                var refreshToken = jwtTokenService.GenerateRefreshTokenValue();

                dbContext.RefreshTokens.Add(new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    Token = refreshToken,
                    TeacherId = teacher.Id,
                    ExpiresAt = DateTime.UtcNow.AddHours(1)
                });
                await dbContext.SaveChangesAsync();

                return new LoginResult(true, null, accessToken, refreshToken, new
                {
                    teacher.Id,
                    teacher.FullName,
                    teacher.Email,
                    teacher.Profile,
                    teacher.Role
                });
            }

            var student = await dbContext.Students
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (student != null)
            {
                var verify = studentPasswordHasher.VerifyHashedPassword(student, student.Password, request.Password);
                if (verify == PasswordVerificationResult.Failed)
                    return new LoginResult(false, "Invalid email or password.", null, null, null);

                var accessToken = jwtTokenService.GenerateAccessToken(student);
                var refreshToken = jwtTokenService.GenerateRefreshTokenValue();

                dbContext.RefreshTokens.Add(new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    Token = refreshToken,
                    StudentId = student.Id,
                    ExpiresAt = DateTime.UtcNow.AddHours(1)
                });
                await dbContext.SaveChangesAsync();

                return new LoginResult(true, null, accessToken, refreshToken, new
                {
                    student.Id,
                    student.FullName,
                    student.Email,
                    student.Profile,
                    student.Role
                });
            }

            return new LoginResult(false, "Invalid email or password.", null, null, null);
        }

        public async Task LogoutAsync(string? refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken)) return;

            var stored = await dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
            if (stored != null)
            {
                dbContext.RefreshTokens.Remove(stored);
                await dbContext.SaveChangesAsync();
            }
        }

        public async Task<RefreshResult> RefreshAsync(string? refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken)) return new RefreshResult(false, null);

            var stored = await dbContext.RefreshTokens
                .Include(r => r.Teacher)
                .Include(r => r.Student)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (stored == null || stored.ExpiresAt < DateTime.UtcNow)
                return new RefreshResult(false, null);

            if (stored.Teacher != null)
                return new RefreshResult(true, jwtTokenService.GenerateAccessToken(stored.Teacher));

            if (stored.Student != null)
                return new RefreshResult(true, jwtTokenService.GenerateAccessToken(stored.Student));

            return new RefreshResult(false, null);
        }
    }
}