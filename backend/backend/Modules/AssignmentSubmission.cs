namespace backend.Modules
{
    public enum SubmissionStatus
    {
        NotSubmitted = 0,
        Submitted = 1
    }

    public class AssignmentSubmission
    {
        public int Id { get; set; }

        public int GroupPostId { get; set; }
        public GroupPost GroupPost { get; set; } = null!;

        public Guid StudentId { get; set; }
        public Student Student { get; set; } = null!;

        // Physical tracking — set by the teacher when they physically
        // receive the student's notebook/copy.
        public SubmissionStatus Status { get; set; } = SubmissionStatus.NotSubmitted;
        public DateTime? SubmittedAt { get; set; }

        // Online submission — set by the student uploading their own file.
        public string? FileName { get; set; }
        public string? OriginalFileName { get; set; }
        public DateTime? OnlineSubmittedAt { get; set; }
        public string? Feedback { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}