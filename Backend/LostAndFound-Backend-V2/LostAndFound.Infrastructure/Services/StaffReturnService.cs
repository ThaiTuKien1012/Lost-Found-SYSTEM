using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class StaffReturnService : IStaffReturnService
    {
        private readonly LostAndFoundDbContext _db;

        public StaffReturnService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<StaffReturnReceipts> CreateReturnReceiptAsync(
            StaffReturnItemCreateDto dto,
            int staffUserId)
        {
            // 1. Lấy claim + include FoundItem & Student
            var claim = await _db.StudentClaims
                .Include(c => c.FoundItem)
                .Include(c => c.Student)
                .FirstOrDefaultAsync(c => c.Id == dto.ClaimId);

            if (claim == null)
                throw new KeyNotFoundException("Claim not found.");

            // 2. Check FoundItem có khớp với claim không
            if (claim.FoundItemId != dto.FoundItemId)
                throw new InvalidOperationException("Found item does not belong to this claim.");

            // 3. (Optional) chỉ cho trả đồ khi Security đã duyệt
            if (claim.Status != "APPROVED_BY_SECURITY")
                throw new InvalidOperationException("Claim must be approved by security before returning item.");

            // 4. Tạo record StaffReturnReceipts
            var receipt = new StaffReturnReceipts
            {
                ClaimId = dto.ClaimId,
                FoundItemId = dto.FoundItemId,
                StudentId = claim.StudentId,
                StaffId = staffUserId,
                SecurityId = null, // nếu sau này security phải ký nữa thì update sau
                ConfirmedFullName = dto.ConfirmedFullName,
                DocumentNumber = dto.DocumentNumber,
                PhoneNumber = dto.PhoneNumber,
                ReturnedAt = DateTime.UtcNow
            };

            _db.StaffReturnReceipts.Add(receipt);

            // 5. Cập nhật trạng thái FoundItem & Claim
            if (claim.FoundItem != null)
            {
                claim.FoundItem.Status = "RETURNED";
                claim.FoundItem.UpdatedAt = DateTime.UtcNow;
            }

            claim.Status = "CLOSED";
            claim.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return receipt;
        }
    }
}
