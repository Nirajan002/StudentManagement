namespace backend.Services.Interfaces
{
    using backend.DTOs;

    public record LoginResult(bool Success, string? ErrorMessage, string? AccessToken, string? RefreshToken, object? User);
    public record RefreshResult(bool Success, string? AccessToken);

    public interface IAuthService
    {
        Task<object> RegisterTeacherAsync(TeacherRegister request);
        Task<(bool Conflict, object? Result)> AddStudentAsync(AddStudent request);
        Task<LoginResult> LoginAsync(TeacherLogin request);
        Task LogoutAsync(string? refreshToken);
        Task<RefreshResult> RefreshAsync(string? refreshToken);
        Task<object> SendEmailVerificationAsync(Guid userId, string role);
        Task<object> ChangePendingEmailAsync(Guid userId, string role, string newEmail);
        Task<(bool Success, string Error)> ConfirmEmailVerificationAsync(Guid userId, string role, string code);
        Task RequestPasswordResetAsync(string email);
        Task<(bool Success, string Error)> ResetPasswordAsync(string email, string code, string newPassword);
    }
}