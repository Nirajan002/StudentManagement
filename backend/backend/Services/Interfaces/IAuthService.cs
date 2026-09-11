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
    }
}