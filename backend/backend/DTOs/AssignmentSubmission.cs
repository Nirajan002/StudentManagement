namespace backend.DTOs
{
    public class SetSubmissionStatusRequest
    {
        public bool Submitted { get; set; }
    }

    public class SubmitOnlineWorkRequest
    {
        public IFormFile File { get; set; } = null!;
    }

    public class SetSubmissionFeedbackRequest
    {
        public string? Feedback { get; set; }
    }
}