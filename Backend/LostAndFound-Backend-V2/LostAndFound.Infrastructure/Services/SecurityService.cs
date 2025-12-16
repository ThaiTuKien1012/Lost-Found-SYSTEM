using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class SecurityService : ISecurityService
    {
        private readonly LostAndFoundDbContext _db;

        public SecurityService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<SecurityReceivedItems?> CreateFoundItemAsync(CreateSecurityFoundItemDto dto, int securityId, string? imageUrl)
        {
            try
            {
                // Validate Campus exists
                var campusExists = await _db.Campus.AnyAsync(c => c.Id == dto.CampusId);
                if (!campusExists)
                {
                    return null;
                }

                // Validate ItemCategory exists
                var categoryExists = await _db.ItemCategories.AnyAsync(c => c.Id == dto.ItemCategoryId);
                if (!categoryExists)
                {
                    return null;
                }

                // Validate Security user exists and has SECURITY role
                var securityUser = await _db.Users
                    .FirstOrDefaultAsync(u => u.Id == securityId && u.Role == "SECURITY");
                if (securityUser == null)
                {
                    return null;
                }

                // Create new SecurityReceivedItems
                var foundItem = new SecurityReceivedItems
                {
                    CampusId = dto.CampusId,
                    ItemCategoryId = dto.ItemCategoryId,
                    SecurityId = securityId,
                    Description = dto.Description,
                    FoundTime = dto.FoundTime,
                    FoundLocation = dto.FoundLocation,
                    Status = "AtSecurity",
                    ImageUrl = imageUrl,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.SecurityReceivedItems.Add(foundItem);
                await _db.SaveChangesAsync();

                // Load navigation properties
                await _db.Entry(foundItem)
                    .Reference(s => s.Campus)
                    .LoadAsync();
                await _db.Entry(foundItem)
                    .Reference(s => s.ItemCategory)
                    .LoadAsync();
                await _db.Entry(foundItem)
                    .Reference(s => s.Security)
                    .LoadAsync();

                return foundItem;
            }
            catch
            {
                return null;
            }
        }

        public async Task<SecurityReceivedItems?> GetFoundItemByIdAsync(int id)
        {
            try
            {
                var item = await _db.SecurityReceivedItems
                    .Include(s => s.Campus)
                    .Include(s => s.ItemCategory)
                    .Include(s => s.Security)
                    .FirstOrDefaultAsync(s => s.Id == id);

                return item;
            }
            catch
            {
                return null;
            }
        }

        public async Task<List<SecurityReceivedItems>> GetFoundItemsByStatusAsync(string status)
        {
            try
            {
                var items = await _db.SecurityReceivedItems
                    .Include(s => s.Campus)
                    .Include(s => s.ItemCategory)
                    .Include(s => s.Security)
                    .Where(s => s.Status == status)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                return items;
            }
            catch
            {
                return new List<SecurityReceivedItems>();
            }
        }

        public async Task<List<SecurityReceivedItems>> GetMyFoundItemsAsync(int securityId)
        {
            try
            {
                var items = await _db.SecurityReceivedItems
                    .Include(s => s.Campus)
                    .Include(s => s.ItemCategory)
                    .Include(s => s.Security)
                    .Where(s => s.SecurityId == securityId)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                return items;
            }
            catch
            {
                return new List<SecurityReceivedItems>();
            }
        }
    }
}

