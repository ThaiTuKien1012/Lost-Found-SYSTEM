using LostAndFound.Application.DTOs;
using LostAndFound.Domain.Entities;

namespace LostAndFound.Application.Interfaces
{
    public interface ISecurityService
    {
        Task<SecurityReceivedItems?> CreateFoundItemAsync(CreateSecurityFoundItemDto dto, int securityId, string? imageUrl);
        Task<SecurityReceivedItems?> GetFoundItemByIdAsync(int id);
        Task<List<SecurityReceivedItems>> GetFoundItemsByStatusAsync(string status);
        Task<List<SecurityReceivedItems>> GetMyFoundItemsAsync(int securityId);
    }
}

