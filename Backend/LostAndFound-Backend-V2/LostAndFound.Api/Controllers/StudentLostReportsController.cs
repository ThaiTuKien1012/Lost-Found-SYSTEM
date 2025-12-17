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
using Microsoft.Extensions.Logging;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/student/lost-reports")]
    [Authorize(Roles = "STUDENT")]
    public class StudentLostReportsController : ControllerBase
    {
        private readonly IStudentLostReportService _service;
        private readonly LostAndFoundDbContext _db;
        private readonly ILogger<StudentLostReportsController> _logger;

        public StudentLostReportsController(
            IStudentLostReportService service, 
            LostAndFoundDbContext db,
            ILogger<StudentLostReportsController> logger)
        {
            _service = service;
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách báo cáo đồ thất lạc của student hiện tại
        /// </summary>
        /// <param name="page">Số trang (mặc định: 1)</param>
        /// <param name="limit">Số lượng item mỗi trang (mặc định: 100)</param>
        /// <returns>Danh sách báo cáo với pagination</returns>
        /// <response code="200">Trả về danh sách báo cáo thành công</response>
        /// <response code="401">Không có quyền truy cập</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
                _logger?.LogError(ex, "Error when getting lost reports for student {StudentId}", studentId);
                return StatusCode(500, new { success = false, error = $"Lỗi server: {ex.Message}" });
            }
        }

        /// <summary>
        /// Tạo báo cáo đồ thất lạc mới
        /// </summary>
        /// <param name="request">Thông tin báo cáo đồ thất lạc</param>
        /// <returns>Báo cáo đã được tạo</returns>
        /// <response code="200">Tạo báo cáo thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="401">Không có quyền truy cập</response>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/student/lost-reports
        ///     {
        ///         "itemName": "Mất điện thoại iPhone 13",
        ///         "description": "Mặt lưng xước, bao da đỏ, mất tại phòng A101",
        ///         "category": "PHONE",
        ///         "color": "Đen",
        ///         "dateLost": "2025-12-01",
        ///         "locationLost": "Phòng A101",
        ///         "campus": "NVH",
        ///         "phone": "0978641257",
        ///         "images": ["/uploads/image1.jpg"]
        ///     }
        /// 
        /// Category values: PHONE, LAPTOP, WALLET, BAG, WATCH, BOOK, KEYS, OTHER
        /// Campus values: NVH (Nam Sài Gòn), SHTP (Saigon Hi-Tech Park)
        /// </remarks>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateReport([FromBody] StudentLostReportCreateRequestDto request)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            // Check if model binding failed
            if (request == null)
            {
                _logger.LogWarning("Request body is null or model binding failed");
                return BadRequest(new { success = false, error = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc." });
            }

            // Log received data for debugging
            _logger.LogInformation("Received lost report request: ItemName={ItemName}, Category={Category}, Campus={Campus}", 
                request.ItemName, request.Category, request.Campus);

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

                _logger.LogInformation("Looking for category: '{CategoryName}' (mapped from '{OriginalCategory}')", categoryName, request.Category);

                // Try exact match first in database
                var category = await _db.ItemCategories
                    .FirstOrDefaultAsync(c => c.Name == categoryName);
                
                // If not found, load all and try case-insensitive comparison in memory
                if (category == null)
                {
                    var allCategories = await _db.ItemCategories.ToListAsync();
                    
                    // Log all categories for debugging
                    _logger.LogInformation("Exact match failed. All categories in DB: {Categories}", 
                        string.Join(" | ", allCategories.Select(c => $"'{c.Name}'")));
                    
                    // Try case-insensitive comparison
                    category = allCategories.FirstOrDefault(c => 
                        string.Equals(c.Name, categoryName, StringComparison.OrdinalIgnoreCase));
                    
                    if (category == null)
                    {
                        // Try with trimmed strings
                        category = allCategories.FirstOrDefault(c => 
                            string.Equals(c.Name.Trim(), categoryName.Trim(), StringComparison.OrdinalIgnoreCase));
                    }
                }
                
                if (category == null)
                {
                    // Get all categories for error message
                    var allCategories = await _db.ItemCategories.Select(c => c.Name).OrderBy(n => n).ToListAsync();
                    _logger.LogWarning("Category '{CategoryName}' not found. Available categories: {AvailableCategories}", 
                        categoryName, string.Join(", ", allCategories));
                    return BadRequest(new { success = false, error = $"Loại đồ vật '{request.Category}' không hợp lệ. Các loại hợp lệ: {string.Join(", ", allCategories)}" });
                }
                
                _logger.LogInformation("Found category: '{CategoryName}' (ID: {CategoryId})", category.Name, category.Id);

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
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error when creating lost report for student {StudentId}", studentId);
                return StatusCode(500, new { success = false, error = $"Lỗi database: {dbEx.InnerException?.Message ?? dbEx.Message}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when creating lost report for student {StudentId}", studentId);
                return StatusCode(500, new { success = false, error = $"Lỗi server: {ex.Message}", details = ex.StackTrace });
            }
        }
    }
}

