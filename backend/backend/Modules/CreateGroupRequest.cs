namespace backend.Modules
{
    public class CreateGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Optional: allow adding initial members at creation time
        public List<Guid>? StudentIds { get; set; }
    }

    public class AddGroupMembersRequest
    {
        public List<Guid> StudentIds { get; set; } = new List<Guid>();
    }

    public class RemoveGroupMemberRequest
    {
        public Guid StudentId { get; set; }
    }

    public class AddGroupManagerRequest
    {
        public Guid TeacherId { get; set; }
    }
}