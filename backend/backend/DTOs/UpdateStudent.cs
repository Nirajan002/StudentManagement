namespace backend.DTOs
{
    public class UpdateStudent
    {
        public string FullName { get; set; }

        public IFormFile? Profile { get; set; }

        public string Gender { get; set; }

        public string Email { get; set; }

        public long Number { get; set; }

        public string Addresh { get; set; }

        public string Education { get; set; }
    }
}