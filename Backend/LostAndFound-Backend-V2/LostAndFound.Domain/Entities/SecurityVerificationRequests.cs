using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class SecurityVerificationRequests
{
    public int Id { get; set; }

    public int ClaimId { get; set; }

    public int RequestedByStaffId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual StudentClaims Claim { get; set; } = null!;

    public virtual Users RequestedByStaff { get; set; } = null!;

    public virtual ICollection<SecurityVerificationDecisions> SecurityVerificationDecisions { get; set; } = new List<SecurityVerificationDecisions>();
}
