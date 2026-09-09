namespace backend.DTOs
{
    public class CreateGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
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

    public class AddGroupManagersRequest
    {
        public List<Guid> TeacherIds { get; set; } = new List<Guid>();
    }

}