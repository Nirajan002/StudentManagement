using backend.DTOs;
using backend.Modules;
using backend.Services;
using backend.Services.Exceptions;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GlobalNoticesController : Controller
    {
        private readonly IGlobalNoticeService noticeService;
        private readonly IReadStateService readStateService;

        public GlobalNoticesController(IGlobalNoticeService noticeService, IReadStateService readStateService)
        {
            this.noticeService = noticeService;
            this.readStateService = readStateService;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetGlobalNotices() => Ok(await noticeService.GetNoticesAsync());

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateGlobalNotice([FromForm] CreateGlobalNoticeRequest request)
        {
            try
            {
                return Ok(await noticeService.CreateNoticeAsync(CurrentUserId, request));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGlobalNotice(int id)
        {
            try
            {
                await noticeService.DeleteNoticeAsync(id);
                return Ok(new { message = "Global notice deleted." });
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadGlobalNotice(int id)
        {
            try
            {
                var result = await noticeService.DownloadNoticeAsync(id);
                return File(result.Bytes, "application/octet-stream", result.FileName);
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("last-viewed")]
        public async Task<IActionResult> GetLastViewed()
        {
            var lastViewedAt = await readStateService.GetLastViewedAsync(CurrentUserId, ReadChannelType.GlobalNotices, null);
            return Ok(new { lastViewedAt });
        }

        [HttpPost("mark-viewed")]
        public async Task<IActionResult> MarkViewed()
        {
            var lastViewedAt = await readStateService.MarkViewedAsync(CurrentUserId, ReadChannelType.GlobalNotices, null);
            return Ok(new { lastViewedAt });
        }
    }
}