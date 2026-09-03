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

        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Student> Students { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.Teacher)
                .WithMany()
                .HasForeignKey(r => r.TeacherId);
        }
    }
}
