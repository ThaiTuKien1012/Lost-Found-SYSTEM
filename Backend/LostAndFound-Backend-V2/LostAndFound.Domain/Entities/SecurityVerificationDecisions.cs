using System;
using System.Collections.Generic;

namespace LostAndFound.Domain.Entities;

public partial class SecurityVerificationDecisions
{
    public int Id { get; set; }

    public int VerificationRequestId { get; set; }

    public int SecurityId { get; set; }

    public string Decision { get; set; } = null!;

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Users Security { get; set; } = null!;

    public virtual SecurityVerificationRequests VerificationRequest { get; set; } = null!;
}

