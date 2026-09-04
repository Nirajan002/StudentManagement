namespace backend.Modules
{
    public class GroupManager
    {
        public int Id { get; set; }

        public int GroupId { get; set; }
        public Group Group { get; set; } = null!;

        public Guid UserId { get; set; } // Teacher/Admin who co-manages this group
        public Teacher User { get; set; } = null!;

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}