using LostAndFound.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface INotificationService
    {
        Task<Notifications> CreateAsync(Notifications notification);
        Task<IEnumerable<Notifications>> GetByUserAsync(int userId, bool onlyUnread = false);
        Task<bool> MarkAsReadAsync(int id);
    }
}

