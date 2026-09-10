namespace backend.Modules
{
    public class GlobalNotice
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }

        public string? FileName { get; set; }
        public string? OriginalFileName { get; set; }

        public Guid PostedById { get; set; }
        public Teacher PostedBy { get; set; } = null!;

        public DateTime PostedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AutoDeleteAt { get; set; }
    }
}