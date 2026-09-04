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
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<GroupManager> GroupManagers { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.Teacher)
                .WithMany()
                .HasForeignKey(r => r.TeacherId);

            // Prevent duplicate active memberships (one student can't be added twice to the same group)
            modelBuilder.Entity<GroupMember>()
                .HasIndex(gm => new { gm.GroupId, gm.StudentId })
                .HasFilter("[RemovedAt] IS NULL")
                .IsUnique();

            modelBuilder.Entity<Group>()
                .HasOne(g => g.CreatedBy)
                .WithMany()
                .HasForeignKey(g => g.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.Group)
                .WithMany(g => g.Members)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.Student)
                .WithMany()
                .HasForeignKey(gm => gm.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.AddedBy)
                .WithMany()
                .HasForeignKey(gm => gm.AddedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupManager>()
                .HasOne(gm => gm.Group)
                .WithMany(g => g.Managers)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupManager>()
                .HasOne(gm => gm.User)
                .WithMany()
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
