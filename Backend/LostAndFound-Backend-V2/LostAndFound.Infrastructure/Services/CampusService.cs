using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Infrastructure.Services
{
    public class CampusService : ICampusService
    {
        private readonly LostAndFoundDbContext _db;

        public CampusService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Campus>> GetAllAsync()
        {
            return await _db.Campus.AsNoTracking().ToListAsync();
        }

        public async Task<Campus?> GetByIdAsync(int id)
        {
            return await _db.Campus.FindAsync(id);
        }

        public async Task<Campus> CreateAsync(Campus campus)
        {
            _db.Campus.Add(campus);
            await _db.SaveChangesAsync();
            return campus;
        }

        public async Task<Campus?> UpdateAsync(int id, Campus campus)
        {
            var existing = await _db.Campus.FindAsync(id);
            if (existing == null) return null;

            _db.Entry(existing).CurrentValues.SetValues(campus);
            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var campus = await _db.Campus.FindAsync(id);
            if (campus == null) return false;

            _db.Campus.Remove(campus);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}