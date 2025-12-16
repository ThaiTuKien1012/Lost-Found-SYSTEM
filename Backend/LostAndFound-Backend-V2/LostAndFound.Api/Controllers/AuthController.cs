using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email là bắt buộc" });
            }

            var result = await _authService.RequestOtpAsync(request);
            
            if (!result)
            {
                return BadRequest(new { message = "Email đã được sử dụng hoặc có lỗi xảy ra" });
            }

            return Ok(new { message = "OTP đã được gửi đến email của bạn" });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupDto signup)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(signup.Email))
            {
                return BadRequest(new { message = "Email là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(signup.Otp))
            {
                return BadRequest(new { message = "OTP là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(signup.FullName))
            {
                return BadRequest(new { message = "Họ tên là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(signup.Password))
            {
                return BadRequest(new { message = "Mật khẩu là bắt buộc" });
            }

            if (signup.Password.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu phải có ít nhất 6 ký tự" });
            }

            var result = await _authService.SignupAsync(signup);

            if (!result)
            {
                return BadRequest(new { message = "OTP không hợp lệ, email đã được sử dụng hoặc có lỗi xảy ra" });
            }

            return Ok(new { message = "Đăng ký tài khoản thành công" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            if (string.IsNullOrWhiteSpace(login.Email))
            {
                return BadRequest(new { success = false, error = "Email là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(login.Password))
            {
                return BadRequest(new { success = false, error = "Mật khẩu là bắt buộc" });
            }

            var result = await _authService.LoginAsync(login);

            if (result == null)
            {
                return Unauthorized(new { success = false, error = "Email hoặc mật khẩu không đúng" });
            }

            return Ok(new 
            { 
                success = true,
                data = new
                {
                    tokens = new
                    {
                        accessToken = result.Token,
                        refreshToken = result.Token // Tạm thời dùng accessToken, có thể thêm refreshToken sau
                    },
                    user = result.User
                },
                message = "Đăng nhập thành công"
            });
        }

        [HttpPost("request-reset-password")]
        public async Task<IActionResult> RequestResetPassword([FromBody] RequestResetPasswordDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email là bắt buộc" });
            }

            var result = await _authService.RequestResetPasswordOtpAsync(request);

            if (!result)
            {
                return BadRequest(new { message = "Email không tồn tại hoặc có lỗi xảy ra" });
            }

            return Ok(new { message = "OTP đặt lại mật khẩu đã được gửi đến email của bạn" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPassword)
        {
            if (string.IsNullOrWhiteSpace(resetPassword.Email))
            {
                return BadRequest(new { message = "Email là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(resetPassword.Otp))
            {
                return BadRequest(new { message = "OTP là bắt buộc" });
            }

            if (string.IsNullOrWhiteSpace(resetPassword.NewPassword))
            {
                return BadRequest(new { message = "Mật khẩu mới là bắt buộc" });
            }

            if (resetPassword.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }

            var result = await _authService.ResetPasswordAsync(resetPassword);

            if (!result)
            {
                return BadRequest(new { message = "OTP không hợp lệ, đã hết hạn, email không tồn tại hoặc có lỗi xảy ra. Vui lòng kiểm tra lại email và OTP." });
            }

            return Ok(new { message = "Đặt lại mật khẩu thành công" });
        }
    }
}

