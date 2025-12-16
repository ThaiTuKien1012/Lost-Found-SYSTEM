using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            var profile = await _userService.GetProfileAsync(userId);
            if (profile == null)
            {
                return NotFound(new { success = false, error = "Không tìm thấy profile" });
            }

            return Ok(new { success = true, data = profile });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            var updatedProfile = await _userService.UpdateProfileAsync(userId, updateDto);
            if (updatedProfile == null)
            {
                return BadRequest(new { success = false, error = "Cập nhật profile thất bại" });
            }

            return Ok(new { success = true, data = updatedProfile, message = "Cập nhật profile thành công" });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { success = false, error = "Không tìm thấy thông tin user" });
            }

            if (string.IsNullOrWhiteSpace(changePasswordDto.CurrentPassword))
            {
                return BadRequest(new { success = false, error = "Mật khẩu hiện tại là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(changePasswordDto.NewPassword))
            {
                return BadRequest(new { success = false, error = "Mật khẩu mới là bắt buộc" });
            }

            if (changePasswordDto.NewPassword.Length < 6)
            {
                return BadRequest(new { success = false, error = "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }

            var result = await _userService.ChangePasswordAsync(userId, changePasswordDto);
            if (!result)
            {
                return BadRequest(new { success = false, error = "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra" });
            }

            return Ok(new { success = true, message = "Đổi mật khẩu thành công" });
        }
    }
}

