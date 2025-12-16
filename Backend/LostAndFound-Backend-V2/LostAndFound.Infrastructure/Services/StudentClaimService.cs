using LostAndFound.Application.DTOs;
﻿using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LostAndFound.Infrastructure.Services
{
    public class StudentClaimService : IStudentClaimService
    {
        private readonly LostAndFoundDbContext _db;

        public StudentClaimService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        // Methods from HEAD (entity-based)
        public async Task<IEnumerable<StudentClaims>> GetAllAsync()
        {
            return await _db.StudentClaims.AsNoTracking().ToListAsync();
        }

        public async Task<StudentClaims?> GetByIdAsync(int id)
        {
            return await _db.StudentClaims.FindAsync(id);
        }

        public async Task<StudentClaims> CreateAsync(StudentClaims claim)
        {
            claim.CreatedAt = DateTime.UtcNow;
            claim.UpdatedAt = DateTime.UtcNow;
            claim.Status = "PENDING";
            _db.StudentClaims.Add(claim);
            await _db.SaveChangesAsync();
            return claim;
        }

        public async Task<StudentClaims?> UpdateStatusAsync(int id, string status)
        {
            var claim = await _db.StudentClaims.FindAsync(id);
            if (claim == null) return null;

            claim.Status = status;
            claim.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return claim;
        }

        // Methods from trunghqse170589- (DTO-based)
        public async Task<StudentClaimResponseDto> CreateClaimAsync(int studentId, StudentClaimCreateDto dto)
        {
            // ✅ Validate: FoundItem phải tồn tại
            var foundItem = await _db.StaffFoundItems
                .FirstOrDefaultAsync(f => f.Id == dto.FoundItemId);

            if (foundItem == null)
            {
                throw new InvalidOperationException("Đồ nhặt được không tồn tại");
            }

            // ✅ Validate: FoundItem phải có status 'available' (case-insensitive)
            if (foundItem.Status?.Equals("available", StringComparison.OrdinalIgnoreCase) != true)
            {
                throw new InvalidOperationException("Đồ này đã được claim hoặc không khả dụng");
            }

            // ✅ Validate: Student không thể claim cùng 1 item nhiều lần
            var existingClaim = await _db.StudentClaims
                .AnyAsync(c => c.StudentId == studentId 
                           && c.FoundItemId == dto.FoundItemId 
                           && c.Status.ToUpper() != "REJECTED");

            if (existingClaim)
            {
                throw new InvalidOperationException("Bạn đã claim đồ này rồi");
            }

            // ✅ Validate: CHỈ KHI có LostReportId → kiểm tra xem có thuộc về student này không
            if (dto.LostReportId.HasValue && dto.LostReportId.Value > 0)
            {
                var lostReport = await _db.StudentLostReports
                    .FirstOrDefaultAsync(r => r.Id == dto.LostReportId.Value && r.StudentId == studentId);

                if (lostReport == null)
                {
                    throw new InvalidOperationException("Báo cáo mất đồ không tồn tại hoặc không thuộc về bạn");
                }
            }

            // ✅ Tạo claim mới - STATUS = 'NEW'
            var claim = new StudentClaims
            {
                StudentId = studentId,
                FoundItemId = dto.FoundItemId,
                LostReportId = dto.LostReportId > 0 ? dto.LostReportId : null,
                Description = dto.Description.Trim(),
                EvidenceUrl = dto.EvidenceUrl?.Trim(),
                Status = "NEW", // ← THEO DB CONSTRAINT
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.StudentClaims.Add(claim);

            // ✅ Update FoundItem status → 'claimed'
            foundItem.Status = "claimed";
            foundItem.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // ✅ Reload với navigation properties
            return await GetClaimByIdAsync(claim.Id) 
                ?? throw new InvalidOperationException("Lỗi khi tạo claim");
        }

        public async Task<StudentClaimResponseDto?> GetClaimByIdAsync(int claimId)
        {
            return await _db.StudentClaims
                .AsNoTracking()
                .Where(c => c.Id == claimId)
                .Include(c => c.Student)
                .Include(c => c.FoundItem)
                .Include(c => c.LostReport)
                .Include(c => c.DecidedByStaffNavigation)
                .Select(c => new StudentClaimResponseDto
                {
                    Id = c.Id,
                    StudentId = c.StudentId,
                    StudentName = c.Student.FullName,
                    StudentEmail = c.Student.Email,
                    FoundItemId = c.FoundItemId,
                    FoundItemDescription = c.FoundItem.Description ?? "",
                    FoundItemLocation = c.FoundItem.FoundLocation,
                    LostReportId = c.LostReportId,
                    LostReportTitle = c.LostReport != null ? c.LostReport.Title : null,
                    Description = c.Description ?? "",
                    EvidenceUrl = c.EvidenceUrl,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    DecidedByStaff = c.DecidedByStaff,
                    DecidedByStaffName = c.DecidedByStaffNavigation != null ? c.DecidedByStaffNavigation.FullName : null,
                    DecidedAt = c.DecidedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<StudentClaimResponseDto>> GetMyClaimsAsync(int studentId)
        {
            return await _db.StudentClaims
                .AsNoTracking()
                .Where(c => c.StudentId == studentId)
                .Include(c => c.Student)
                .Include(c => c.FoundItem)
                .Include(c => c.LostReport)
                .Include(c => c.DecidedByStaffNavigation)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new StudentClaimResponseDto
                {
                    Id = c.Id,
                    StudentId = c.StudentId,
                    StudentName = c.Student.FullName,
                    StudentEmail = c.Student.Email,
                    FoundItemId = c.FoundItemId,
                    FoundItemDescription = c.FoundItem.Description ?? "",
                    FoundItemLocation = c.FoundItem.FoundLocation,
                    LostReportId = c.LostReportId,
                    LostReportTitle = c.LostReport != null ? c.LostReport.Title : null,
                    Description = c.Description ?? "",
                    EvidenceUrl = c.EvidenceUrl,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    DecidedByStaff = c.DecidedByStaff,
                    DecidedByStaffName = c.DecidedByStaffNavigation != null ? c.DecidedByStaffNavigation.FullName : null,
                    DecidedAt = c.DecidedAt
                })
                .ToListAsync();
        }

        public async Task<bool> CancelClaimAsync(int claimId, int studentId)
        {
            var claim = await _db.StudentClaims
                .Include(c => c.FoundItem)
                .FirstOrDefaultAsync(c => c.Id == claimId && c.StudentId == studentId);

            if (claim == null)
            {
                return false;
            }

            // ✅ Chỉ cho phép cancel nếu status = 'NEW' hoặc 'UNDER_REVIEW'
            if (!claim.Status.Equals("NEW", StringComparison.OrdinalIgnoreCase) 
                && !claim.Status.Equals("UNDER_REVIEW", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Chỉ có thể hủy claim đang ở trạng thái NEW hoặc UNDER_REVIEW");
            }

            // ✅ Update claim status → 'REJECTED'
            claim.Status = "REJECTED";
            claim.UpdatedAt = DateTime.UtcNow;

            // ✅ Trả FoundItem về trạng thái 'available'
            if (claim.FoundItem != null)
            {
                claim.FoundItem.Status = "available";
                claim.FoundItem.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckItemAvailabilityAsync(int foundItemId)
        {
            var item = await _db.StaffFoundItems
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == foundItemId);

            return item != null && item.Status?.Equals("available", StringComparison.OrdinalIgnoreCase) == true;
        }
    }
}
