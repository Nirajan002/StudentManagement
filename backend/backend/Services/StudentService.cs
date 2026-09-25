namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class StudentService : IStudentService
    {
        private readonly StudentManagement dbContext;
        private readonly IFileStorageService fileStorage;

        public StudentService(StudentManagement dbContext, IFileStorageService fileStorage)
        {
            this.dbContext = dbContext;
            this.fileStorage = fileStorage;
        }

        public List<object> GetPaged(int page)
        {
            const int pageSize = 10;

            // Ordered so students appear grouped as: Class → Section → Roll number.
            // Students without a class go last. Class is ordered by length first so
            // "2" comes before "10" (a plain text sort would put "10" before "2").
            return dbContext.Students
                .OrderBy(s => s.Class == null)
                .ThenBy(s => s.Class!.Length)
                .ThenBy(s => s.Class)
                .ThenBy(s => s.Section)
                .ThenBy(s => s.RollNumber)
                .ThenBy(s => s.FullName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new
                {
                    s.Id,
                    s.FullName,
                    s.Gender,
                    s.Number,
                    s.Addresh,
                    s.Email,
                    s.Profile,
                    s.Class,
                    s.Section,
                    s.RollNumber
                })
                .ToList<object>();
        }

        public async Task<object?> GetByIdAsync(Guid id)
        {
            var s = await dbContext.Students.FindAsync(id);
            if (s == null) return null;
            return new { s.Id, s.FullName, s.Email, s.Profile, s.Class, s.Section, s.RollNumber, s.Gender, s.Number, s.Addresh, s.EmailVerified };
        }

        public async Task<object?> UpdateAsync(Guid id, UpdateStudent request)
        {
            var student = await dbContext.Students.FindAsync(id);
            if (student == null) return null;

            var placement = StudentPlacement.Normalize(
                request.Class, request.Section, request.RollNumber, required: false);

            await StudentPlacement.EnsureRollNumberFreeAsync(dbContext, placement, excludeStudentId: id);
            await StudentPlacement.EnsureClassSectionExistsAsync(dbContext, placement); // NEW

            student.FullName = request.FullName;
            student.Email = request.Email;
            student.Class = placement.Class;
            student.Section = placement.Section;
            student.RollNumber = placement.RollNumber;
            student.Gender = request.Gender;
            student.Number = request.Number;
            student.Addresh = request.Addresh;

            if (request.Profile != null)
            {
                fileStorage.Delete(student.Profile);
                student.Profile = await fileStorage.SaveAsync(request.Profile, FileCategory.Image);
            }

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new ConflictException("That roll number was just taken. Please choose another.");
            }

            return new { student.Id, student.FullName, student.Email, student.Profile, student.Class, student.Section, student.RollNumber, student.Number, student.Gender, student.Addresh };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var student = await dbContext.Students.FindAsync(id);
            if (student == null) return false;

            dbContext.Students.Remove(student);
            await dbContext.SaveChangesAsync();
            return true;
        }

        public List<object> Search(string search, int limit)
        {
            if (string.IsNullOrWhiteSpace(search)) return new List<object>();

            return dbContext.Students
                .Where(s => s.FullName != null && s.FullName.ToLower().Contains(search.ToLower()))
                .Take(limit)
                .Select(s => new { s.Id, s.FullName, s.Profile })
                .ToList<object>();
        }

        public async Task<object?> UpdateProfileAsync(Guid id, StudentProfileUpdate request)
        {
            var student = await dbContext.Students.FindAsync(id);
            if (student == null) return null;

            student.Gender = request.Gender;
            student.Number = request.Number;
            student.Addresh = request.Addresh;

            if (request.Profile is { Length: > 0 })
            {
                fileStorage.Delete(student.Profile);
                student.Profile = await fileStorage.SaveAsync(request.Profile, FileCategory.Image);
            }

            await dbContext.SaveChangesAsync();

            return new { student.Id, student.FullName, student.Email, student.Profile, student.Gender, student.Number, student.Addresh };
        }
    }
}