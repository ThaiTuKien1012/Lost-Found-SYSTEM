namespace LostAndFound.Application.DTOs;

public class StudentLostReportCreateRequestDto
{
    public string ItemName { get; set; } = null!; // Frontend gửi itemName
    public string Description { get; set; } = null!;
    public string Category { get; set; } = null!; // Frontend gửi category name (PHONE, LAPTOP, etc.)
    public string? Color { get; set; }
    public DateTime? DateLost { get; set; } // Frontend gửi dateLost
    public string? LocationLost { get; set; } // Frontend gửi locationLost
    public string Campus { get; set; } = null!; // Frontend gửi campus code (NVH, SHTP)
    public string? Phone { get; set; }
    public List<string>? Images { get; set; } // Frontend gửi mảng images
}

