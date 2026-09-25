namespace backend.DTOs
{
    public class AssignInstructorRequest
    {
        // Null removes the instructor from this class-section.
        public Guid? TeacherId { get; set; }
    }
}