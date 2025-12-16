using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly LostAndFoundDbContext _db;

        public NotificationService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<Notifications> CreateAsync(Notifications notification)
        {
            notification.CreatedAt ??= DateTime.UtcNow;
            _db.Notifications.Add(notification);
            await _db.SaveChangesAsync();
            return notification;
        }

        public async Task<IEnumerable<Notifications>> GetByUserAsync(int userId, bool onlyUnread = false)
        {
            var query = _db.Notifications
                .AsNoTracking()
                .Where(n => n.UserId == userId);

            if (onlyUnread)
            {
                query = query.Where(n => !n.IsRead);
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var noti = await _db.Notifications.FindAsync(id);
            if (noti == null) return false;

            noti.IsRead = true;
            await _db.SaveChangesAsync();
            return true;
        }
    }
}

