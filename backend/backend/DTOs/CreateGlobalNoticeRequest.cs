namespace backend.DTOs
{
    public class CreateGlobalNoticeRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public IFormFile? File { get; set; }
        public DateTime? AutoDeleteAt { get; set; }
    }
}