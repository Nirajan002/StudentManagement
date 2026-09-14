namespace backend.Modules
{
    public enum OtpPurpose
    {
        EmailVerification = 0,
        PasswordReset = 1
    }

    public class OtpCode
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }

        // "Teacher" or "Student"
        public string UserType { get; set; } = string.Empty;

        public OtpPurpose Purpose { get; set; }

        // SHA-256 hash of the 6-digit code — never store the raw code
        public string CodeHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }
        public DateTime? ConsumedAt { get; set; }
        public int Attempts { get; set; } = 0;
    }
}