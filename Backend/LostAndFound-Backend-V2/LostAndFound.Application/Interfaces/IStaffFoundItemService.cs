﻿using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.DTOs;
using LostAndFound.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface IStaffFoundItemService
    {
        Task<StaffFoundItems> ReceiveFromSecurityAsync(StaffReceiveFoundItemDto dto, int staffUserId);
        Task<StaffFoundItems?> GetByIdAsync(int id);
        Task<IList<StaffFoundItems>> GetListAsync(LostAndFound.Application.Dtos.Staff.StaffFoundItemFilterDto filter);
        Task<StaffFoundItems> UpdateAsync(int id, StaffFoundItemUpdateDto dto, int staffUserId);
        Task<string> UpdateImageUrlAsync(int id, string imageUrl, int staffUserId);
        Task<PaginatedResultDto<StaffFoundItemResponseDto>> GetFilteredAsync(LostAndFound.Application.DTOs.StaffFoundItemFilterDto filter);
        Task<StaffFoundItemResponseDto?> GetByIdDtoAsync(int id);
    }
}
