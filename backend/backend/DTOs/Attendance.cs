namespace backend.DTOs
{
    public class AttendanceEntryDto
    {
        public Guid StudentId { get; set; }
        public string Status { get; set; } = "Present";
    }

    public class MarkAttendanceRequest
    {
        public int ClassSectionId { get; set; }
        public DateTime Date { get; set; }
        public List<AttendanceEntryDto> Records { get; set; } = new();
    }
}