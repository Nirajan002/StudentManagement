namespace backend.Modules
{
    public enum AssignmentSubmissionMode
    {
        Physical = 0,
        Online = 1,
        Both = 2
    }

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

        public DateTime? DueDate { get; set; }
        public DateTime? AutoDeleteAt { get; set; }

        // Only meaningful when Type == "Assignment". Null means this
        // assignment predates the feature and behaves as Physical-only.
        public AssignmentSubmissionMode? SubmissionMode { get; set; }
    }
}