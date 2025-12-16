namespace LostAndFound.Application.DTOs
{
    public class StudentClaimResponseDto
    {
        public int Id { get; set; }
        
        public int StudentId { get; set; }
        
        public string StudentName { get; set; } = null!;
        
        public string StudentEmail { get; set; } = null!;
        
        public int FoundItemId { get; set; }
        
        public string FoundItemDescription { get; set; } = null!;
        
        public string FoundItemLocation { get; set; } = null!;
        
        public int? LostReportId { get; set; }
        
        public string? LostReportTitle { get; set; }
        
        public string Description { get; set; } = null!;
        
        public string? EvidenceUrl { get; set; }
        
        public string Status { get; set; } = null!;
        
        public DateTime? CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        public int? DecidedByStaff { get; set; }
        
        public string? DecidedByStaffName { get; set; }
        
        public DateTime? DecidedAt { get; set; }
    }
}