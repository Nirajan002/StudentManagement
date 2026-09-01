using backend.Modules;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class StudentManagement : DbContext
    {
        public StudentManagement(DbContextOptions<StudentManagement> options) 
            : base(options) 
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId);
        }
    }
}
