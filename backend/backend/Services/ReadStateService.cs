namespace backend.Services
{
    using backend.Data;
    using backend.Modules;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class ReadStateService : IReadStateService
    {
        private readonly StudentManagement dbContext;

        public ReadStateService(StudentManagement dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<DateTime?> GetLastViewedAsync(Guid userId, ReadChannelType channelType, int? groupId)
        {
            var state = await dbContext.ReadStates.FirstOrDefaultAsync(r =>
                r.UserId == userId && r.ChannelType == channelType && r.GroupId == groupId);

            return state?.LastReadAt;
        }

        public async Task<DateTime> MarkViewedAsync(Guid userId, ReadChannelType channelType, int? groupId)
        {
            var now = DateTime.UtcNow;

            var state = await dbContext.ReadStates.FirstOrDefaultAsync(r =>
                r.UserId == userId && r.ChannelType == channelType && r.GroupId == groupId);

            if (state == null)
            {
                dbContext.ReadStates.Add(new ReadState
                {
                    UserId = userId,
                    ChannelType = channelType,
                    GroupId = groupId,
                    LastReadAt = now
                });
            }
            else
            {
                state.LastReadAt = now;
            }

            await dbContext.SaveChangesAsync();
            return now;
        }

        public async Task<Dictionary<string, DateTime>> GetAllGroupLastViewedAsync(Guid userId)
        {
            var states = await dbContext.ReadStates
                .Where(r => r.UserId == userId && r.ChannelType == ReadChannelType.Group)
                .ToListAsync();

            return states.ToDictionary(s => s.GroupId!.Value.ToString(), s => s.LastReadAt);
        }
    }
}