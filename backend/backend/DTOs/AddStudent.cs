namespace backend.DTOs
{
    public class AddStudent
    {
        public string FullName { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string? Class { get; set; }

        public string? Section { get; set; }

        public int? RollNumber { get; set; }
    }
}