namespace backend.Modules
{
    public class GroupPost
    {
        public int Id { get; set; }

        public int GroupId { get; set; }
        public Group Group { get; set; } = null!;

        // "Notice" or "File"
        public string Type { get; set; } = "File";

        public string Title { get; set; } = string.Empty;

        // Notice body text (null for pure file posts)
        public string? Content { get; set; }

        // Stored filename on disk (guid + extension), null for text-only notices
        public string? FileName { get; set; }

        // Original filename shown to users / used on download
        public string? OriginalFileName { get; set; }

        public Guid PostedById { get; set; }
        public Teacher PostedBy { get; set; } = null!;

        public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    }
}