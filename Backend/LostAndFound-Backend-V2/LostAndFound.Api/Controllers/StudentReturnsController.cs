using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;
using System;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/student/returns")]
    [Authorize(Roles = "STUDENT")]
    public class StudentReturnsController : ControllerBase
    {
        private readonly LostAndFoundDbContext _db;

        public StudentReturnsController(LostAndFoundDbContext db)
        {
            _db = db;
        }

        // GET api/student/returns
        [HttpGet]
        public async Task<IActionResult> GetMyTransactions([FromQuery] int page = 1, [FromQuery] int limit = 100)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            try
            {
                var transactions = await _db.StaffReturnReceipts
                    .AsNoTracking()
                    .Where(r => r.StudentId == studentId)
                    .Include(r => r.Claim)
                    .Include(r => r.FoundItem)
                    .Include(r => r.Staff)
                    .OrderByDescending(r => r.ReturnedAt ?? r.Claim.CreatedAt)
                    .Select(r => new
                    {
                        id = r.Id,
                        claimId = r.ClaimId,
                        foundItemId = r.FoundItemId,
                        foundItemName = r.FoundItem.Description ?? r.FoundItem.ItemCategory.Name,
                        staffName = r.Staff.FullName,
                        confirmedFullName = r.ConfirmedFullName,
                        documentNumber = r.DocumentNumber,
                        phoneNumber = r.PhoneNumber,
                        returnedAt = r.ReturnedAt,
                        status = r.ReturnedAt != null ? "completed" : "pending",
                        createdAt = r.Claim.CreatedAt
                    })
                    .ToListAsync();

                // Pagination
                var total = transactions.Count;
                var skip = (page - 1) * limit;
                var pagedTransactions = transactions.Skip(skip).Take(limit).ToList();

                return Ok(new
                {
                    success = true,
                    data = pagedTransactions,
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

