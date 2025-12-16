using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;

namespace LostAndFound.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly LostAndFoundDbContext _db;
        private readonly IOtpService _otpService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthService(
            LostAndFoundDbContext db,
            IOtpService otpService,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _db = db;
            _otpService = otpService;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<bool> RequestOtpAsync(RequestOtpDto request)
        {
            try
            {
                // Kiểm tra email đã tồn tại chưa
                var existingUser = await _db.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());

                if (existingUser != null)
                {
                    return false; // Email đã được sử dụng
                }

                // Tạo và gửi OTP
                var otpCode = await _otpService.GenerateOtpAsync(request.Email, "SIGNUP");
                await _emailService.SendOtpEmailAsync(request.Email, otpCode);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> SignupAsync(SignupDto signup)
        {
            try
            {
                // Kiểm tra email đã tồn tại
                var existingUser = await _db.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == signup.Email.ToLower().Trim());

                if (existingUser != null)
                {
                    return false; // Email đã được sử dụng
                }

                // Verify OTP
                var isValidOtp = await _otpService.VerifyOtpAsync(signup.Email, signup.Otp, "SIGNUP");
                if (!isValidOtp)
                {
                    return false; // OTP không hợp lệ
                }

                // Xác định role (mặc định STUDENT nếu null hoặc rỗng)
                var role = string.IsNullOrWhiteSpace(signup.Role) 
                    ? "STUDENT" 
                    : signup.Role.ToUpper();

                // Chỉ cho phép STUDENT, STAFF, SECURITY
                if (role != "STUDENT" && role != "STAFF" && role != "SECURITY")
                {
                    role = "STUDENT";
                }

                // Hash password
                var passwordHash = HashPassword(signup.Password);

                // Tạo user mới
                var newUser = new Users
                {
                    Email = signup.Email.ToLower().Trim(),
                    FullName = signup.FullName.Trim(),
                    PasswordHash = passwordHash,
                    Role = role,
                    StudentCode = signup.StudentCode?.Trim(),
                    PhoneNumber = signup.PhoneNumber?.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.Users.Add(newUser);
                await _db.SaveChangesAsync();

                // Đánh dấu OTP đã sử dụng
                await _otpService.MarkOtpAsUsedAsync(signup.Email, signup.Otp, "SIGNUP");

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto login)
        {
            try
            {
                var normalizedEmail = login.Email.ToLower().Trim();

                // Tìm user theo email
                var user = await _db.Users
                    .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

                if (user == null)
                {
                    return null; // Email không tồn tại
                }

                // Verify password using BCrypt
                try
                {
                    bool isValid = BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash);
                    if (!isValid)
                    {
                        return null; // Password sai
                    }
                }
                catch (Exception ex)
                {
                    // Log error for debugging
                    Console.WriteLine($"BCrypt verification error: {ex.Message}");
                    return null;
                }

                // Tạo JWT token
                var token = GenerateJwtToken(user);

                // Trả về response với token và user info
                return new LoginResponseDto
                {
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        FullName = user.FullName,
                        Email = user.Email,
                        Role = user.Role,
                        StudentCode = user.StudentCode,
                        PhoneNumber = user.PhoneNumber
                    }
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                return null;
            }
        }

        private string HashPassword(string password)
        {
            // Use BCrypt for password hashing (matches database format)
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private string GenerateJwtToken(Users user)
        {
            var secretKey = _configuration["JWT:Secret"]
                ?? throw new InvalidOperationException("JWT Secret is not configured");
            var issuer = _configuration["JWT:ValidIssuer"] ?? "https://localhost:7259/";
            var audience = _configuration["JWT:ValidAudience"] ?? "https://localhost:7259";
            var expiryMinutes = 60; // Default 60 minutes

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("student_code", user.StudentCode ?? string.Empty)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> RequestResetPasswordOtpAsync(RequestResetPasswordDto request)
        {
            try
            {
                var normalizedEmail = request.Email.ToLower().Trim();

                // Kiểm tra email có tồn tại trong hệ thống
                var user = await _db.Users
                    .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

                if (user == null)
                {
                    return false; // Email không tồn tại
                }

                // Tạo và gửi OTP với purpose RESET_PASSWORD
                var otpCode = await _otpService.GenerateOtpAsync(request.Email, "RESET_PASSWORD");
                await _emailService.SendResetPasswordOtpEmailAsync(request.Email, otpCode);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPassword)
        {
            try
            {
                var normalizedEmail = resetPassword.Email.ToLower().Trim();

                // Validate mật khẩu mới trước
                if (string.IsNullOrWhiteSpace(resetPassword.NewPassword) || resetPassword.NewPassword.Length < 6)
                {
                    return false; // Mật khẩu mới phải có ít nhất 6 ký tự
                }

                // Tìm user theo email
                var user = await _db.Users
                    .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

                if (user == null)
                {
                    return false; // Email không tồn tại
                }

                // Verify OTP với purpose RESET_PASSWORD
                var isValidOtp = await _otpService.VerifyOtpAsync(normalizedEmail, resetPassword.Otp, "RESET_PASSWORD");
                if (!isValidOtp)
                {
                    return false; // OTP không hợp lệ hoặc đã hết hạn
                }

                // Cập nhật mật khẩu mới
                user.PasswordHash = HashPassword(resetPassword.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                // Đánh dấu OTP đã sử dụng (với purpose để chính xác hơn)
                await _otpService.MarkOtpAsUsedAsync(normalizedEmail, resetPassword.Otp, "RESET_PASSWORD");

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}

