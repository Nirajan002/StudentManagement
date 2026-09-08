namespace backend.Modules
{
    public class CreateGroupPostRequest
    {
        // "Notice" or "File"
        public string Type { get; set; } = "File";

        public string Title { get; set; } = string.Empty;

        public string? Content { get; set; }

        public IFormFile? File { get; set; }
    }
}