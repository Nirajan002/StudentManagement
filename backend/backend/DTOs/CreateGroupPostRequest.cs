namespace backend.DTOs
{
    public class CreateGroupPostRequest
    {
        // "Notice" or "File"
        public string Type { get; set; } = "File";

        public string Title { get; set; } = string.Empty;

        public string? Content { get; set; }

        public IFormFile? File { get; set; }

        public DateTime? DueDate { get; set; }
        public DateTime? AutoDeleteAt { get; set; }

        // "Physical", "Online", or "Both" — only read when Type == "Assignment".
        public string? SubmissionMode { get; set; }
    }
}