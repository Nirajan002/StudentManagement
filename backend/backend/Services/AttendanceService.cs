namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Modules;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class AttendanceService : IAttendanceService
    {
        private readonly StudentManagement dbContext;

        public AttendanceService(StudentManagement dbContext)
        {
            this.dbContext = dbContext;
        }

        private static DateTime NormalizeDate(DateTime date) =>
            DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

        private async Task<ClassSection> GetSectionOrThrowAsync(int classSectionId) =>
            await dbContext.ClassSections.FindAsync(classSectionId)
                ?? throw new NotFoundException("Class-section not found.");

        public async Task<object> MarkAttendanceAsync(
            MarkAttendanceRequest request,
            Guid markedById,
            bool isAdmin)
        {
            var section = await GetSectionOrThrowAsync(request.ClassSectionId);

            if (!isAdmin && section.InstructorId != markedById)
                throw new ForbiddenException(
                    "You are not the assigned instructor for this class-section.");

            if (request.Records == null || request.Records.Count == 0)
                throw new ValidationException(
                    "At least one attendance record is required.");

            var date = NormalizeDate(request.Date);

            // Only students actually placed in this class + section may be marked.
            var validStudentIds = (await dbContext.Students
                .Where(s =>
                    s.Class == section.ClassName &&
                    s.Section == section.Section)
                .Select(s => s.Id)
                .ToListAsync())
                .ToHashSet();

            var requestedIds = request.Records
                .Select(r => r.StudentId)
                .Distinct()
                .ToList();

            var existingByStudent = (await dbContext.AttendanceRecords
                .Where(a =>
                    a.ClassSectionId == section.Id &&
                    a.Date == date &&
                    requestedIds.Contains(a.StudentId))
                .ToListAsync())
                .ToDictionary(a => a.StudentId);

            var saved = 0;
            var skipped = 0;

            foreach (var entry in request.Records)
            {
                if (!validStudentIds.Contains(entry.StudentId))
                {
                    skipped++;
                    continue;
                }

                if (!Enum.TryParse<AttendanceStatus>(
                        entry.Status,
                        true,
                        out var status))
                {
                    status = AttendanceStatus.Present;
                }

                if (existingByStudent.TryGetValue(
                        entry.StudentId,
                        out var record))
                {
                    record.Status = status;
                    record.MarkedById = markedById;
                    record.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    dbContext.AttendanceRecords.Add(
                        new AttendanceRecord
                        {
                            ClassSectionId = section.Id,
                            StudentId = entry.StudentId,
                            Date = date,
                            Status = status,
                            MarkedById = markedById,
                            MarkedAt = DateTime.UtcNow
                        });
                }

                saved++;
            }

            await dbContext.SaveChangesAsync();

            return new
            {
                saved,
                skipped,
                date
            };
        }

        public async Task<object> GetRosterAsync(
            int classSectionId,
            DateTime date)
        {
            var section = await GetSectionOrThrowAsync(classSectionId);
            var normalizedDate = NormalizeDate(date);

            var students = await dbContext.Students
                .Where(s =>
                    s.Class == section.ClassName &&
                    s.Section == section.Section)
                .OrderBy(s => s.RollNumber)
                .Select(s => new
                {
                    s.Id,
                    s.FullName,
                    s.RollNumber,
                    s.Profile
                })
                .ToListAsync();

            var byStudent = (await dbContext.AttendanceRecords
                .Where(a =>
                    a.ClassSectionId == classSectionId &&
                    a.Date == normalizedDate)
                .ToListAsync())
                .ToDictionary(
                    r => r.StudentId,
                    r => r.Status.ToString());

            return new
            {
                ClassSectionId = section.Id,
                ClassName = section.ClassName,
                section.Section,
                Date = normalizedDate,

                Students = students.Select(s => new
                {
                    s.Id,
                    s.FullName,
                    s.RollNumber,
                    s.Profile,
                    Status = byStudent.TryGetValue(
                        s.Id,
                        out var st)
                        ? st
                        : null
                })
            };
        }

        public async Task<object> GetAttendanceSheetAsync(
            int classSectionId,
            DateTime? from,
            DateTime? to)
        {
            var section = await GetSectionOrThrowAsync(classSectionId);

            var students = await dbContext.Students
                .Where(s =>
                    s.Class == section.ClassName &&
                    s.Section == section.Section)
                .OrderBy(s => s.RollNumber)
                .Select(s => new
                {
                    s.Id,
                    s.FullName,
                    s.RollNumber
                })
                .ToListAsync();

            var query = dbContext.AttendanceRecords
                .Where(a => a.ClassSectionId == classSectionId);

            if (from.HasValue)
                query = query.Where(a =>
                    a.Date >= NormalizeDate(from.Value));

            if (to.HasValue)
                query = query.Where(a =>
                    a.Date <= NormalizeDate(to.Value));

            var records = await query.ToListAsync();

            var dates = records
                .Select(r => r.Date)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            var grid = students.Select(s =>
            {
                var studentRecords = records
                    .Where(r => r.StudentId == s.Id)
                    .ToDictionary(
                        r => r.Date.ToString("yyyy-MM-dd"),
                        r => r.Status.ToString());

                // Present + Late are both counted as attended.
                var present = studentRecords.Values.Count(v =>
                    v == "Present" || v == "Late");

                var total = studentRecords.Count;

                return new
                {
                    s.Id,
                    s.FullName,
                    s.RollNumber,
                    Records = studentRecords,

                    PresentCount = present,
                    TotalMarked = total,

                    PercentPresent = total > 0
                        ? Math.Round(
                            present * 100.0 / total,
                            1)
                        : (double?)null
                };
            }).ToList();

            return new
            {
                ClassSectionId = section.Id,
                ClassName = section.ClassName,
                section.Section,
                Dates = dates.Select(
                    d => d.ToString("yyyy-MM-dd")),
                Students = grid
            };
        }

        public async Task<object> GetStudentAttendanceAsync(
            Guid studentId,
            DateTime? from,
            DateTime? to)
        {
            var student = await dbContext.Students.FindAsync(studentId)
                ?? throw new NotFoundException("Student not found.");

            var query = dbContext.AttendanceRecords
                .Where(a => a.StudentId == studentId);

            if (from.HasValue)
                query = query.Where(a =>
                    a.Date >= NormalizeDate(from.Value));

            if (to.HasValue)
                query = query.Where(a =>
                    a.Date <= NormalizeDate(to.Value));

            var records = await query
                .OrderByDescending(a => a.Date)
                .Select(a => new
                {
                    a.Id,
                    a.Date,
                    Status = a.Status.ToString(),
                    a.ClassSectionId,
                    ClassSectionName =
                        a.ClassSection.ClassName +
                        " " +
                        a.ClassSection.Section
                })
                .ToListAsync();

            var total = records.Count;

            // Present + Late are both counted as attended.
            var present = records.Count(r =>
                r.Status == "Present" ||
                r.Status == "Late");

            return new
            {
                StudentId = studentId,
                student.FullName,

                Total = total,

                // This now includes both Present and Late.
                Present = present,

                Absent = records.Count(r =>
                    r.Status == "Absent"),

                // Late is still counted separately for display.
                Late = records.Count(r =>
                    r.Status == "Late"),

                Excused = records.Count(r =>
                    r.Status == "Excused"),

                // Attendance percentage = (Present + Late) / Total × 100
                PercentPresent = total > 0
                    ? Math.Round(
                        present * 100.0 / total,
                        1)
                    : (double?)null,

                Records = records
            };
        }
    }
}