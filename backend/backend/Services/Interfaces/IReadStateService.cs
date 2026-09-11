namespace backend.Services.Interfaces
{
    using backend.Modules;

    public interface IReadStateService
    {
        Task<DateTime?> GetLastViewedAsync(Guid userId, ReadChannelType channelType, int? groupId);
        Task<DateTime> MarkViewedAsync(Guid userId, ReadChannelType channelType, int? groupId);
        Task<Dictionary<string, DateTime>> GetAllGroupLastViewedAsync(Guid userId);
    }
}