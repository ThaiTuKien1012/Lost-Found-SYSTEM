using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Infrastructure.Services
{
    public class StaffReturnReceiptService : IStaffReturnReceiptService
    {
        private readonly LostAndFoundDbContext _db;

        public StaffReturnReceiptService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<StaffReturnReceipts>> GetAllAsync()
        {
            return await _db.StaffReturnReceipts.AsNoTracking().ToListAsync();
        }

        public async Task<StaffReturnReceipts?> GetByIdAsync(int id)
        {
            return await _db.StaffReturnReceipts.FindAsync(id);
        }

        public async Task<StaffReturnReceipts> CreateAsync(StaffReturnReceipts receipt)
        {
            _db.StaffReturnReceipts.Add(receipt);
            await _db.SaveChangesAsync();
            return receipt;
        }

        public async Task<StaffReturnReceipts?> UpdateAsync(int id, StaffReturnReceipts receipt)
        {
            var existing = await _db.StaffReturnReceipts.FindAsync(id);
            if (existing == null) return null;

            _db.Entry(existing).CurrentValues.SetValues(receipt);
            await _db.SaveChangesAsync();
            return existing;
        }
    }
}