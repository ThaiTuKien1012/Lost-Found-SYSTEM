namespace LostAndFound.Application.DTOs
{
    public class StudentLostReportCreateDto
    {
        public int CampusId { get; set; }
        
        public int ItemCategoryId { get; set; }
        
        public string Title { get; set; } = null!;
        
        public string? Description { get; set; }
        
        public DateTime? LostTime { get; set; }
        
        public string? LostLocation { get; set; }
        
        public string? ImageUrl { get; set; } // ← THÊM PROPERTY MỚI
    }
}