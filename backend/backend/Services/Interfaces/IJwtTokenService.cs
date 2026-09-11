namespace backend.Services.Interfaces
{
    using backend.Modules;

    public interface IJwtTokenService
    {
        string GenerateAccessToken(Teacher teacher);
        string GenerateAccessToken(Student student);
        string GenerateRefreshTokenValue();
    }
}