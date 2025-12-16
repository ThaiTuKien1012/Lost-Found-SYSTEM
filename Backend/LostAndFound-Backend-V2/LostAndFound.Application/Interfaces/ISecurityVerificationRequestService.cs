using LostAndFound.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface ISecurityVerificationRequestService
    {
        Task<IEnumerable<SecurityVerificationRequests>> GetAllAsync();
        Task<SecurityVerificationRequests?> GetByIdAsync(int id);
        Task<SecurityVerificationRequests> CreateAsync(SecurityVerificationRequests request);
        Task<SecurityVerificationRequests?> UpdateStatusAsync(int id, string status);
    }
}