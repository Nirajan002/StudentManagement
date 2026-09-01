namespace backend.Modules
{
    public class User
    {
        public Guid Id { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string Number { get; set; } = null;

        public string Address { get; set; } = null;

        public string Gender { get; set; } = null;

        public string Password { get; set; }

        public string? Profile { get; set; }

        public string Role { get; set; } = "User";

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
    }
}