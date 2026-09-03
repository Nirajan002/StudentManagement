namespace backend.Modules
{
    public class RefreshToken
    {
        public Guid Id { get; set; }

        public string Token { get; set; } = string.Empty;

        public Guid TeacherId { get; set; }

        public DateTime ExpiresAt { get; set; }

        public Teacher Teacher { get; set; } = null!;
    }
}
