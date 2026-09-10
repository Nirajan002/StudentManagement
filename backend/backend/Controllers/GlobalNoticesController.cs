using backend.Data;
using backend.DTOs;
using backend.Modules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GlobalNoticesController : Controller
    {
        private readonly StudentManagement dbContext;

        public GlobalNoticesController(StudentManagement dbContext)
        {
            this.dbContext = dbContext;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/globalnotices
        [HttpGet]
        public async Task<IActionResult> GetGlobalNotices()
        {
            await RemoveExpiredAsync();

            var notices = await dbContext.GlobalNotices
                .OrderByDescending(n => n.PostedAt)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Content,
                    n.FileName,
                    n.OriginalFileName,
                    n.AutoDeleteAt,
                    n.PostedById,
                    PostedByName = n.PostedBy.FullName,
                    n.PostedAt
                })
                .ToListAsync();

            return Ok(notices);
        }

        // POST api/globalnotices
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateGlobalNotice([FromForm] CreateGlobalNoticeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(new { message = "Title is required." });
            }

            if (string.IsNullOrWhiteSpace(request.Content) &&
                (request.File == null || request.File.Length == 0))
            {
                return BadRequest(new { message = "Add a message or attach a file." });
            }

            if (request.AutoDeleteAt.HasValue && request.AutoDeleteAt.Value <= DateTime.UtcNow)
            {
                return BadRequest(new { message = "Auto-delete date must be in the future." });
            }

            string? storedFileName = null;
            string? originalFileName = null;

            if (request.File != null && request.File.Length > 0)
            {
                string uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                storedFileName = Guid.NewGuid().ToString() + Path.GetExtension(request.File.FileName);
                originalFileName = request.File.FileName;

                string filePath = Path.Combine(uploadPath, storedFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }
            }

            var notice = new GlobalNotice
            {
                Title = request.Title,
                Content = request.Content,
                FileName = storedFileName,
                OriginalFileName = originalFileName,
                AutoDeleteAt = request.AutoDeleteAt,
                PostedById = CurrentUserId,
                PostedAt = DateTime.UtcNow
            };

            dbContext.GlobalNotices.Add(notice);
            await dbContext.SaveChangesAsync();

            var postedBy = await dbContext.Teachers.FindAsync(CurrentUserId);

            return Ok(new
            {
                notice.Id,
                notice.Title,
                notice.Content,
                notice.FileName,
                notice.OriginalFileName,
                notice.AutoDeleteAt,
                notice.PostedById,
                PostedByName = postedBy?.FullName,
                notice.PostedAt
            });
        }

        // DELETE api/globalnotices/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGlobalNotice(int id)
        {
            var notice = await dbContext.GlobalNotices.FindAsync(id);

            if (notice == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(notice.FileName))
            {
                string uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                string filePath = Path.Combine(uploadPath, notice.FileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            dbContext.GlobalNotices.Remove(notice);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Global notice deleted." });
        }

        // GET api/globalnotices/{id}/download
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadGlobalNotice(int id)
        {
            var notice = await dbContext.GlobalNotices.FindAsync(id);

            if (notice == null || string.IsNullOrEmpty(notice.FileName))
            {
                return NotFound();
            }

            string uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            string filePath = Path.Combine(uploadPath, notice.FileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var downloadName = notice.OriginalFileName ?? notice.FileName;

            return File(bytes, "application/octet-stream", downloadName);
        }

        private async Task RemoveExpiredAsync()
        {
            var now = DateTime.UtcNow;

            var expired = await dbContext.GlobalNotices
                .Where(n => n.AutoDeleteAt != null && n.AutoDeleteAt <= now)
                .ToListAsync();

            if (expired.Count == 0) return;

            foreach (var notice in expired)
            {
                if (!string.IsNullOrEmpty(notice.FileName))
                {
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", notice.FileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }

            dbContext.GlobalNotices.RemoveRange(expired);
            await dbContext.SaveChangesAsync();
        }

        [HttpGet("last-viewed")]
        public async Task<IActionResult> GetLastViewed()
        {
            var state = await dbContext.ReadStates.FirstOrDefaultAsync(r =>
                r.UserId == CurrentUserId &&
                r.ChannelType == ReadChannelType.GlobalNotices);

            return Ok(new { lastViewedAt = state?.LastReadAt });
        }

        [HttpPost("mark-viewed")]
        public async Task<IActionResult> MarkViewed()
        {
            var now = DateTime.UtcNow;

            var state = await dbContext.ReadStates.FirstOrDefaultAsync(r =>
                r.UserId == CurrentUserId &&
                r.ChannelType == ReadChannelType.GlobalNotices);

            if (state == null)
            {
                dbContext.ReadStates.Add(new ReadState
                {
                    UserId = CurrentUserId,
                    ChannelType = ReadChannelType.GlobalNotices,
                    GroupId = null,
                    LastReadAt = now
                });
            }
            else
            {
                state.LastReadAt = now;
            }

            await dbContext.SaveChangesAsync();

            return Ok(new { lastViewedAt = now });
        }
    }
}