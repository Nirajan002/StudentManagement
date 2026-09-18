namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Modules;
    using backend.Services.Interfaces;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using System.Security.Cryptography;
    using System.Text;

    public class AuthService : IAuthService
    {
        private readonly StudentManagement dbContext;
        private readonly IJwtTokenService jwtTokenService;
        private readonly IPasswordHasher<Teacher> teacherPasswordHasher;
        private readonly IPasswordHasher<Student> studentPasswordHasher;
        private readonly IEmailService emailService;

        // Access tokens stay short-lived (1 hour); refresh tokens live much
        // longer so the user doesn't have to log in again every hour, but
        // each one is single-use (see RefreshAsync) so a leaked token has a
        // limited window before it's rotated out from under an attacker.
        private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

        public AuthService(StudentManagement dbContext, IJwtTokenService jwtTokenService, IEmailService emailService)
        {
            this.dbContext = dbContext;
            this.jwtTokenService = jwtTokenService;
            this.emailService = emailService;
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
                    ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime)
                });
                await dbContext.SaveChangesAsync();

                return new LoginResult(true, null, accessToken, refreshToken, new
                {
                    teacher.Id,
                    teacher.FullName,
                    teacher.Email,
                    teacher.Profile,
                    teacher.Role,
                    teacher.EmailVerified,
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
                    ExpiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime)
                });
                await dbContext.SaveChangesAsync();

                return new LoginResult(true, null, accessToken, refreshToken, new
                {
                    student.Id,
                    student.FullName,
                    student.Email,
                    student.Profile,
                    student.Role,
                    student.EmailVerified,
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
            if (string.IsNullOrEmpty(refreshToken)) return new RefreshResult(false, null, null);

            var stored = await dbContext.RefreshTokens
                .Include(r => r.Teacher)
                .Include(r => r.Student)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (stored == null || stored.ExpiresAt < DateTime.UtcNow)
                return new RefreshResult(false, null, null);

            // Rotate: issue a brand-new refresh token and remove the old one,
            // so this exact token string can never be used a second time —
            // whether by the legitimate client or someone who copied it.
            var newRefreshToken = jwtTokenService.GenerateRefreshTokenValue();
            var newExpiry = DateTime.UtcNow.Add(RefreshTokenLifetime);

            string? newAccessToken = null;

            if (stored.Teacher != null)
            {
                newAccessToken = jwtTokenService.GenerateAccessToken(stored.Teacher);
                dbContext.RefreshTokens.Add(new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    Token = newRefreshToken,
                    TeacherId = stored.Teacher.Id,
                    ExpiresAt = newExpiry
                });
            }
            else if (stored.Student != null)
            {
                newAccessToken = jwtTokenService.GenerateAccessToken(stored.Student);
                dbContext.RefreshTokens.Add(new RefreshToken
                {
                    Id = Guid.NewGuid(),
                    Token = newRefreshToken,
                    StudentId = stored.Student.Id,
                    ExpiresAt = newExpiry
                });
            }
            else
            {
                return new RefreshResult(false, null, null);
            }

            dbContext.RefreshTokens.Remove(stored);
            await dbContext.SaveChangesAsync();

            return new RefreshResult(true, newAccessToken, newRefreshToken);
        }

        private static string HashCode(string code)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(code));
            return Convert.ToHexString(bytes);
        }

        private static string GenerateNumericCode() =>
            RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

        private async Task<(string Email, string UserType)> GetEmailForVerificationAsync(Guid userId, string role)
        {
            if (role == "Student")
            {
                var student = await dbContext.Students.FindAsync(userId)
                    ?? throw new InvalidOperationException("Student not found.");
                return (string.IsNullOrEmpty(student.PendingEmail) ? student.Email : student.PendingEmail, "Student");
            }

            var teacher = await dbContext.Teachers.FindAsync(userId)
                ?? throw new InvalidOperationException("Teacher not found.");
            return (string.IsNullOrEmpty(teacher.PendingEmail) ? teacher.Email : teacher.PendingEmail, "Teacher");
        }

        private async Task EnforceResendCooldownAsync(Guid userId, string userType, OtpPurpose purpose)
        {
            var recent = await dbContext.OtpCodes
                .Where(o => o.UserId == userId && o.UserType == userType && o.Purpose == purpose)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (recent != null && recent.ConsumedAt == null && recent.CreatedAt.AddSeconds(60) > DateTime.UtcNow)
                throw new InvalidOperationException("Please wait a minute before requesting another code.");
        }

        private static string MaskEmail(string email)
        {
            var at = email.IndexOf('@');
            if (at <= 1) return email;
            return email[0] + new string('*', at - 1) + email[at..];
        }

        public async Task<object> SendEmailVerificationAsync(Guid userId, string role)
        {
            var (email, userType) = await GetEmailForVerificationAsync(userId, role);

            await EnforceResendCooldownAsync(userId, userType, OtpPurpose.EmailVerification);

            var code = GenerateNumericCode();

            dbContext.OtpCodes.Add(new OtpCode
            {
                UserId = userId,
                UserType = userType,
                Purpose = OtpPurpose.EmailVerification,
                CodeHash = HashCode(code),
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            });

            await dbContext.SaveChangesAsync();

            await emailService.SendAsync(
                email,
                "Verify your email — StudentGrid",
                $"<p>Your verification code is:</p><h2>{code}</h2><p>This code expires in 10 minutes.</p>");

            return new { message = $"A verification code was sent to {MaskEmail(email)}." };
        }

        public async Task<object> ChangePendingEmailAsync(Guid userId, string role, string newEmail)
        {
            if (string.IsNullOrWhiteSpace(newEmail) || !newEmail.Contains('@'))
                throw new InvalidOperationException("Enter a valid email address.");

            if (role == "Student")
            {
                var student = await dbContext.Students.FindAsync(userId)
                    ?? throw new InvalidOperationException("Student not found.");
                student.PendingEmail = newEmail.Trim();
            }
            else
            {
                var teacher = await dbContext.Teachers.FindAsync(userId)
                    ?? throw new InvalidOperationException("Teacher not found.");
                teacher.PendingEmail = newEmail.Trim();
            }

            await dbContext.SaveChangesAsync();

            return await SendEmailVerificationAsync(userId, role);
        }

        public async Task<(bool Success, string Error)> ConfirmEmailVerificationAsync(Guid userId, string role, string code)
        {
            var userType = role == "Student" ? "Student" : "Teacher";

            var otp = await dbContext.OtpCodes
                .Where(o => o.UserId == userId && o.UserType == userType
                    && o.Purpose == OtpPurpose.EmailVerification && o.ConsumedAt == null)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null)
                return (false, "No pending verification code. Please request a new one.");

            if (otp.ExpiresAt < DateTime.UtcNow)
                return (false, "This code has expired. Please request a new one.");

            if (otp.Attempts >= 5)
                return (false, "Too many incorrect attempts. Please request a new code.");

            if (otp.CodeHash != HashCode(code.Trim()))
            {
                otp.Attempts++;
                await dbContext.SaveChangesAsync();
                return (false, "Incorrect code.");
            }

            otp.ConsumedAt = DateTime.UtcNow;

            if (userType == "Student")
            {
                var student = await dbContext.Students.FindAsync(userId);
                if (!string.IsNullOrEmpty(student!.PendingEmail))
                {
                    student.Email = student.PendingEmail;
                    student.PendingEmail = null;
                }
                student.EmailVerified = true;
            }
            else
            {
                var teacher = await dbContext.Teachers.FindAsync(userId);
                if (!string.IsNullOrEmpty(teacher!.PendingEmail))
                {
                    teacher.Email = teacher.PendingEmail;
                    teacher.PendingEmail = null;
                }
                teacher.EmailVerified = true;
            }

            await dbContext.SaveChangesAsync();
            return (true, string.Empty);
        }

        public async Task RequestPasswordResetAsync(string email)
        {
            var teacher = await dbContext.Teachers.FirstOrDefaultAsync(t => t.Email.ToLower() == email.ToLower());
            var student = teacher == null
                ? await dbContext.Students.FirstOrDefaultAsync(s => s.Email.ToLower() == email.ToLower())
                : null;

            if (teacher == null && student == null) return; // don't reveal whether the account exists

            var userId = teacher?.Id ?? student!.Id;
            var userType = teacher != null ? "Teacher" : "Student";
            var isVerified = teacher?.EmailVerified ?? student!.EmailVerified;

            if (!isVerified) return; // must verify their email first before resetting via this route

            try
            {
                await EnforceResendCooldownAsync(userId, userType, OtpPurpose.PasswordReset);
            }
            catch (InvalidOperationException)
            {
                return; // silently ignore to avoid leaking account state
            }

            var code = GenerateNumericCode();

            dbContext.OtpCodes.Add(new OtpCode
            {
                UserId = userId,
                UserType = userType,
                Purpose = OtpPurpose.PasswordReset,
                CodeHash = HashCode(code),
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            });

            await dbContext.SaveChangesAsync();

            await emailService.SendAsync(
                email,
                "Reset your password — StudentGrid",
                $"<p>Your password reset code is:</p><h2>{code}</h2><p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>");
        }

        public async Task<(bool Success, string Error)> ResetPasswordAsync(string email, string code, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
                return (false, "Password must be at least 6 characters.");

            var teacher = await dbContext.Teachers.FirstOrDefaultAsync(t => t.Email.ToLower() == email.ToLower());
            var student = teacher == null
                ? await dbContext.Students.FirstOrDefaultAsync(s => s.Email.ToLower() == email.ToLower())
                : null;

            if (teacher == null && student == null)
                return (false, "Invalid code or email.");

            var userId = teacher?.Id ?? student!.Id;
            var userType = teacher != null ? "Teacher" : "Student";

            var otp = await dbContext.OtpCodes
                .Where(o => o.UserId == userId && o.UserType == userType
                    && o.Purpose == OtpPurpose.PasswordReset && o.ConsumedAt == null)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.ExpiresAt < DateTime.UtcNow || otp.Attempts >= 5)
                return (false, "Invalid or expired code. Please request a new one.");

            if (otp.CodeHash != HashCode(code.Trim()))
            {
                otp.Attempts++;
                await dbContext.SaveChangesAsync();
                return (false, "Invalid code.");
            }

            otp.ConsumedAt = DateTime.UtcNow;

            if (teacher != null)
                teacher.Password = teacherPasswordHasher.HashPassword(teacher, newPassword);
            else
                student!.Password = studentPasswordHasher.HashPassword(student, newPassword);

            await dbContext.SaveChangesAsync();
            return (true, string.Empty);
        }
    }
}