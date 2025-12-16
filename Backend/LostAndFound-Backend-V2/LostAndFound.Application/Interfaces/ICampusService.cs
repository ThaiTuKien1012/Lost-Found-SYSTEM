using LostAndFound.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface ICampusService
    {
        Task<IEnumerable<Campus>> GetAllAsync();
        Task<Campus?> GetByIdAsync(int id);
        Task<Campus> CreateAsync(Campus campus);
        Task<Campus?> UpdateAsync(int id, Campus campus);
        Task<bool> DeleteAsync(int id);
    }
}

