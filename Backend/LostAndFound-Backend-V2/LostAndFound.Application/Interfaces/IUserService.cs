using LostAndFound.Application.DTOs;

namespace LostAndFound.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileResponseDto?> GetProfileAsync(int userId);
    Task<UserProfileResponseDto?> UpdateProfileAsync(int userId, UpdateProfileDto updateDto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
}

