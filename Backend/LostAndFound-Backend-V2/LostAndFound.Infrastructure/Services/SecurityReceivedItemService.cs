using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Infrastructure.Services
{
    public class SecurityReceivedItemService : ISecurityReceivedItemService
    {
        private readonly LostAndFoundDbContext _db;

        public SecurityReceivedItemService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<SecurityReceivedItems>> GetAllAsync()
        {
            return await _db.SecurityReceivedItems.AsNoTracking().ToListAsync();
        }

        public async Task<SecurityReceivedItems?> GetByIdAsync(int id)
        {
            return await _db.SecurityReceivedItems.FindAsync(id);
        }

        public async Task<SecurityReceivedItems> CreateAsync(SecurityReceivedItems item)
        {
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            item.Status = "PENDING";
            _db.SecurityReceivedItems.Add(item);
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<SecurityReceivedItems?> UpdateStatusAsync(int id, string status)
        {
            var item = await _db.SecurityReceivedItems.FindAsync(id);
            if (item == null) return null;

            item.Status = status;
            item.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return item;
        }
    }
}