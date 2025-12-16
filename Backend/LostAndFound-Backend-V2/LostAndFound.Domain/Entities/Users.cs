using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class Users
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string? StudentCode { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<SecurityReceivedItems> SecurityReceivedItems { get; set; } = new List<SecurityReceivedItems>();

    public virtual ICollection<SecurityVerificationDecisions> SecurityVerificationDecisions { get; set; } = new List<SecurityVerificationDecisions>();

    public virtual ICollection<SecurityVerificationRequests> SecurityVerificationRequests { get; set; } = new List<SecurityVerificationRequests>();

    public virtual ICollection<StaffFoundItems> StaffFoundItems { get; set; } = new List<StaffFoundItems>();

    public virtual ICollection<StaffReturnReceipts> StaffReturnReceiptsSecurity { get; set; } = new List<StaffReturnReceipts>();

    public virtual ICollection<StaffReturnReceipts> StaffReturnReceiptsStaff { get; set; } = new List<StaffReturnReceipts>();

    public virtual ICollection<StaffReturnReceipts> StaffReturnReceiptsStudent { get; set; } = new List<StaffReturnReceipts>();

    public virtual ICollection<StudentClaims> StudentClaimsDecidedByStaffNavigation { get; set; } = new List<StudentClaims>();

    public virtual ICollection<StudentClaims> StudentClaimsStudent { get; set; } = new List<StudentClaims>();

    public virtual ICollection<StudentLostReports> StudentLostReports { get; set; } = new List<StudentLostReports>();
}
