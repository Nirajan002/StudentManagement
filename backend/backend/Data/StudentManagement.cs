using backend.Modules;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

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
        public DbSet<GroupPost> GroupPosts { get; set; }
        public DbSet<GlobalNotice> GlobalNotices { get; set; }
        public DbSet<ReadState> ReadStates { get; set; }
        public DbSet<OtpCode> OtpCodes { get; set; }
        public DbSet<AssignmentSubmission> AssignmentSubmissions { get; set; }
        public DbSet<ClassSection> ClassSections { get; set; }
        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }

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

            modelBuilder.Entity<GroupPost>()
                .HasOne(p => p.Group)
                .WithMany()
                .HasForeignKey(p => p.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupPost>()
                .HasOne(p => p.PostedBy)
                .WithMany()
                .HasForeignKey(p => p.PostedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Teacher>()
                .Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Student>()
                .Property(s => s.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Class + Section + Roll Number: no two students may share the same roll
            // number inside the same class and section. Students that have not been
            // placed yet (any of the three is NULL) are ignored by the filter.
            // Class and Section need a max length so SQL Server can index them.
            modelBuilder.Entity<Student>(e =>
            {
                e.Property(s => s.Class).HasMaxLength(20);
                e.Property(s => s.Section).HasMaxLength(10);

                e.HasIndex(s => new { s.Class, s.Section, s.RollNumber })
                    .IsUnique()
                    .HasFilter("[Class] IS NOT NULL AND [Section] IS NOT NULL AND [RollNumber] IS NOT NULL");
            });

            modelBuilder.Entity<GlobalNotice>()
                .HasOne(n => n.PostedBy)
                .WithMany()
                .HasForeignKey(n => n.PostedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReadState>()
                .HasIndex(r => new { r.UserId, r.ChannelType, r.GroupId })
                .IsUnique();

            modelBuilder.Entity<OtpCode>()
                .HasIndex(o => new { o.UserId, o.UserType, o.Purpose });

            modelBuilder.Entity<AssignmentSubmission>()
                .HasIndex(s => new { s.GroupPostId, s.StudentId })
                .IsUnique();

            modelBuilder.Entity<AssignmentSubmission>()
                .HasOne(s => s.GroupPost)
                .WithMany()
                .HasForeignKey(s => s.GroupPostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AssignmentSubmission>()
                .HasOne(s => s.Student)
                .WithMany()
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ClassSection>(e =>
            {
                e.Property(cs => cs.ClassName).HasMaxLength(20);
                e.Property(cs => cs.Section).HasMaxLength(10);

                e.HasIndex(cs => new { cs.ClassName, cs.Section }).IsUnique();

                e.HasOne(cs => cs.Instructor)
                    .WithMany()
                    .HasForeignKey(cs => cs.InstructorId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<AttendanceRecord>(e =>
            {
                e.HasIndex(a => new { a.ClassSectionId, a.StudentId, a.Date }).IsUnique();

                e.HasOne(a => a.ClassSection)
                    .WithMany()
                    .HasForeignKey(a => a.ClassSectionId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(a => a.Student)
                    .WithMany()
                    .HasForeignKey(a => a.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(a => a.MarkedBy)
                    .WithMany()
                    .HasForeignKey(a => a.MarkedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // as local time, throwing off any client-side date comparisons.
            var utcConverter = new ValueConverter<DateTime, DateTime>(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var utcNullableConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                        property.SetValueConverter(utcConverter);
                    else if (property.ClrType == typeof(DateTime?))
                        property.SetValueConverter(utcNullableConverter);
                }
            }
        }
    }
}