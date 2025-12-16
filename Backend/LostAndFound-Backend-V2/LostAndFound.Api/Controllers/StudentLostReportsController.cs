using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;
using System;
using System.Collections.Generic;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/student/lost-reports")]
    [Authorize(Roles = "STUDENT")]
    public class StudentLostReportsController : ControllerBase
    {
        private readonly IStudentLostReportService _service;
        private readonly LostAndFoundDbContext _db;

        public StudentLostReportsController(IStudentLostReportService service, LostAndFoundDbContext db)
        {
            _service = service;
            _db = db;
        }

        // GET api/student/lost-reports
        [HttpGet]
        public async Task<IActionResult> GetMyReports([FromQuery] int page = 1, [FromQuery] int limit = 100)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            try
            {
                var reports = await _service.GetByStudentIdAsync(studentId);
                var reportsList = reports.ToList();
                
                // Pagination
                var total = reportsList.Count;
                var skip = (page - 1) * limit;
                var pagedReports = reportsList.Skip(skip).Take(limit).ToList();

                return Ok(new
                {
                    success = true,
                    data = pagedReports,
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

        // POST api/student/lost-reports
        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] StudentLostReportCreateRequestDto request)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            try
            {
                // Validation
                if (string.IsNullOrWhiteSpace(request.ItemName))
                {
                    return BadRequest(new { success = false, error = "Tên đồ vật là bắt buộc" });
                }

                if (string.IsNullOrWhiteSpace(request.Description))
                {
                    return BadRequest(new { success = false, error = "Mô tả là bắt buộc" });
                }

                if (string.IsNullOrWhiteSpace(request.Category))
                {
                    return BadRequest(new { success = false, error = "Loại đồ vật là bắt buộc" });
                }

                if (string.IsNullOrWhiteSpace(request.Campus))
                {
                    return BadRequest(new { success = false, error = "Campus là bắt buộc" });
                }

                // Map category code to ItemCategoryId
                // Frontend gửi: PHONE, LAPTOP, WALLET, etc.
                // Database lưu: "Điện thoại", "Laptop", "Ví/Bóp", etc.
                var categoryMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    { "PHONE", "Điện thoại" },
                    { "LAPTOP", "Laptop" },
                    { "WALLET", "Ví/Bóp" },
                    { "BAG", "Túi xách" },
                    { "WATCH", "Đồng hồ" },
                    { "BOOK", "Sách" },
                    { "KEYS", "Chìa khóa" },
                    { "OTHER", "Khác" }
                };

                string categoryName = categoryMapping.ContainsKey(request.Category.ToUpper()) 
                    ? categoryMapping[request.Category.ToUpper()] 
                    : request.Category;

                var category = await _db.ItemCategories
                    .FirstOrDefaultAsync(c => c.Name == categoryName);
                
                if (category == null)
                {
                    return BadRequest(new { success = false, error = $"Loại đồ vật '{request.Category}' không hợp lệ" });
                }

                // Map campus code to CampusId
                var campus = await _db.Campus
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == request.Campus.ToUpper());
                
                if (campus == null)
                {
                    return BadRequest(new { success = false, error = $"Campus '{request.Campus}' không hợp lệ" });
                }

                // Get first image URL if exists
                string? imageUrl = null;
                if (request.Images != null && request.Images.Count > 0)
                {
                    imageUrl = request.Images[0]; // Lấy ảnh đầu tiên
                }

                // Create DTO for service
                var createDto = new StudentLostReportCreateDto
                {
                    CampusId = campus.Id,
                    ItemCategoryId = category.Id,
                    Title = request.ItemName.Trim(),
                    Description = request.Description.Trim(),
                    LostTime = request.DateLost,
                    LostLocation = request.LocationLost?.Trim(),
                    ImageUrl = imageUrl
                };

                // Create report
                var result = await _service.CreateFromDtoAsync(studentId, createDto);

                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Tạo báo cáo thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}

