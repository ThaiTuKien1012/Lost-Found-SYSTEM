namespace LostAndFound.Application.DTOs
{
    public class StudentLostReportResponseDto
    {
        public int Id { get; set; }
        
        public int StudentId { get; set; }
        
        public string StudentName { get; set; } = null!;
        
        public int CampusId { get; set; }
        
        public string CampusName { get; set; } = null!;
        
        public int ItemCategoryId { get; set; }
        
        public string ItemCategoryName { get; set; } = null!;
        
        public string Title { get; set; } = null!;
        
        public string? Description { get; set; }
        
        public DateTime? LostTime { get; set; }
        
        public string? LostLocation { get; set; }
        
        public string Status { get; set; } = null!;
        
        public DateTime? CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        public string? ImageUrl { get; set; } // ← THÊM PROPERTY MỚI
    }
}