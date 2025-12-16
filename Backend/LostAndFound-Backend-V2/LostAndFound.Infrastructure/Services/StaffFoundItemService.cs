﻿using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class StaffFoundItemService : IStaffFoundItemService
    {
        private readonly LostAndFoundDbContext _db;

        public StaffFoundItemService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<StaffFoundItems> ReceiveFromSecurityAsync(StaffReceiveFoundItemDto dto, int staffUserId)
        {
            var securityItem = await _db.SecurityReceivedItems
                .FirstOrDefaultAsync(x => x.Id == dto.SecurityReceivedItemId);

            if (securityItem == null)
                throw new KeyNotFoundException("Security received item not found.");

            // tạo FoundItem mới
            var found = new StaffFoundItems
            {
                CampusId = securityItem.CampusId,
                ItemCategoryId = securityItem.ItemCategoryId,
                Description = securityItem.Description,
                FoundLocation = securityItem.FoundLocation,
                FoundTime = securityItem.FoundTime,
                Status = "STORED_AT_OFFICE",
                StorageLocation = dto.StorageLocation,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedByStaff = staffUserId,
                Source = "SECURITY",
                ImageUrl = securityItem.ImageUrl
            };

            _db.StaffFoundItems.Add(found);
            await _db.SaveChangesAsync();

            return found;
        }

        public async Task<StaffFoundItems?> GetByIdAsync(int id)
        {
            return await _db.StaffFoundItems
                .Include(x => x.Campus)
                .Include(x => x.ItemCategory)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IList<StaffFoundItems>> GetListAsync(LostAndFound.Application.Dtos.Staff.StaffFoundItemFilterDto filter)
        {
            var query = _db.StaffFoundItems
                .Include(x => x.Campus)
                .Include(x => x.ItemCategory)
                .AsQueryable();

            if (filter.CampusId.HasValue)
                query = query.Where(x => x.CampusId == filter.CampusId.Value);

            if (filter.ItemCategoryId.HasValue)
                query = query.Where(x => x.ItemCategoryId == filter.ItemCategoryId.Value);

            if (!string.IsNullOrWhiteSpace(filter.Status))
                query = query.Where(x => x.Status == filter.Status);

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<StaffFoundItems> UpdateAsync(int id, StaffFoundItemUpdateDto dto, int staffUserId)
        {
            var found = await _db.StaffFoundItems.FindAsync(id);
            if (found == null)
                throw new KeyNotFoundException("Found item not found.");

            if (!string.IsNullOrWhiteSpace(dto.Description))
                found.Description = dto.Description;

            if (!string.IsNullOrWhiteSpace(dto.StorageLocation))
                found.StorageLocation = dto.StorageLocation;

            if (!string.IsNullOrWhiteSpace(dto.Status))
                found.Status = dto.Status;

            found.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return found;
        }

        public async Task<string> UpdateImageUrlAsync(int id, string imageUrl, int staffUserId)
        {
            var found = await _db.StaffFoundItems.FindAsync(id);
            if (found == null)
                throw new KeyNotFoundException("Found item not found.");

            found.ImageUrl = imageUrl;
            found.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return imageUrl;
        }

        public async Task<PaginatedResultDto<StaffFoundItemResponseDto>> GetFilteredAsync(LostAndFound.Application.DTOs.StaffFoundItemFilterDto filter)
        {
            // Query base
            var query = _db.StaffFoundItems
                .AsNoTracking()
                .Include(f => f.Campus)
                .Include(f => f.ItemCategory)
                .Include(f => f.CreatedByStaffNavigation)
                .AsQueryable();

            // Apply filters
            if (filter.CampusId.HasValue)
            {
                query = query.Where(f => f.CampusId == filter.CampusId.Value);
            }

            if (filter.ItemCategoryId.HasValue)
            {
                query = query.Where(f => f.ItemCategoryId == filter.ItemCategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(f => f.Status == filter.Status.ToUpper());
            }

            if (filter.FoundDateFrom.HasValue)
            {
                query = query.Where(f => f.FoundTime >= filter.FoundDateFrom.Value);
            }

            if (filter.FoundDateTo.HasValue)
            {
                query = query.Where(f => f.FoundTime <= filter.FoundDateTo.Value);
            }

            // Order by newest first
            query = query.OrderByDescending(f => f.CreatedAt);

            // Count total
            var totalRecords = await query.CountAsync();

            // Validate pagination
            if (filter.PageNumber < 1) filter.PageNumber = 1;
            if (filter.PageSize < 1) filter.PageSize = 10;
            if (filter.PageSize > 50) filter.PageSize = 50; // Max 50 items per page

            var totalPages = (int)Math.Ceiling(totalRecords / (double)filter.PageSize);

            // Apply pagination
            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(f => new StaffFoundItemResponseDto
                {
                    Id = f.Id,
                    CampusId = f.CampusId,
                    CampusName = f.Campus.Name,
                    ItemCategoryId = f.ItemCategoryId,
                    ItemCategoryName = f.ItemCategory.Name,
                    CreatedByStaff = f.CreatedByStaff,
                    CreatedByStaffName = f.CreatedByStaffNavigation != null ? f.CreatedByStaffNavigation.FullName : null,
                    Source = f.Source,
                    Description = f.Description,
                    FoundTime = f.FoundTime,
                    FoundLocation = f.FoundLocation,
                    Status = f.Status,
                    StorageLocation = f.StorageLocation,
                    ImageUrl = f.ImageUrl,
                    CreatedAt = f.CreatedAt,
                    UpdatedAt = f.UpdatedAt
                })
                .ToListAsync();

            return new PaginatedResultDto<StaffFoundItemResponseDto>
            {
                Data = items,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalRecords = totalRecords,
                TotalPages = totalPages,
                HasPreviousPage = filter.PageNumber > 1,
                HasNextPage = filter.PageNumber < totalPages
            };
        }

        public async Task<StaffFoundItemResponseDto?> GetByIdDtoAsync(int id)
        {
            return await _db.StaffFoundItems
                .AsNoTracking()
                .Include(f => f.Campus)
                .Include(f => f.ItemCategory)
                .Include(f => f.CreatedByStaffNavigation)
                .Where(f => f.Id == id)
                .Select(f => new StaffFoundItemResponseDto
                {
                    Id = f.Id,
                    CampusId = f.CampusId,
                    CampusName = f.Campus.Name,
                    ItemCategoryId = f.ItemCategoryId,
                    ItemCategoryName = f.ItemCategory.Name,
                    CreatedByStaff = f.CreatedByStaff,
                    CreatedByStaffName = f.CreatedByStaffNavigation != null ? f.CreatedByStaffNavigation.FullName : null,
                    Source = f.Source,
                    Description = f.Description,
                    FoundTime = f.FoundTime,
                    FoundLocation = f.FoundLocation,
                    Status = f.Status,
                    StorageLocation = f.StorageLocation,
                    ImageUrl = f.ImageUrl,
                    CreatedAt = f.CreatedAt,
                    UpdatedAt = f.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }
    }
}
