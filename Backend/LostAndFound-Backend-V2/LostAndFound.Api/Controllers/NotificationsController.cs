using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationsController(INotificationService service)
        {
            _service = service;
        }

        // GET: /api/Notifications?userId=1&onlyUnread=true
        [HttpGet]
        public async Task<IActionResult> GetByUser([FromQuery] int userId, [FromQuery] bool onlyUnread = false)
        {
            var data = await _service.GetByUserAsync(userId, onlyUnread);
            return Ok(data);
        }

        // POST: /api/Notifications
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Notifications notification)
        {
            var created = await _service.CreateAsync(notification);
            return CreatedAtAction(nameof(GetByUser), new { userId = created.UserId }, created);
        }

        // PUT: /api/Notifications/{id}/read
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var ok = await _service.MarkAsReadAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}

