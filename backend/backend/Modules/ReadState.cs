namespace backend.Modules
{
    public enum ReadChannelType
    {
        GlobalNotices = 0,
        Group = 1
    }

    public class ReadState
    {
        public int Id { get; set; }

        public Guid UserId { get; set; }

        public ReadChannelType ChannelType { get; set; }

        // Null for GlobalNotices; the group's Id for ChannelType.Group
        public int? GroupId { get; set; }

        public DateTime LastReadAt { get; set; }
    }
}