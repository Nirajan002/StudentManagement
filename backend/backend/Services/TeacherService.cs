namespace backend.Services
{
    using backend.Data;
    using backend.DTOs;
    using backend.Services.Exceptions;
    using backend.Services.Interfaces;
    using Microsoft.EntityFrameworkCore;

    public class TeacherService : ITeacherService
    {
        private readonly StudentManagement dbContext;
        private readonly IFileStorageService fileStorage;

        public TeacherService(StudentManagement dbContext, IFileStorageService fileStorage)
        {
            this.dbContext = dbContext;
            this.fileStorage = fileStorage;
        }

        public async Task<object> GetCurrentAsync(Guid teacherId)
        {
            var teacher = await dbContext.Teachers.FirstOrDefaultAsync(t => t.Id == teacherId)
                ?? throw new NotFoundException();

            return new { teacher.Id, teacher.FullName, teacher.Email, teacher.Profile, teacher.Role, teacher.Gender, teacher.Number, teacher.Address };
        }

        public async Task<object> UpdateProfileAsync(Guid id, TeacherProfileUpdate request)
        {
            var teacher = await dbContext.Teachers.FindAsync(id) ?? throw new NotFoundException();

            teacher.FullName = request.FullName;
            teacher.Email = request.Email;
            teacher.Gender = request.Gender;
            teacher.Number = request.Number;
            teacher.Address = request.Address;

            if (request.Profile is { Length: > 0 })
            {
                fileStorage.Delete(teacher.Profile);
                teacher.Profile = await fileStorage.SaveAsync(request.Profile, FileCategory.Image);
            }

            await dbContext.SaveChangesAsync();

            return new { teacher.Id, teacher.FullName, teacher.Email, teacher.Profile, teacher.Number, teacher.Gender, teacher.Address };
        }

        public List<object> GetPaged(int page)
        {
            const int pageSize = 10;
            return dbContext.Teachers
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new { t.Id, t.FullName, t.Gender, t.Number, t.Address, t.Email, t.Profile })
                .ToList<object>();
        }

        public object GetById(Guid id)
        {
            var teacher = dbContext.Teachers.Find(id) ?? throw new NotFoundException();
            return new { teacher.Id, teacher.FullName, teacher.Email, teacher.Profile, teacher.Gender, teacher.Number, teacher.Address, teacher.Role, teacher.EmailVerified };
        }

        public async Task DeleteAsync(Guid id)
        {
            var teacher = await dbContext.Teachers.FindAsync(id) ?? throw new NotFoundException();
            dbContext.Teachers.Remove(teacher);
            await dbContext.SaveChangesAsync();
        }

        public async Task<object> UpdateAsync(Guid id, UpdateTeacher request)
        {
            var teacher = await dbContext.Teachers.FindAsync(id) ?? throw new NotFoundException();

            teacher.FullName = request.FullName;
            teacher.Email = request.Email;
            teacher.Gender = request.Gender;
            teacher.Number = request.Number;
            teacher.Address = request.Address;
            teacher.Role = request.Role;

            if (request.Profile is { Length: > 0 })
            {
                fileStorage.Delete(teacher.Profile);
                teacher.Profile = await fileStorage.SaveAsync(request.Profile, FileCategory.Image);
            }

            await dbContext.SaveChangesAsync();

            return new { teacher.Id, teacher.FullName, teacher.Email, teacher.Profile, teacher.Number, teacher.Gender, teacher.Address, teacher.Role };
        }

        public List<object> Search(string search, int limit)
        {
            if (string.IsNullOrWhiteSpace(search)) return new List<object>();

            return dbContext.Teachers
                .Where(t => t.FullName != null && t.FullName.ToLower().Contains(search.ToLower()))
                .Take(limit)
                .Select(t => new { t.Id, t.FullName, t.Profile })
                .ToList<object>();
        }
    }
}