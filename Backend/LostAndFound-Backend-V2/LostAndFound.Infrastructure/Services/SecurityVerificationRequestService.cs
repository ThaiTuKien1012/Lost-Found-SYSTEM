using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Infrastructure.Services
{
    public class SecurityVerificationRequestService : ISecurityVerificationRequestService
    {
        private readonly LostAndFoundDbContext _db;

        public SecurityVerificationRequestService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<SecurityVerificationRequests>> GetAllAsync()
        {
            return await _db.SecurityVerificationRequests.AsNoTracking().ToListAsync();
        }

        public async Task<SecurityVerificationRequests?> GetByIdAsync(int id)
        {
            return await _db.SecurityVerificationRequests.FindAsync(id);
        }

        public async Task<SecurityVerificationRequests> CreateAsync(SecurityVerificationRequests request)
        {
            request.CreatedAt = DateTime.UtcNow;
            request.UpdatedAt = DateTime.UtcNow;
            request.Status = "PENDING";
            _db.SecurityVerificationRequests.Add(request);
            await _db.SaveChangesAsync();
            return request;
        }

        public async Task<SecurityVerificationRequests?> UpdateStatusAsync(int id, string status)
        {
            var request = await _db.SecurityVerificationRequests.FindAsync(id);
            if (request == null) return null;

            request.Status = status;
            request.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return request;
        }
    }
}