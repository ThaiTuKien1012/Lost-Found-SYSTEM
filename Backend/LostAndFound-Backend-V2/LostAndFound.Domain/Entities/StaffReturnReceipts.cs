using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class StaffReturnReceipts
{
    public int Id { get; set; }

    public int ClaimId { get; set; }

    public int FoundItemId { get; set; }

    public int StaffId { get; set; }

    public int StudentId { get; set; }

    public int? SecurityId { get; set; }

    public string ConfirmedFullName { get; set; } = null!;

    public string? DocumentNumber { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime? ReturnedAt { get; set; }

    public virtual StudentClaims Claim { get; set; } = null!;

    public virtual StaffFoundItems FoundItem { get; set; } = null!;

    public virtual Users? Security { get; set; }

    public virtual Users Staff { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;
}
