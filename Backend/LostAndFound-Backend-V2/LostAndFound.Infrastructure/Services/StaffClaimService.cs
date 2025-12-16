using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class StaffClaimService : IStaffClaimService
    {
        private readonly LostAndFoundDbContext _db;

        public StaffClaimService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IList<StudentClaims>> GetClaimsAsync(StaffClaimFilterDto filter)
        {
            var query = _db.StudentClaims
                .Include(c => c.FoundItem)
                    .ThenInclude(fi => fi.Campus)
                .Include(c => c.Student)
                .Include(c => c.LostReport)
                .AsQueryable();

            if (filter.CampusId.HasValue)
            {
                query = query.Where(c =>
                    c.FoundItem != null &&
                    c.FoundItem.CampusId == filter.CampusId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(c => c.Status == filter.Status);
            }

            return await query
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<StudentClaims?> GetClaimByIdAsync(int id)
        {
            return await _db.StudentClaims
                .Include(c => c.FoundItem)
                    .ThenInclude(fi => fi.Campus)
                .Include(c => c.Student)
                .Include(c => c.LostReport)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task ApproveClaimAsync(int claimId, int staffUserId, string? note)
        {
            var claim = await _db.StudentClaims
                .Include(c => c.FoundItem)
                .FirstOrDefaultAsync(c => c.Id == claimId);

            if (claim == null)
                throw new KeyNotFoundException("Claim not found.");

            if (claim.Status != "PENDING")
                throw new InvalidOperationException("Only PENDING claims can be approved by staff.");

            claim.Status = "APPROVED_BY_STAFF";
            claim.DecidedAt = DateTime.UtcNow;
            claim.DecidedByStaff = staffUserId;
            claim.UpdatedAt = DateTime.UtcNow;

            // nếu muốn lưu note thì có thể append vào Description
            if (!string.IsNullOrWhiteSpace(note))
            {
                claim.Description = (claim.Description ?? "") + $"\n[STAFF NOTE] {note}";
            }

            if (claim.FoundItem != null)
            {
                claim.FoundItem.Status = "WAITING_SECURITY_VERIFICATION";
                claim.FoundItem.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
        }

        public async Task RejectClaimAsync(int claimId, int staffUserId, string? reason)
        {
            var claim = await _db.StudentClaims
                .Include(c => c.FoundItem)
                .FirstOrDefaultAsync(c => c.Id == claimId);

            if (claim == null)
                throw new KeyNotFoundException("Claim not found.");

            if (claim.Status != "PENDING")
                throw new InvalidOperationException("Only PENDING claims can be rejected by staff.");

            claim.Status = "REJECTED_BY_STAFF";
            claim.DecidedAt = DateTime.UtcNow;
            claim.DecidedByStaff = staffUserId;
            claim.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(reason))
            {
                claim.Description = (claim.Description ?? "") + $"\n[STAFF REJECT REASON] {reason}";
            }

            await _db.SaveChangesAsync();
        }
    }
}
