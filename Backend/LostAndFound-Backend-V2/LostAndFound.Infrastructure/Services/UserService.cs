using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace LostAndFound.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly LostAndFoundDbContext _db;

        public UserService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<UserProfileResponseDto?> GetProfileAsync(int userId)
        {
            try
            {
                var user = await _db.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return null;

                return new UserProfileResponseDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    StudentCode = user.StudentCode,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetProfile error: {ex.Message}");
                return null;
            }
        }

        public async Task<UserProfileResponseDto?> UpdateProfileAsync(int userId, UpdateProfileDto updateDto)
        {
            try
            {
                var user = await _db.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return null;

                // Update fields if provided
                if (!string.IsNullOrWhiteSpace(updateDto.FullName))
                {
                    user.FullName = updateDto.FullName;
                }

                if (updateDto.PhoneNumber != null)
                {
                    user.PhoneNumber = updateDto.PhoneNumber;
                }

                user.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return new UserProfileResponseDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    StudentCode = user.StudentCode,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UpdateProfile error: {ex.Message}");
                return null;
            }
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _db.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return false;

                // Verify current password
                bool isValid = BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash);
                if (!isValid)
                    return false;

                // Validate new password
                if (string.IsNullOrWhiteSpace(changePasswordDto.NewPassword) || changePasswordDto.NewPassword.Length < 6)
                    return false;

                // Hash and update password
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ChangePassword error: {ex.Message}");
                return false;
            }
        }
    }
}

