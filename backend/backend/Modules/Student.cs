namespace backend.Modules
{
    public class Student
    {
        public Guid Id { get; set; }

        public string FullName { get; set; }

        public string? Profile { get; set; }

        public string? Gender { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public long? Number { get; set; }

        public string? Addresh { get; set; }

        public string? Class { get; set; }

        public string? Section { get; set; }

        public string Role { get; set; } = "Student";

        public bool EmailVerified { get; set; } = false;
        public string? PendingEmail { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}