namespace backend.Modules
{
    public class UserProfileUpdate
    {
        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Gender { get; set; }

        public string? Number { get; set; }

        public string? Address { get; set; }

        public IFormFile? Profile { get; set; }
    }
}
