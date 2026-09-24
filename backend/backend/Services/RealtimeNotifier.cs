using backend.Hubs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services
{
    public class RealtimeNotifier : IRealtimeNotifier
    {
        private readonly IHubContext<NotificationHub> hub;

        public RealtimeNotifier(IHubContext<NotificationHub> hub)
        {
            this.hub = hub;
        }

        public Task NotifyGlobalNoticeAsync(object notice) =>
            hub.Clients.All.SendAsync("globalNotice", notice);

        public Task NotifyGroupPostAsync(int groupId, IEnumerable<Guid> recipientUserIds, object post)
        {
            var ids = recipientUserIds.Select(id => id.ToString()).Distinct();
            return hub.Clients.Users(ids).SendAsync("groupPost", post);
        }

        public Task NotifyAssignmentFeedbackAsync(Guid studentId, object payload) =>
            hub.Clients.User(studentId.ToString()).SendAsync("assignmentFeedback", payload);

        public Task NotifyAssignmentSubmissionAsync(IEnumerable<Guid> teacherIds, object payload)
        {
            var ids = teacherIds.Select(id => id.ToString()).Distinct();
            return hub.Clients.Users(ids).SendAsync("assignmentSubmission", payload);
        }
    }
}