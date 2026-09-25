namespace backend.Modules
{
    public class ClassSection
    {
        public int Id { get; set; }

        // Matches Student.Class / Student.Section exactly.
        public string ClassName { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;

        // The teacher responsible for attendance in this class-section.
        // Null means no instructor has been assigned yet.
        public Guid? InstructorId { get; set; }
        public Teacher? Instructor { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}