using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class SecurityReceivedItems
{
    public int Id { get; set; }

    public int CampusId { get; set; }

    public int ItemCategoryId { get; set; }

    public int SecurityId { get; set; }

    public string? Description { get; set; }

    public DateTime FoundTime { get; set; }

    public string FoundLocation { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Campus Campus { get; set; } = null!;

    public virtual ItemCategories ItemCategory { get; set; } = null!;

    public virtual Users Security { get; set; } = null!;
}
