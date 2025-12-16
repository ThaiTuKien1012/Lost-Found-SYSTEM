using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class StudentClaims
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int FoundItemId { get; set; }

    public int? LostReportId { get; set; }

    public string? Description { get; set; }

    public string? EvidenceUrl { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? DecidedByStaff { get; set; }

    public DateTime? DecidedAt { get; set; }

    public virtual Users? DecidedByStaffNavigation { get; set; }

    public virtual StaffFoundItems FoundItem { get; set; } = null!;

    public virtual StudentLostReports? LostReport { get; set; }

    public virtual ICollection<SecurityVerificationRequests> SecurityVerificationRequests { get; set; } = new List<SecurityVerificationRequests>();

    public virtual ICollection<StaffReturnReceipts> StaffReturnReceipts { get; set; } = new List<StaffReturnReceipts>();

    public virtual Users Student { get; set; } = null!;
}
