namespace LostAndFound.Application.DTOs
{
    public class SecurityFoundItemResponseDto
    {
        public int Id { get; set; }
        public int CampusId { get; set; }
        public string? CampusName { get; set; }
        public int ItemCategoryId { get; set; }
        public string? ItemCategoryName { get; set; }
        public int SecurityId { get; set; }
        public string? SecurityName { get; set; }
        public string? Description { get; set; }
        public DateTime FoundTime { get; set; }
        public string FoundLocation { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

