using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class StaffFoundItems
{
    public int Id { get; set; }

    public int CampusId { get; set; }

    public int ItemCategoryId { get; set; }

    public int? CreatedByStaff { get; set; }

    public string Source { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime FoundTime { get; set; }

    public string FoundLocation { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string? StorageLocation { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Campus Campus { get; set; } = null!;

    public virtual Users? CreatedByStaffNavigation { get; set; }

    public virtual ItemCategories ItemCategory { get; set; } = null!;

    public virtual ICollection<StaffReturnReceipts> StaffReturnReceipts { get; set; } = new List<StaffReturnReceipts>();

    public virtual ICollection<StudentClaims> StudentClaims { get; set; } = new List<StudentClaims>();
}
