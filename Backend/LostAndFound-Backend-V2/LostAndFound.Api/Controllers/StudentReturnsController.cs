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
                // Use a single query with proper Select to avoid Include issues
                var receiptsQuery = _db.StaffReturnReceipts
                    .AsNoTracking()
                    .Where(r => r.StudentId == studentId)
                    .Select(r => new
                    {
                        r.Id,
                        r.ClaimId,
                        r.FoundItemId,
                        r.ReturnedAt,
                        r.ConfirmedFullName,
                        r.DocumentNumber,
                        r.PhoneNumber,
                        ClaimCreatedAt = r.Claim.CreatedAt,
                        StaffName = r.Staff.FullName,
                        FoundItemDescription = r.FoundItem.Description,
                        FoundItemImageUrl = r.FoundItem.ImageUrl,
                        FoundItemFoundLocation = r.FoundItem.FoundLocation,
                        FoundItemFoundTime = r.FoundItem.FoundTime,
                        FoundItemStatus = r.FoundItem.Status,
                        FoundItemStorageLocation = r.FoundItem.StorageLocation,
                        CategoryName = r.FoundItem.ItemCategory.Name,
                        CampusName = r.FoundItem.Campus.Name
                    })
                    .OrderByDescending(r => r.ReturnedAt ?? r.ClaimCreatedAt);

                // Get total count
                var total = await receiptsQuery.CountAsync();

                // Apply pagination
                var pagedData = await receiptsQuery
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                var receipts = pagedData;

                var transactions = receipts.Select(r => new
                {
                    transactionId = r.Id.ToString(),
                    claimId = r.ClaimId,
                    foundItemId = r.FoundItemId,
                    returnedDate = r.ReturnedAt,
                    campus = r.CampusName ?? "",
                    status = r.ReturnedAt != null ? "completed" : "pending",
                    verificationMethod = (string?)null, // Có thể thêm sau nếu cần
                    photo = (string?)null, // Có thể thêm sau nếu cần
                    items = new object[] { }, // Có thể thêm sau nếu cần
                    foundItem = new
                    {
                        _id = r.FoundItemId,
                        itemName = r.FoundItemDescription ?? r.CategoryName ?? "Vật dụng",
                        category = r.CategoryName ?? "",
                        images = !string.IsNullOrEmpty(r.FoundItemImageUrl) 
                            ? new[] { r.FoundItemImageUrl } 
                            : new string[] { },
                        condition = (string?)null, // Có thể thêm vào database sau nếu cần
                        color = (string?)null, // Có thể thêm vào database sau nếu cần
                        description = r.FoundItemDescription,
                        foundLocation = r.FoundItemFoundLocation,
                        foundTime = r.FoundItemFoundTime,
                        status = r.FoundItemStatus,
                        storageLocation = r.FoundItemStorageLocation
                    },
                    staffName = r.StaffName ?? "",
                    confirmedFullName = r.ConfirmedFullName,
                    documentNumber = r.DocumentNumber,
                    phoneNumber = r.PhoneNumber,
                    createdAt = r.ClaimCreatedAt
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

