using LostAndFound.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface IStaffReturnReceiptService
    {
        Task<IEnumerable<StaffReturnReceipts>> GetAllAsync();
        Task<StaffReturnReceipts?> GetByIdAsync(int id);
        Task<StaffReturnReceipts> CreateAsync(StaffReturnReceipts receipt);
        Task<StaffReturnReceipts?> UpdateAsync(int id, StaffReturnReceipts receipt);
    }
}