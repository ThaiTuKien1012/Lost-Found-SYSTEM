namespace LostAndFound.Application.DTOs
{
    public class CreateSecurityFoundItemDto
    {
        public int CampusId { get; set; }
        public int ItemCategoryId { get; set; }
        public string? Description { get; set; }
        public DateTime FoundTime { get; set; }
        public string FoundLocation { get; set; } = string.Empty;
    }
}

