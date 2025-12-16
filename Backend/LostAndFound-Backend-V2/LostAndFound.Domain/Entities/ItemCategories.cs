using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class ItemCategories
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<SecurityReceivedItems> SecurityReceivedItems { get; set; } = new List<SecurityReceivedItems>();

    public virtual ICollection<StaffFoundItems> StaffFoundItems { get; set; } = new List<StaffFoundItems>();

    public virtual ICollection<StudentLostReports> StudentLostReports { get; set; } = new List<StudentLostReports>();
}
