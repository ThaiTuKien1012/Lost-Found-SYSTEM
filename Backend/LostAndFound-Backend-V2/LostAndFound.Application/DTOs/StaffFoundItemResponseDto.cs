namespace LostAndFound.Application.DTOs
{
    public class StaffFoundItemResponseDto
    {
        public int Id { get; set; }
        
        public int CampusId { get; set; }
        
        public string CampusName { get; set; } = null!;
        
        public int ItemCategoryId { get; set; }
        
        public string ItemCategoryName { get; set; } = null!;
        
        public int? CreatedByStaff { get; set; }
        
        public string? CreatedByStaffName { get; set; }
        
        public string Source { get; set; } = null!;
        
        public string? Description { get; set; }
        
        public DateTime FoundTime { get; set; }
        
        public string FoundLocation { get; set; } = null!;
        
        public string Status { get; set; } = null!;
        
        public string? StorageLocation { get; set; }
        
        public string? ImageUrl { get; set; }
        
        public DateTime? CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
    }
}