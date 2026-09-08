namespace backend.Modules
{
    public class StudentProfileUpdate
    {
        public string? Gender { get; set; }

        public long? Number { get; set; }

        public string? Addresh { get; set; }

        public IFormFile? Profile { get; set; }
    }
}