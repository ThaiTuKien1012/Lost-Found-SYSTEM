using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/student/claims")]
    [Authorize(Roles = "STUDENT")]
    public class StudentClaimsController : ControllerBase
    {
        private readonly IStudentClaimService _service;

        public StudentClaimsController(IStudentClaimService service)
        {
            _service = service;
        }

        /// <summary>
        /// Tạo claim mới cho đồ nhặt được
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateClaim([FromBody] StudentClaimCreateDto dto)
        {
            // ✅ Lấy StudentId từ JWT token
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin user" });
            }

            // ✅ Validation
            if (dto.FoundItemId <= 0)
            {
                return BadRequest(new { message = "FoundItemId là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(dto.Description))
            {
                return BadRequest(new { message = "Description là bắt buộc" });
            }

            if (dto.Description.Length > 1000)
            {
                return BadRequest(new { message = "Description không được vượt quá 1000 ký tự" });
            }

            try
            {
                var created = await _service.CreateClaimAsync(studentId, dto);
                return CreatedAtAction(nameof(GetClaimById), new { id = created.Id }, new { data = created });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo claim", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách claims của student hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyClaims()
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin user" });
            }

            var claims = await _service.GetMyClaimsAsync(studentId);
            return Ok(new { data = claims, total = claims.Count() });
        }

        /// <summary>
        /// Lấy chi tiết claim theo ID
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetClaimById(int id)
        {
            var claim = await _service.GetClaimByIdAsync(id);
            if (claim == null)
            {
                return NotFound(new { message = "Không tìm thấy claim" });
            }

            // ✅ Kiểm tra quyền: chỉ student owner được xem
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin user" });
            }

            if (claim.StudentId != studentId)
            {
                return Forbid();
            }

            return Ok(new { data = claim });
        }

        /// <summary>
        /// Hủy claim (chỉ khi status = PENDING)
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> CancelClaim(int id)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin user" });
            }

            try
            {
                var result = await _service.CancelClaimAsync(id, studentId);
                if (!result)
                {
                    return NotFound(new { message = "Không tìm thấy claim hoặc bạn không có quyền hủy" });
                }

                return Ok(new { message = "Hủy claim thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi hủy claim", error = ex.Message });
            }
        }

        /// <summary>
        /// Kiểm tra đồ có sẵn để claim không
        /// </summary>
        [HttpGet("check-availability/{foundItemId:int}")]
        public async Task<IActionResult> CheckAvailability(int foundItemId)
        {
            var isAvailable = await _service.CheckItemAvailabilityAsync(foundItemId);
            return Ok(new { foundItemId, isAvailable });
        }
    }
}