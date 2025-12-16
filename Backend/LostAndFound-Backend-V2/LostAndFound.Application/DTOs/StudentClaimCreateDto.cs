namespace LostAndFound.Application.DTOs
{
    public class StudentClaimCreateDto
    {
        public int FoundItemId { get; set; }
        
        public int? LostReportId { get; set; }
        
        public string Description { get; set; } = null!;
        
        public string? EvidenceUrl { get; set; }
    }
}