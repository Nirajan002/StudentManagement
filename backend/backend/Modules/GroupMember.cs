namespace backend.Modules
{
    public class GroupMember
    {
        public int Id { get; set; }

        public int GroupId { get; set; }
        public Group Group { get; set; } = null!;

        public Guid StudentId { get; set; } // FK to Student (Student.Id is Guid)
        public Student Student { get; set; } = null!;

        public Guid AddedById { get; set; } // Teacher (or Admin, which is also a Teacher)
        public Teacher AddedBy { get; set; } = null!;

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RemovedAt { get; set; } // soft-remove, keep for audit
    }
}