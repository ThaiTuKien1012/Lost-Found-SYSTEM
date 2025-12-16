using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace LostAndFound.Infrastructure.Services
{
    public class OtpService : IOtpService
    {
        private readonly LostAndFoundDbContext _db;
        private const int OTP_LENGTH = 6;
        private const int OTP_EXPIRY_MINUTES = 10;

        public OtpService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<string> GenerateOtpAsync(string email, string purpose = "SIGNUP")
        {
            var normalizedEmail = email.ToLower().Trim();

            // Đánh dấu các OTP cũ cùng email/purpose là đã dùng (chỉ giữ OTP mới nhất)
            var oldOtps = await _db.EmailOtp
                .Where(o => o.Email == normalizedEmail 
                    && o.Purpose == purpose 
                    && o.IsUsed == false)
                .ToListAsync();

            foreach (var oldOtp in oldOtps)
            {
                oldOtp.IsUsed = true; // Vô hiệu hóa OTP cũ
            }

            // Tạo OTP 6 số mới
            var random = new Random();
            var otpCode = random.Next(100000, 999999).ToString();

            // Lưu OTP mới vào DB
            var otp = new EmailOtp
            {
                Email = normalizedEmail,
                OtpCode = otpCode,
                Purpose = purpose,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(OTP_EXPIRY_MINUTES),
                IsUsed = false
            };

            _db.EmailOtp.Add(otp);
            await _db.SaveChangesAsync();

            return otpCode;
        }

        public async Task<bool> VerifyOtpAsync(string email, string otpCode, string purpose = "SIGNUP")
        {
            var normalizedEmail = email.ToLower().Trim();

            var otp = await _db.EmailOtp
                .Where(o => o.Email == normalizedEmail 
                    && o.OtpCode == otpCode 
                    && o.Purpose == purpose
                    && o.IsUsed == false
                    && o.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            return otp != null;
        }

        public async Task MarkOtpAsUsedAsync(string email, string otpCode, string? purpose = null)
        {
            var normalizedEmail = email.ToLower().Trim();

            var query = _db.EmailOtp
                .Where(o => o.Email == normalizedEmail 
                    && o.OtpCode == otpCode
                    && o.IsUsed == false);

            // Nếu có purpose, filter theo purpose
            if (!string.IsNullOrEmpty(purpose))
            {
                query = query.Where(o => o.Purpose == purpose);
            }

            var otp = await query
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp != null)
            {
                otp.IsUsed = true;
                await _db.SaveChangesAsync();
            }
        }
    }
}

