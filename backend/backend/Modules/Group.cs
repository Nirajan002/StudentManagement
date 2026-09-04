namespace backend.Modules
{
    public class Group
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Groups are created by a Teacher (Admins are Teachers with Role = "Admin")
        public Guid CreatedById { get; set; }
        public Teacher CreatedBy { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
        public ICollection<GroupManager> Managers { get; set; } = new List<GroupManager>();
    }
}