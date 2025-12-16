using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface IStaffClaimService
    {
        Task<IList<StudentClaims>> GetClaimsAsync(StaffClaimFilterDto filter);
        Task<StudentClaims?> GetClaimByIdAsync(int id);
        Task ApproveClaimAsync(int claimId, int staffUserId, string? note);
        Task RejectClaimAsync(int claimId, int staffUserId, string? reason);
    }
}
