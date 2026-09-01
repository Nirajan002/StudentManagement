namespace backend.Modules
{
    public class RefreshToken
    {
        public Guid Id { get; set; }

        public string Token { get; set; } = string.Empty;

        public Guid UserId { get; set; }

        public DateTime ExpiresAt { get; set; }

        public User User { get; set; } = null!;
    }
}
