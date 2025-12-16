namespace LostAndFound.Application.DTOs
{
    public class StaffFoundItemFilterDto
    {
        public int? CampusId { get; set; }
        
        public int? ItemCategoryId { get; set; }
        
        public string? Status { get; set; }
        
        public DateTime? FoundDateFrom { get; set; }
        
        public DateTime? FoundDateTo { get; set; }
        
        public int PageNumber { get; set; } = 1;
        
        public int PageSize { get; set; } = 10;
    }
}