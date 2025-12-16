using LostAndFound.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface ISecurityReceivedItemService
    {
        Task<IEnumerable<SecurityReceivedItems>> GetAllAsync();
        Task<SecurityReceivedItems?> GetByIdAsync(int id);
        Task<SecurityReceivedItems> CreateAsync(SecurityReceivedItems item);
        Task<SecurityReceivedItems?> UpdateStatusAsync(int id, string status);
    }
}