using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class StaffLostReportReadService : IStaffLostReportReadService
    {
        private readonly LostAndFoundDbContext _db;

        public StaffLostReportReadService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IList<StudentLostReports>> GetListAsync(int? campusId, int? itemCategoryId)
        {
            var query = _db.StudentLostReports
                .Include(x => x.Campus)
                .Include(x => x.ItemCategory)
                .Include(x => x.Student)
                .AsQueryable();

            if (campusId.HasValue)
                query = query.Where(x => x.CampusId == campusId.Value);

            if (itemCategoryId.HasValue)
                query = query.Where(x => x.ItemCategoryId == itemCategoryId.Value);

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<StudentLostReports?> GetByIdAsync(int id)
        {
            return await _db.StudentLostReports
                .Include(x => x.Campus)
                .Include(x => x.ItemCategory)
                .Include(x => x.Student)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
