namespace backend.Services
{
    using backend.Data;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class ClassSectionService : IClassSectionService
    {
        private readonly StudentManagement dbContext;

        public ClassSectionService(StudentManagement dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IEnumerable<object>> GetAllAsync()
        {
            var sections = await dbContext.ClassSections
                .Include(cs => cs.Instructor)
                .ToListAsync();

            // Ordered numerically by class (so "2" comes before "10"), then section.
            var ordered = sections
                .OrderBy(cs => cs.ClassName.Length)
                .ThenBy(cs => cs.ClassName)
                .ThenBy(cs => cs.Section);

            var result = new List<object>();

            foreach (var cs in ordered)
            {
                var studentCount = await dbContext.Students
                    .CountAsync(s => s.Class == cs.ClassName && s.Section == cs.Section);

                result.Add(new
                {
                    cs.Id,
                    ClassName = cs.ClassName,
                    cs.Section,
                    StudentCount = studentCount,
                    InstructorId = cs.InstructorId,
                    InstructorName = cs.Instructor?.FullName,
                    InstructorEmail = cs.Instructor?.Email,
                });
            }

            return result;
        }

        public async Task<object> AssignInstructorAsync(int classSectionId, Guid? teacherId)
        {
            var section = await dbContext.ClassSections.FindAsync(classSectionId)
                ?? throw new NotFoundException("Class-section not found.");

            if (teacherId.HasValue)
            {
                var teacherExists = await dbContext.Teachers.AnyAsync(t => t.Id == teacherId.Value);
                if (!teacherExists)
                    throw new ValidationException("Selected teacher does not exist.");
            }

            section.InstructorId = teacherId;
            await dbContext.SaveChangesAsync();

            var teacher = teacherId.HasValue
                ? await dbContext.Teachers.FindAsync(teacherId.Value)
                : null;

            return new
            {
                section.Id,
                ClassName = section.ClassName,
                section.Section,
                InstructorId = section.InstructorId,
                InstructorName = teacher?.FullName,
            };
        }

        public async Task<IEnumerable<object>> GetMineAsync(Guid teacherId)
        {
            var sections = await dbContext.ClassSections
                .Where(cs => cs.InstructorId == teacherId)
                .ToListAsync();

            var result = new List<object>();

            foreach (var cs in sections.OrderBy(cs => cs.ClassName).ThenBy(cs => cs.Section))
            {
                var studentCount = await dbContext.Students
                    .CountAsync(s => s.Class == cs.ClassName && s.Section == cs.Section);

                result.Add(new
                {
                    cs.Id,
                    ClassName = cs.ClassName,
                    cs.Section,
                    StudentCount = studentCount,
                });
            }

            return result;
        }
    }
}