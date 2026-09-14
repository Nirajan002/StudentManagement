namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
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
            return dbContext.Students
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
                    s.Section
                })
                .ToList<object>();
        }

        public async Task<object?> GetByIdAsync(Guid id)
        {
            var s = await dbContext.Students.FindAsync(id);
            if (s == null) return null;
            return new { s.Id, s.FullName, s.Email, s.Profile, s.Class, s.Section, s.Gender, s.Number, s.Addresh };
        }

        public async Task<object?> UpdateAsync(Guid id, UpdateStudent request)
        {
            var student = await dbContext.Students.FindAsync(id);
            if (student == null) return null;

            student.FullName = request.FullName;
            student.Email = request.Email;
            student.Class = request.Class;
            student.Section = request.Section;
            student.Gender = request.Gender;
            student.Number = request.Number;
            student.Addresh = request.Addresh;

            if (request.Profile != null)
            {
                fileStorage.Delete(student.Profile);
                student.Profile = await fileStorage.SaveAsync(request.Profile, FileCategory.Image);
            }

            await dbContext.SaveChangesAsync();

            return new { student.Id, student.FullName, student.Email, student.Profile, student.Class, student.Section, student.Number, student.Gender, student.Addresh };
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