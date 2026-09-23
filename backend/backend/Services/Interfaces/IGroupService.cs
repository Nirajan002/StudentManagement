namespace backend.Services.Interfaces
{
    using backend.DTOs;

    public interface IGroupService
    {
        Task<object> CreateGroupAsync(Guid creatorId, CreateGroupRequest request);
        Task<IEnumerable<object>> GetGroupsAsync(Guid userId, bool isAdmin, bool isStudent);
        Task<object> GetGroupAsync(int id, Guid userId, bool isAdmin, bool isStudent);
        Task<bool> CanViewGroupAsync(int groupId, Guid userId, bool isAdmin, bool isStudent);
        Task<bool> CanManageGroupAsync(int groupId, Guid userId, bool isAdmin);
        Task<(int Added, int Skipped)> AddMembersAsync(int groupId, Guid actingUserId, bool isAdmin, AddGroupMembersRequest request);
        Task RemoveMemberAsync(int groupId, Guid studentId, Guid actingUserId, bool isAdmin);
        Task DeleteGroupAsync(int groupId, Guid actingUserId, bool isAdmin);
        Task<IEnumerable<object>> GetGroupsForStudentAsync(Guid studentId);
        Task<(int Added, int Skipped)> AddManagersAsync(int groupId, Guid actingUserId, bool isAdmin, AddGroupManagersRequest request);
        Task RemoveManagerAsync(int groupId, Guid teacherId, Guid actingUserId, bool isAdmin);
        Task<object> UpdateGroupAsync(int groupId, Guid actingUserId, bool isAdmin, UpdateGroupRequest request);
    }
}