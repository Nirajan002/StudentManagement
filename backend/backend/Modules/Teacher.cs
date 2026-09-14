namespace backend.Modules
{
    public class Teacher
    {
        public Guid Id { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string? Number { get; set; }

        public string? Address { get; set; }

        public string? Gender { get; set; }

        public string Password { get; set; }

        public string? Profile { get; set; }

        public string Role { get; set; } = "Teacher";

        public bool EmailVerified { get; set; } = false;
        public string? PendingEmail { get; set; }

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}