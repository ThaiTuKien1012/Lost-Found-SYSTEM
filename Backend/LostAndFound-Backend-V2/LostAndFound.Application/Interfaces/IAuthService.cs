using LostAndFound.Application.DTOs;

namespace LostAndFound.Application.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RequestOtpAsync(RequestOtpDto request);
        Task<bool> SignupAsync(SignupDto signup);
        Task<LoginResponseDto?> LoginAsync(LoginDto login);
        Task<bool> RequestResetPasswordOtpAsync(RequestResetPasswordDto request);
        Task<bool> ResetPasswordAsync(ResetPasswordDto resetPassword);
    }
}

