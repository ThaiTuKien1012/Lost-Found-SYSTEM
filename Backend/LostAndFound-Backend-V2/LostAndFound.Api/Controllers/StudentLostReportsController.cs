using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Linq;
using System;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/student/lost-reports")]
    [Authorize(Roles = "STUDENT")]
    public class StudentLostReportsController : ControllerBase
    {
        private readonly IStudentLostReportService _service;

        public StudentLostReportsController(IStudentLostReportService service)
        {
            _service = service;
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
    }
}

