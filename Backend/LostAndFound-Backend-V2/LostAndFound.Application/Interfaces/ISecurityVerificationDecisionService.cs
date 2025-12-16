using LostAndFound.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface ISecurityVerificationDecisionService
    {
        Task<IEnumerable<SecurityVerificationDecisions>> GetAllAsync();
        Task<SecurityVerificationDecisions?> GetByIdAsync(int id);
        Task<SecurityVerificationDecisions> CreateAsync(SecurityVerificationDecisions decision);
        Task<SecurityVerificationDecisions?> UpdateAsync(int id, SecurityVerificationDecisions decision);
    }
}
