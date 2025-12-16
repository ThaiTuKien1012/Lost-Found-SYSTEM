using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface IStaffSecurityRequestService
    {
        Task<SecurityVerificationRequests> CreateSecurityRequestAsync(StaffSecurityRequestCreateDto dto, int staffUserId);
    }
}
