namespace backend.Services.Interfaces
{
    public interface IRealtimeNotifier
    {
        Task NotifyGlobalNoticeAsync(object notice);
        Task NotifyGroupPostAsync(int groupId, IEnumerable<Guid> recipientUserIds, object post);
        Task NotifyAssignmentFeedbackAsync(Guid studentId, object payload);
        Task NotifyAssignmentSubmissionAsync(IEnumerable<Guid> teacherIds, object payload);
    }
}