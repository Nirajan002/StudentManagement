namespace backend.Modules
{
    public enum AttendanceStatus
    {
        Present = 0,
        Absent = 1,
        Late = 2,
        Excused = 3
    }

    public class AttendanceRecord
    {
        public int Id { get; set; }

        public int ClassSectionId { get; set; }
        public ClassSection ClassSection { get; set; } = null!;

        public Guid StudentId { get; set; }
        public Student Student { get; set; } = null!;

        // Date-only, stored at UTC midnight.
        public DateTime Date { get; set; }

        public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;

        public Guid MarkedById { get; set; }
        public Teacher MarkedBy { get; set; } = null!;

        public DateTime MarkedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}