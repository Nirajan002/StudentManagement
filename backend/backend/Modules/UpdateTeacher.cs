namespace backend.Modules
{
    public class UpdateTeacher
    {
        public string FullName { get; set; }

        public string Email { get; set; }

        public string? Number { get; set; }

        public string? Address { get; set; }

        public string? Gender { get; set; } 

        public IFormFile? Profile { get; set; }

        public string Role { get; set; } 
    }
}
