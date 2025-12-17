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

        /// <summary>
        /// Lấy thông tin profile của user hiện tại
        /// </summary>
        /// <returns>Thông tin profile của user</returns>
        /// <response code="200">Trả về profile thành công</response>
        /// <response code="401">Không có quyền truy cập</response>
        /// <response code="404">Không tìm thấy profile</response>
        [HttpGet("profile")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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

        /// <summary>
        /// Cập nhật thông tin profile của user hiện tại
        /// </summary>
        /// <param name="updateDto">Thông tin cập nhật (FullName, PhoneNumber)</param>
        /// <returns>Profile đã được cập nhật</returns>
        /// <response code="200">Cập nhật profile thành công</response>
        /// <response code="400">Dữ liệu không hợp lệ</response>
        /// <response code="401">Không có quyền truy cập</response>
        [HttpPut("profile")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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

        /// <summary>
        /// Đổi mật khẩu của user hiện tại
        /// </summary>
        /// <param name="changePasswordDto">Thông tin đổi mật khẩu (CurrentPassword, NewPassword)</param>
        /// <returns>Kết quả đổi mật khẩu</returns>
        /// <response code="200">Đổi mật khẩu thành công</response>
        /// <response code="400">Mật khẩu hiện tại không đúng hoặc mật khẩu mới không hợp lệ</response>
        /// <response code="401">Không có quyền truy cập</response>
        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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

