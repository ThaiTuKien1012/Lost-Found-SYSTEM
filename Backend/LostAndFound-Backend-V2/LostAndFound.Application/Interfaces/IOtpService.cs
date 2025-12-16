using LostAndFound.Domain.Entities;

namespace LostAndFound.Application.Interfaces
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(string email, string purpose = "SIGNUP");
        Task<bool> VerifyOtpAsync(string email, string otpCode, string purpose = "SIGNUP");
        Task MarkOtpAsUsedAsync(string email, string otpCode, string? purpose = null);
    }
}

