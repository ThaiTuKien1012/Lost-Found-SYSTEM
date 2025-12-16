using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Application.Dtos.Staff
{
    public class StaffFoundItemFilterDto
    {
        public int? CampusId { get; set; }
        public int? ItemCategoryId { get; set; }
        public string? Status { get; set; }
    }

    public class StaffFoundItemUpdateDto
    {
        public string? Description { get; set; }
        public string? StorageLocation { get; set; }
        public string? Status { get; set; }
    }

    public class StaffReceiveFoundItemDto
    {
        public int SecurityReceivedItemId { get; set; }
        public string StorageLocation { get; set; } = string.Empty;
    }

    public class StaffClaimFilterDto
    {
        public int? CampusId { get; set; }
        public string? Status { get; set; }
    }

    public class StaffClaimDecisionDto
    {
        public string? Note { get; set; }
    }

    public class StaffSecurityRequestCreateDto
    {
        public int ClaimId { get; set; }
    }

    public class StaffReturnItemCreateDto
    {
        public int FoundItemId { get; set; }
        public int ClaimId { get; set; }
        public string ConfirmedFullName { get; set; } = string.Empty;
        public string DocumentNumber { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}

