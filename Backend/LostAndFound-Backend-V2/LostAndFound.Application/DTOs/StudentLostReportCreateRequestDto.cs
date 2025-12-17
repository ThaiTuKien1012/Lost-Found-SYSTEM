using System.Text.Json.Serialization;

namespace LostAndFound.Application.DTOs;

public class StudentLostReportCreateRequestDto
{
    [JsonPropertyName("itemName")]
    public string ItemName { get; set; } = null!; // Frontend gửi itemName
    
    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;
    
    [JsonPropertyName("category")]
    public string Category { get; set; } = null!; // Frontend gửi category name (PHONE, LAPTOP, etc.)
    
    [JsonPropertyName("color")]
    public string? Color { get; set; }
    
    [JsonPropertyName("dateLost")]
    public DateTime? DateLost { get; set; } // Frontend gửi dateLost
    
    [JsonPropertyName("locationLost")]
    public string? LocationLost { get; set; } // Frontend gửi locationLost
    
    [JsonPropertyName("campus")]
    public string Campus { get; set; } = null!; // Frontend gửi campus code (NVH, SHTP)
    
    [JsonPropertyName("phone")]
    public string? Phone { get; set; }
    
    [JsonPropertyName("images")]
    public List<string>? Images { get; set; } // Frontend gửi mảng images
}

