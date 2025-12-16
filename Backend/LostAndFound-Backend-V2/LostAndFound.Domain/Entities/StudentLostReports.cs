using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class StudentLostReports
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int CampusId { get; set; }

    public int ItemCategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? LostTime { get; set; }

    public string? LostLocation { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? ImageUrl { get; set; } // ← THÊM PROPERTY MỚI

    public virtual Campus Campus { get; set; } = null!;

    public virtual ItemCategories ItemCategory { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;

    public virtual ICollection<StudentClaims> StudentClaims { get; set; } = new List<StudentClaims>();
}
