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

        /// <summary>
        /// Lấy danh sách giao dịch nhận lại đồ của student hiện tại
        /// </summary>
        /// <param name="page">Số trang (mặc định: 1)</param>
        /// <param name="limit">Số lượng item mỗi trang (mặc định: 100)</param>
        /// <returns>Danh sách giao dịch với pagination</returns>
        /// <response code="200">Trả về danh sách giao dịch thành công</response>
        /// <response code="401">Không có quyền truy cập</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyTransactions([FromQuery] int page = 1, [FromQuery] int limit = 100)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            try
            {
                var receipts = await _db.StaffReturnReceipts
                    .AsNoTracking()
                    .Where(r => r.StudentId == studentId)
                    .Include(r => r.Claim)
                    .Include(r => r.FoundItem)
                        .ThenInclude(fi => fi.ItemCategory)
                    .Include(r => r.FoundItem)
                        .ThenInclude(fi => fi.Campus)
                    .Include(r => r.Staff)
                    .OrderByDescending(r => r.ReturnedAt ?? r.Claim.CreatedAt)
                    .ToListAsync();

                // Pagination
                var total = receipts.Count;
                var skip = (page - 1) * limit;
                var pagedReceipts = receipts.Skip(skip).Take(limit).ToList();

                var transactions = pagedReceipts.Select(r => new
                {
                    transactionId = r.Id.ToString(),
                    claimId = r.ClaimId,
                    foundItemId = r.FoundItemId,
                    returnedDate = r.ReturnedAt,
                    campus = r.FoundItem.Campus?.Name ?? "",
                    status = r.ReturnedAt != null ? "completed" : "pending",
                    verificationMethod = (string?)null, // Có thể thêm sau nếu cần
                    photo = (string?)null, // Có thể thêm sau nếu cần
                    items = new object[] { }, // Có thể thêm sau nếu cần
                    foundItem = new
                    {
                        _id = r.FoundItem.Id,
                        itemName = r.FoundItem.Description ?? r.FoundItem.ItemCategory?.Name ?? "Vật dụng",
                        category = r.FoundItem.ItemCategory?.Name ?? "",
                        images = !string.IsNullOrEmpty(r.FoundItem.ImageUrl) 
                            ? new[] { r.FoundItem.ImageUrl } 
                            : new string[] { },
                        condition = (string?)null, // Có thể thêm vào database sau nếu cần
                        color = (string?)null, // Có thể thêm vào database sau nếu cần
                        description = r.FoundItem.Description,
                        foundLocation = r.FoundItem.FoundLocation,
                        foundTime = r.FoundItem.FoundTime,
                        status = r.FoundItem.Status,
                        storageLocation = r.FoundItem.StorageLocation
                    },
                    staffName = r.Staff.FullName,
                    confirmedFullName = r.ConfirmedFullName,
                    documentNumber = r.DocumentNumber,
                    phoneNumber = r.PhoneNumber,
                    createdAt = r.Claim.CreatedAt
                }).ToList();

                return Ok(new
                {
                    success = true,
                    data = transactions,
                    pagination = new
                    {
                        page,
                        limit,
                        total,
                        pages = (int)Math.Ceiling(total / (double)limit)
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

