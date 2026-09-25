namespace backend.Services
{
    using backend.Data;
    using backend.Modules;
    using backend.Services.Exceptions;
    using Microsoft.EntityFrameworkCore;

    public static class StudentPlacement
    {
        public const int MaxClassLength = 20;
        public const int MaxSectionLength = 10;
        public const int MaxRollNumber = 9999;

        public record Result(string? Class, string? Section, int? RollNumber);

        public static Result Normalize(string? className, string? section, int? rollNumber, bool required)
        {
            var cls = string.Join(' ', (className ?? string.Empty)
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
            var sec = (section ?? string.Empty).Trim().ToUpperInvariant();

            var provided = (cls.Length > 0 ? 1 : 0)
                         + (sec.Length > 0 ? 1 : 0)
                         + (rollNumber.HasValue ? 1 : 0);

            if (provided == 0)
            {
                if (required)
                    throw new ValidationException("Class, section and roll number are required.");

                return new Result(null, null, null);
            }

            if (provided < 3)
                throw new ValidationException(
                    "Enter class, section and roll number together, or leave all three blank.");

            if (cls.Length > MaxClassLength)
                throw new ValidationException($"Class can be at most {MaxClassLength} characters.");

            if (sec.Length > MaxSectionLength)
                throw new ValidationException($"Section can be at most {MaxSectionLength} characters.");

            if (rollNumber!.Value < 1 || rollNumber.Value > MaxRollNumber)
                throw new ValidationException($"Roll number must be between 1 and {MaxRollNumber}.");

            return new Result(cls, sec, rollNumber);
        }

        public static async Task EnsureRollNumberFreeAsync(
            StudentManagement dbContext,
            Result placement,
            Guid? excludeStudentId)
        {
            if (placement.Class == null) return;

            var holder = await dbContext.Students
                .Where(s => s.Class == placement.Class
                         && s.Section == placement.Section
                         && s.RollNumber == placement.RollNumber
                         && (excludeStudentId == null || s.Id != excludeStudentId))
                .Select(s => s.FullName)
                .FirstOrDefaultAsync();

            if (holder != null)
                throw new ConflictException(
                    $"Roll number {placement.RollNumber} is already taken by {holder} in Class {placement.Class} {placement.Section}.");
        }

        /// <summary>
        /// Makes sure a ClassSection row exists for this class + section, so it shows
        /// up on the admin's "assign instructor" page. Call this after a student has
        /// been successfully placed (added or edited into a class + section).
        /// No-op if placement.Class is null (student has no class yet).
        /// </summary>
        public static async Task EnsureClassSectionExistsAsync(StudentManagement dbContext, Result placement)
        {
            if (placement.Class == null) return;

            var exists = await dbContext.ClassSections.AnyAsync(cs =>
                cs.ClassName == placement.Class && cs.Section == placement.Section);

            if (exists) return;

            dbContext.ClassSections.Add(new ClassSection
            {
                ClassName = placement.Class!,
                Section = placement.Section!,
            });

            // Saved by the caller's own SaveChangesAsync (same unit of work as the student).
        }
    }
}