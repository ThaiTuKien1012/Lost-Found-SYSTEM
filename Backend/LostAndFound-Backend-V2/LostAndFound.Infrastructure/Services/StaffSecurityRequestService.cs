using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class StaffSecurityRequestService : IStaffSecurityRequestService
    {
        private readonly LostAndFoundDbContext _db;

        public StaffSecurityRequestService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<SecurityVerificationRequests> CreateSecurityRequestAsync(
            StaffSecurityRequestCreateDto dto,
            int staffUserId)
        {
            // 1. Tìm Claim
            var claim = await _db.StudentClaims
                .Include(c => c.FoundItem)
                .FirstOrDefaultAsync(c => c.Id == dto.ClaimId);

            if (claim == null)
                throw new KeyNotFoundException("Claim not found.");

            // (Optional) chỉ cho phép tạo request nếu claim đã được staff approve
            if (claim.Status != "APPROVED_BY_STAFF")
                throw new InvalidOperationException("Claim must be approved by staff before requesting security verification.");

            // 2. Check đã có request cho claim này chưa
            var existed = await _db.SecurityVerificationRequests
                .AnyAsync(r => r.ClaimId == dto.ClaimId);

            if (existed)
                throw new InvalidOperationException("Security verification request already exists for this claim.");

            // 3. Tạo mới SecurityVerificationRequest
            var request = new SecurityVerificationRequests
            {
                ClaimId = dto.ClaimId,
                RequestedByStaffId = staffUserId,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.SecurityVerificationRequests.Add(request);

            // 4. Cập nhật trạng thái Claim (nếu muốn)
            claim.Status = "WAITING_SECURITY_VERIFICATION";
            claim.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return request;
        }
    }
}
