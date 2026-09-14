namespace backend.DTOs
{
    public class ChangePendingEmailRequest
    {
        public string NewEmail { get; set; } = string.Empty;
    }

    public class VerifyEmailCodeRequest
    {
        public string Code { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}