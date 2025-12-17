using LostAndFound.Application.Interfaces;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System;
using System.Linq;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/matching")]
    [Authorize]
    public class MatchingController : ControllerBase
    {
        private readonly LostAndFoundDbContext _db;
        private readonly IStudentClaimService _claimService;

        public MatchingController(LostAndFoundDbContext db, IStudentClaimService claimService)
        {
            _db = db;
            _claimService = claimService;
        }

        /// <summary>
        /// Lấy danh sách pending matches cho student
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Roles = "STUDENT")]
        public async Task<IActionResult> GetPendingMatches([FromQuery] int page = 1, [FromQuery] int limit = 50)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            try
            {
                // Use Select projection to avoid Include issues with multiple ThenInclude
                var query = _db.StudentClaims
                    .AsNoTracking()
                    .Where(c => c.StudentId == studentId && c.Status == "PENDING")
                    .Select(c => new
                    {
                        c.Id,
                        c.Status,
                        c.CreatedAt,
                        c.Description,
                        // FoundItem data
                        FoundItemId = c.FoundItem.Id,
                        FoundItemDescription = c.FoundItem.Description,
                        FoundItemImageUrl = c.FoundItem.ImageUrl,
                        FoundItemFoundTime = c.FoundItem.FoundTime,
                        FoundItemFoundLocation = c.FoundItem.FoundLocation,
                        FoundItemStatus = c.FoundItem.Status,
                        FoundItemCategoryName = c.FoundItem.ItemCategory.Name,
                        FoundItemCampusName = c.FoundItem.Campus.Name,
                        // LostReport data (nullable)
                        LostReportId = c.LostReport != null ? c.LostReport.Id : (int?)null,
                        LostReportTitle = c.LostReport != null ? c.LostReport.Title : null,
                        LostReportDescription = c.LostReport != null ? c.LostReport.Description : null,
                        LostReportCategoryName = c.LostReport != null && c.LostReport.ItemCategory != null ? c.LostReport.ItemCategory.Name : null,
                        LostReportCampusName = c.LostReport != null && c.LostReport.Campus != null ? c.LostReport.Campus.Name : null,
                        LostReportLostTime = c.LostReport != null ? c.LostReport.LostTime : (DateTime?)null,
                        LostReportLostLocation = c.LostReport != null ? c.LostReport.LostLocation : null,
                        LostReportImageUrl = c.LostReport != null ? c.LostReport.ImageUrl : null,
                        LostReportStatus = c.LostReport != null ? c.LostReport.Status : null
                    })
                    .OrderByDescending(c => c.CreatedAt);

                // Get total count
                var total = await query.CountAsync();

                // Apply pagination
                var pagedData = await query
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                var result = pagedData.Select(c => new
                {
                    _id = c.Id,
                    matchId = c.Id,
                    lostItem = c.LostReportId.HasValue ? new
                    {
                        _id = c.LostReportId.Value,
                        reportId = c.LostReportId.Value,
                        itemName = c.LostReportTitle,
                        description = c.LostReportDescription,
                        category = c.LostReportCategoryName,
                        campus = c.LostReportCampusName,
                        lostTime = c.LostReportLostTime,
                        lostLocation = c.LostReportLostLocation,
                        imageUrl = c.LostReportImageUrl,
                        status = c.LostReportStatus
                    } : null,
                    foundItem = new
                    {
                        _id = c.FoundItemId,
                        foundId = c.FoundItemId,
                        itemName = c.FoundItemDescription,
                        description = c.FoundItemDescription,
                        category = c.FoundItemCategoryName,
                        campus = c.FoundItemCampusName,
                        foundTime = c.FoundItemFoundTime,
                        foundLocation = c.FoundItemFoundLocation,
                        imageUrl = c.FoundItemImageUrl,
                        status = c.FoundItemStatus
                    },
                    status = c.Status,
                    createdAt = c.CreatedAt,
                    description = c.Description
                }).ToList();

                return Ok(new
                {
                    success = true,
                    data = result,
                    pagination = new
                    {
                        page,
                        limit,
                        total,
                        totalPages = (int)Math.Ceiling(total / (double)limit)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = $"Lỗi server: {ex.Message}" });
            }
        }

        /// <summary>
        /// Student confirm match
        /// </summary>
        [HttpPost("{matchId:int}/confirm")]
        [Authorize(Roles = "STUDENT")]
        public Task<IActionResult> ConfirmMatch(int matchId, [FromBody] object notes)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Task.FromResult<IActionResult>(Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" }));
            }

            // TODO: Implement confirm match logic
            return Task.FromResult<IActionResult>(Ok(new { success = true, message = "Confirm match thành công" }));
        }

        /// <summary>
        /// Student reject match
        /// </summary>
        [HttpPost("{matchId:int}/reject")]
        [Authorize(Roles = "STUDENT")]
        public Task<IActionResult> RejectMatch(int matchId, [FromBody] object reason)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Task.FromResult<IActionResult>(Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" }));
            }

            // TODO: Implement reject match logic
            return Task.FromResult<IActionResult>(Ok(new { success = true, message = "Reject match thành công" }));
        }

        /// <summary>
        /// Lấy danh sách matches (cho staff)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "STAFF")]
        public async Task<IActionResult> GetMatches([FromQuery] int page = 1, [FromQuery] int limit = 20, [FromQuery] string? status = null)
        {
            try
            {
                var query = _db.StudentClaims
                    .Include(c => c.FoundItem)
                    .Include(c => c.LostReport)
                    .Include(c => c.Student)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(c => c.Status == status.ToUpper());
                }

                var total = await query.CountAsync();
                var matches = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = matches,
                    pagination = new
                    {
                        page,
                        limit,
                        total,
                        totalPages = (int)Math.Ceiling(total / (double)limit)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}

