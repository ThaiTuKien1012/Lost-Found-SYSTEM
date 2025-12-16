using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Domain.Entities
{
    public class SecurityReceivedItem
    {
        public int Id { get; set; }

        public int CampusId { get; set; }
        public int ItemCategoryId { get; set; }
        public int SecurityId { get; set; }

        public string Description { get; set; }
        public DateTime FoundTime { get; set; }
        public string FoundLocation { get; set; }

        public ReceivedItemStatus Status { get; set; } = ReceivedItemStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties (optional)
        public Campus Campus { get; set; }
        
    }

    public enum ReceivedItemStatus
    {
        Pending = 1,
        Success = 2,
        UnSuccess = 3
    }
}

