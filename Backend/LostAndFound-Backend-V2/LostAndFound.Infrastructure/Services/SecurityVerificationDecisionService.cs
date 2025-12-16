using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Infrastructure.Services
{
    public class SecurityVerificationDecisionService : ISecurityVerificationDecisionService
    {
        private readonly LostAndFoundDbContext _db;

        public SecurityVerificationDecisionService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<SecurityVerificationDecisions>> GetAllAsync()
        {
            return await _db.SecurityVerificationDecisions.AsNoTracking().ToListAsync();
        }

        public async Task<SecurityVerificationDecisions?> GetByIdAsync(int id)
        {
            return await _db.SecurityVerificationDecisions.FindAsync(id);
        }

        public async Task<SecurityVerificationDecisions> CreateAsync(SecurityVerificationDecisions decision)
        {
            decision.CreatedAt = DateTime.UtcNow;
            _db.SecurityVerificationDecisions.Add(decision);
            await _db.SaveChangesAsync();
            return decision;
        }

        public async Task<SecurityVerificationDecisions?> UpdateAsync(int id, SecurityVerificationDecisions decision)
        {
            var existing = await _db.SecurityVerificationDecisions.FindAsync(id);
            if (existing == null) return null;

            _db.Entry(existing).CurrentValues.SetValues(decision);
            await _db.SaveChangesAsync();
            return existing;
        }
    }
}
